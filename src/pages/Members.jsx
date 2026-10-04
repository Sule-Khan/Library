import { useState } from 'react'
import { api, useAsync } from '../api.js'
import { Btn, Field, Loading, Modal, PageHeader, Table, inputCls } from '../ui.jsx'

export default function Members() {
  const { data, error, reload } = useAsync(api.members)
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState('')
  if (!data) return <Loading error={error} />

  const save = async (e) => {
    e.preventDefault()
    try { await api.addMember(form); setForm(null); reload() } catch (err) { setMsg(err.message) }
  }
  return (
    <>
      <PageHeader title="Members" note={`${data.length} registered members`} action={<Btn onClick={() => setForm({ name: '', email: '' })}>Add member</Btn>} />
      {msg && <p role="alert" className="mb-3 text-sm text-late">{msg}</p>}
      <Table
        empty="No members yet. Add the first one to start lending."
        rows={data}
        cols={[
          { label: 'Name', render: (m) => <span className="font-medium">{m.name}</span> },
          { label: 'Email', key: 'email' },
          { label: 'Joined', key: 'joined' },
        ]}
      />
      {form && (
        <Modal title="Add member" onClose={() => setForm(null)}>
          <form onSubmit={save} className="space-y-3">
            <Field label="Full name"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><input type="email" required className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 pt-2">
              <Btn type="button" kind="ghost" onClick={() => setForm(null)}>Cancel</Btn>
              <Btn>Add member</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
