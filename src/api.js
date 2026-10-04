// API layer. Mock mode runs fully in the browser; switch VITE_USE_MOCK=false to call ASP.NET Core.
import { useCallback, useEffect, useState } from 'react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
export const FINE_PER_DAY = 20

async function http(method, path, body) {
  const token = localStorage.getItem('token')
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '/login' }
  if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`)
  return res.status === 204 ? null : res.json()
}

// ---------- mock data ----------
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
const db = {
  books: [
    { id: 1, title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', genre: 'Technology', copies: 3, available: 2 },
    { id: 2, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780135957059', genre: 'Technology', copies: 2, available: 1 },
    { id: 3, title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', genre: 'Fiction', copies: 4, available: 4 },
    { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', genre: 'History', copies: 2, available: 1 },
    { id: 5, title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', genre: 'Science', copies: 2, available: 2 },
  ],
  members: [
    { id: 1, name: 'Amira Hassan', email: 'amira@example.com', joined: day(-300) },
    { id: 2, name: 'Liam Chen', email: 'liam@example.com', joined: day(-120) },
    { id: 3, name: 'Sofia Rossi', email: 'sofia@example.com', joined: day(-40) },
  ],
  loans: [
    { id: 1, bookId: 1, memberId: 1, borrowedOn: day(-30), dueOn: day(-16), returnedOn: null },
    { id: 2, bookId: 2, memberId: 2, borrowedOn: day(-5), dueOn: day(9), returnedOn: null },
    { id: 3, bookId: 4, memberId: 3, borrowedOn: day(-20), dueOn: day(-6), returnedOn: null },
    { id: 4, bookId: 3, memberId: 1, borrowedOn: day(-50), dueOn: day(-36), returnedOn: day(-33) },
  ],
  paid: new Set(),
  nextId: 100,
}
const today = () => day(0)
const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 864e5))
const hydrate = (l) => ({
  ...l,
  bookTitle: db.books.find((b) => b.id === l.bookId)?.title,
  memberName: db.members.find((m) => m.id === l.memberId)?.name,
  overdue: !l.returnedOn && l.dueOn < today(),
})
const fines = () =>
  db.loans.map(hydrate).map((l) => {
    const days = daysBetween(l.dueOn, l.returnedOn || today())
    return { id: l.id, loanId: l.id, memberName: l.memberName, bookTitle: l.bookTitle, days, amount: days * FINE_PER_DAY, paid: db.paid.has(l.id) }
  }).filter((f) => f.days > 0)

const mock = {
  'POST /auth/login': (b) => ({ token: 'mock-token', user: { name: 'Librarian', email: b.email, role: 'Admin' } }),
  'GET /books': () => db.books,
  'POST /books': (b) => { const x = { ...b, id: db.nextId++, copies: +b.copies, available: +b.copies }; db.books.push(x); return x },
  'DELETE /books': (_, id) => { db.books = db.books.filter((b) => b.id !== +id); return null },
  'GET /members': () => db.members,
  'POST /members': (b) => { const x = { ...b, id: db.nextId++, joined: today() }; db.members.push(x); return x },
  'GET /loans': () => db.loans.map(hydrate).reverse(),
  'POST /loans': (b) => {
    const book = db.books.find((x) => x.id === +b.bookId)
    if (!book || book.available < 1) throw new Error('No copies available')
    book.available--
    const x = { id: db.nextId++, bookId: +b.bookId, memberId: +b.memberId, borrowedOn: today(), dueOn: day(14), returnedOn: null }
    db.loans.push(x); return hydrate(x)
  },
  'POST /loans/return': (_, id) => {
    const l = db.loans.find((x) => x.id === +id)
    l.returnedOn = today(); db.books.find((b) => b.id === l.bookId).available++; return hydrate(l)
  },
  'GET /fines': () => fines(),
  'POST /fines/pay': (_, id) => { db.paid.add(+id); return null },
  'GET /reports/summary': () => {
    const loans = db.loans.map(hydrate)
    const byGenre = {}
    loans.forEach((l) => { const g = db.books.find((b) => b.id === l.bookId)?.genre; byGenre[g] = (byGenre[g] || 0) + 1 })
    return {
      books: db.books.length, members: db.members.length,
      activeLoans: loans.filter((l) => !l.returnedOn).length,
      overdue: loans.filter((l) => l.overdue).length,
      unpaidFines: fines().filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0),
      byGenre: Object.entries(byGenre).map(([genre, count]) => ({ genre, loans: count })),
    }
  },
}

async function call(method, path, body) {
  if (!MOCK) return http(method, path, body)
  await new Promise((r) => setTimeout(r, 120))
  const [, id] = path.match(/\/(\d+)/) || []
  const key = `${method} ${path.replace(/\/\d+/, '').replace(/\/$/, '')}`
  const fn = mock[key]
  if (!fn) throw new Error(`No mock for ${key}`)
  return fn(body, id)
}

export const api = {
  login: (email, password) => call('POST', '/auth/login', { email, password }),
  books: () => call('GET', '/books'),
  addBook: (b) => call('POST', '/books', b),
  deleteBook: (id) => call('DELETE', `/books/${id}`),
  members: () => call('GET', '/members'),
  addMember: (m) => call('POST', '/members', m),
  loans: () => call('GET', '/loans'),
  borrow: (bookId, memberId) => call('POST', '/loans', { bookId, memberId }),
  returnLoan: (id) => call('POST', `/loans/${id}/return`),
  fines: () => call('GET', '/fines'),
  payFine: (id) => call('POST', `/fines/${id}/pay`),
  summary: () => call('GET', '/reports/summary'),
}

export function useAsync(fn) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const load = useCallback(() => fn().then(setData).catch((e) => setError(e.message)), []) // eslint-disable-line
  useEffect(() => { load() }, [load])
  return { data, error, reload: load }
}
