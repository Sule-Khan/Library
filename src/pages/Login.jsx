import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../App.jsx'
import { Btn, Field, inputCls } from '../ui.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@library.test')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try { login(await api.login(email, password)); navigate('/') }
    catch (err) { setError(err.message || 'Check your email and password, then try again.') }
    finally { setBusy(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-rule bg-card p-8">
        <h1 className="font-display text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted">Use your librarian account to manage books, members and loans.</p>
        <Field label="Email"><input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><input type="password" required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {error && <p role="alert" className="text-sm text-late">{error}</p>}
        <Btn className="w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Btn>
      </form>
    </div>
  )
}
