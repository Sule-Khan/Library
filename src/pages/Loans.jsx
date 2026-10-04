import { useState } from 'react'
import { api, useAsync } from '../api.js'
import { Btn, DueStamp, Field, Loading, Modal, PageHeader, Table, inputCls } from '../ui.jsx'

const tabs = ['All', 'On loan', 'Overdue', 'Returned']

export default function Loans() {
  const loans = useAsync(api.loans)
  const books = useAsync(api.books)
  const members = useAsync(api.members)
  const [tab, setTab] = useState('All')
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState('')
  if (!loans.data || !books.data || !members.data) return <Loading error={loans.error || books.error || members.error} />

  const refresh = () => { loans.reload(); books.reload() }
  const rows = loans.data.filter((l) =>
    tab === 'All' ? true : tab === 'Returned' ? l.returnedOn : tab === 'Overdue' ? l.overdue : !l.returnedOn)
  const available = books.data.filter((b) => b.available > 0)

  const borrow = async (e) => {
    e.preventDefault(); setMsg('')
    try { await api.borrow(form.bookId, form.memberId); setForm(null); refresh() } catch (err) { setMsg(err.message) }
  }
  const giveBack = async (l) => {
    try { await api.returnLoan(l.id); refresh() } catch (err) { setMsg(err.message) }
  }

  return (
    <>
      <PageHeader title="Loans" note="Lend a book, or check one back in." action={
        <Btn onClick={() => { setMsg(''); setForm({ bookId: available[0]?.id || '', memberId: members.data[0]?.id || '' }) }}>Lend a book</Btn>} />
      <div className="mb-4 flex gap-1" role="tablist">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm ${tab === t ? 'bg-ink text-white' : 'text-muted hover:bg-white'}`}>{t}</button>
        ))}
      </div>
      {msg && <p role="alert" className="mb-3 text-sm text-late">{msg}</p>}
      <Table
        empty="No loans in this view."
        rows={rows}
        cols={[
          { label: 'Book', render: (l) => <span className="font-medium">{l.bookTitle}</span> },
          { label: 'Member', key: 'memberName' },
          { label: 'Borrowed', key: 'borrowedOn' },
          { label: 'Status', render: (l) => <DueStamp loan={l} /> },
          { label: '', render: (l) => !l.returnedOn && <Btn kind="ghost" onClick={() => giveBack(l)}>Check in</Btn> },
        ]}
      />
      {form && (
        <Modal title="Lend a book" onClose={() => setForm(null)}>
          <form onSubmit={borrow} className="space-y-3">
            <Field label="Book">
              <select required className={inputCls} value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })}>
                {available.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.available} left)</option>)}
              </select>
            </Field>
            <Field label="Member">
              <select required className={inputCls} value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                {members.data.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <p className="text-sm text-muted">Loans are due back after 14 days.</p>
            {msg && <p role="alert" className="text-sm text-late">{msg}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Btn type="button" kind="ghost" onClick={() => setForm(null)}>Cancel</Btn>
              <Btn disabled={!available.length}>Lend book</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
