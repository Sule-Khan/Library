import { useState } from 'react'
import { api, useAsync } from '../api.js'
import { Btn, Field, Loading, Modal, PageHeader, Table, inputCls } from '../ui.jsx'

const blank = { title: '', author: '', isbn: '', genre: 'Fiction', copies: 1 }
const genres = ['Fiction', 'Technology', 'Science', 'History', 'Biography', 'Children']

export default function Books() {
  const { data, error, reload } = useAsync(api.books)
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState('')
  if (!data) return <Loading error={error} />

  const rows = data.filter((b) => `${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(q.toLowerCase()))
  const save = async (e) => {
    e.preventDefault()
    try { await api.addBook(form); setForm(null); reload() } catch (err) { setMsg(err.message) }
  }
  const remove = async (b) => {
    if (!confirm(`Remove "${b.title}" from the catalogue?`)) return
    try { await api.deleteBook(b.id); reload() } catch (err) { setMsg(err.message) }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <PageHeader title="Books" note={`${data.length} titles in the catalogue`} action={<Btn onClick={() => { setMsg(''); setForm(blank) }}>Add book</Btn>} />
      <input aria-label="Search books" placeholder="Search by title, author or ISBN" className={`${inputCls} mb-4 max-w-sm`} value={q} onChange={(e) => setQ(e.target.value)} />
      {msg && <p role="alert" className="mb-3 text-sm text-late">{msg}</p>}
      <Table
        empty="No books match your search."
        rows={rows}
        cols={[
          { label: 'Title', render: (b) => <span className="font-medium">{b.title}</span> },
          { label: 'Author', key: 'author' },
          { label: 'Genre', key: 'genre' },
          { label: 'ISBN', render: (b) => <span className="font-mono text-xs">{b.isbn}</span> },
          { label: 'Available', render: (b) => <span className={b.available ? '' : 'text-late'}>{b.available} of {b.copies}</span> },
          { label: '', render: (b) => <Btn kind="danger" onClick={() => remove(b)}>Remove</Btn> },
        ]}
      />
      {form && (
        <Modal title="Add book" onClose={() => setForm(null)}>
          <form onSubmit={save} className="space-y-3">
            <Field label="Title"><input required className={inputCls} value={form.title} onChange={set('title')} /></Field>
            <Field label="Author"><input required className={inputCls} value={form.author} onChange={set('author')} /></Field>
            <Field label="ISBN"><input required className={inputCls} value={form.isbn} onChange={set('isbn')} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Genre">
                <select className={inputCls} value={form.genre} onChange={set('genre')}>{genres.map((g) => <option key={g}>{g}</option>)}</select>
              </Field>
              <Field label="Copies"><input type="number" min="1" required className={inputCls} value={form.copies} onChange={set('copies')} /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn type="button" kind="ghost" onClick={() => setForm(null)}>Cancel</Btn>
              <Btn>Add book</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
