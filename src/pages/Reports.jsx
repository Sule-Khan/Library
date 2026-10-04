import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, useAsync } from '../api.js'
import { Loading, PageHeader, money } from '../ui.jsx'

export default function Reports() {
  const { data, error } = useAsync(api.summary)
  if (!data) return <Loading error={error} />
  const rate = data.activeLoans ? Math.round((data.overdue / data.activeLoans) * 100) : 0
  return (
    <>
      <PageHeader title="Reports" note="Lending activity across the collection." />
      <section className="mb-6 rounded-lg border border-rule bg-card p-5">
        <h2 className="mb-4 font-display text-xl font-semibold">Loans by genre</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byGenre}>
              <CartesianGrid stroke="#d5dbe5" vertical={false} />
              <XAxis dataKey="genre" tickLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f2f4f7' }} />
              <Bar dataKey="loans" fill="#2447b5" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-lg border border-rule bg-card p-5 text-sm leading-relaxed">
        <p>{data.activeLoans} books are on loan and {data.overdue} of them are overdue ({rate}% of open loans).</p>
        <p>Members owe {money(data.unpaidFines)} in unpaid fines.</p>
      </section>
    </>
  )
}
