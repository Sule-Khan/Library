import { useEffect } from 'react'

export const money = (n) =>
  `Ksh ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function PageHeader({ title, note, action }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-4">
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      </div>
      {action}
    </header>
  )
}

const styles = {
  primary: 'bg-stamp text-white hover:bg-[#1b3a95]',
  ghost: 'border border-rule bg-card hover:bg-paper',
  danger: 'border border-late/40 text-late hover:bg-late/5',
}
export function Btn({ kind = 'primary', className = '', ...p }) {
  return <button {...p} className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles[kind]} ${className}`} />
}

export function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  )
}
export const inputCls = 'w-full rounded-md border border-rule bg-white px-3 py-2 text-sm'

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div role="dialog" aria-label={title} className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-xl font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Table({ cols, rows, empty }) {
  if (!rows.length) return <p className="rounded-lg border border-dashed border-rule p-8 text-center text-sm text-muted">{empty}</p>
  return (
    <div className="overflow-x-auto rounded-lg border border-rule bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-rule bg-paper/60 text-muted">
          <tr>{cols.map((c) => <th key={c.label} className="px-4 py-2.5 font-medium">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-rule/60 last:border-0">
              {cols.map((c) => <td key={c.label} className="px-4 py-3 align-middle">{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Date-due stamp: the one memorable element, echoing the stamp inside a library book.
export function DueStamp({ loan }) {
  const returned = !!loan.returnedOn
  const color = returned ? 'text-ok border-ok' : loan.overdue ? 'text-late border-late' : 'text-stamp border-stamp'
  return (
    <span className={`inline-block -rotate-2 rounded-sm border-2 px-2 py-0.5 font-mono text-xs font-semibold ${color}`}>
      {returned ? `RETURNED ${loan.returnedOn}` : `DUE ${loan.dueOn}`}
    </span>
  )
}

export const Loading = ({ error }) => (
  <p className={`py-10 text-center text-sm ${error ? 'text-late' : 'text-muted'}`}>{error || 'Loading…'}</p>
)
