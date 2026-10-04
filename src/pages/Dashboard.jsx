import { api, useAsync } from '../api.js'
import { DueStamp, Loading, PageHeader, Table, money } from '../ui.jsx'

export default function Dashboard() {
  const s = useAsync(api.summary)
  const l = useAsync(api.loans)
  if (!s.data || !l.data) return <Loading error={s.error || l.error} />
  const d = s.data
  const figures = [
    ['Books', d.books], ['Members', d.members], ['On loan', d.activeLoans],
    ['Overdue', d.overdue], ['Unpaid fines', money(d.unpaidFines)],
  ]
  const open = l.data.filter((x) => !x.returnedOn).sort((a, b) => a.dueOn.localeCompare(b.dueOn))
  return (
    <>
      <PageHeader title="Dashboard" note="What needs attention at the desk today." />
      <dl className="mb-8 grid grid-cols-2 divide-rule rounded-lg border border-rule bg-card sm:grid-cols-5 sm:divide-x">
        {figures.map(([label, value]) => (
          <div key={label} className="p-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className={`font-display text-2xl font-semibold ${label === 'Overdue' && d.overdue ? 'text-late' : ''}`}>{value}</dd>
          </div>
        ))}
      </dl>
      <h2 className="mb-3 font-display text-xl font-semibold">Due back soonest</h2>
      <Table
        empty="No books are out on loan."
        rows={open.slice(0, 8)}
        cols={[
          { label: 'Book', key: 'bookTitle' },
          { label: 'Member', key: 'memberName' },
          { label: 'Status', render: (r) => <DueStamp loan={r} /> },
        ]}
      />
    </>
  )
}
