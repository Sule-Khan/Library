import { createContext, useContext, useState } from 'react'
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Books from './pages/Books.jsx'
import Members from './pages/Members.jsx'
import Loans from './pages/Loans.jsx'
import Fines from './pages/Fines.jsx'
import Reports from './pages/Reports.jsx'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const nav = [
  ['/', 'Dashboard'], ['/books', 'Books'], ['/members', 'Members'],
  ['/loans', 'Loans'], ['/fines', 'Fines'], ['/reports', 'Reports'],
]

function Shell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-ink text-white md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0">
        <div className="px-5 py-5 font-display text-xl font-semibold">Library</div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {nav.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm ${isActive ? 'bg-white/15 font-medium' : 'text-white/70 hover:bg-white/10'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-5 pt-6 text-xs text-white/60 md:absolute md:bottom-5 md:block">
          <div>{user.name}</div>
          <button className="mt-1 underline" onClick={() => { logout(); navigate('/login') }}>Sign out</button>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-5xl flex-1 p-5 md:p-10"><Outlet /></main>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const login = ({ token, user }) => {
    localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); setUser(user)
  }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null) }
  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="members" element={<Members />} />
          <Route path="loans" element={<Loans />} />
          <Route path="fines" element={<Fines />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthCtx.Provider>
  )
}
