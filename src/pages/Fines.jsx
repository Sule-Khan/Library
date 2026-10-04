import { useState } from 'react'
import { FINE_PER_DAY, api, useAsync } from '../api.js'
import { Btn, Loading, PageHeader, Table, money } from '../ui.jsx'

export default function Fines() {
  const { data, error, reload } = useAsync(api.fines)
  const [msg, setMsg] = useState('')
  if (!data) return <Loading error={error} />

  const owed = data.filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0)
  const pay = async (f) => {
    try { await api.payFine(f.id); reload() } catch (err) { setMsg(err.message) }
  }
  return (
    <>
      <PageHeader title="Fines" note={`${money(FINE_PER_DAY)} per day late. ${money(owed)} currently unpaid.`} />
      {msg && <p role="alert" className="mb-3 text-sm text-late">{msg}</p>}
      <Table
        empty="No fines. Every book came back on time."
        rows={data}
        cols={[
          { label: 'Member', render: (f) => <span className="font-medium">{f.memberName}</span> },
          { label: 'Book', key: 'bookTitle' },
          { label: 'Days late', key: 'days' },
          { label: 'Amount', render: (f) => money(f.amount) },
          { label: 'Status', render: (f) => <span className={f.paid ? 'text-ok' : 'text-late'}>{f.paid ? 'Paid' : 'Unpaid'}</span> },
          { label: '', render: (f) => !f.paid && <Btn kind="ghost" onClick={() => pay(f)}>Mark paid</Btn> },
        ]}
      />
    </>
  )
}
