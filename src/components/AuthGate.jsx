import { useEffect, useState } from 'react'
import { getSession, onAuthStateChange, signInWithEmail, signUpWithEmail, signInWithGoogle } from '../lib/auth'
import useStore from '../store/useStore'

export default function AuthGate({ children }) {
  const fetchAll = useStore((s) => s.fetchAll)
  const setCurrentUser = useStore((s) => s.setCurrentUser)

  const [user, setUser] = useState(undefined)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getSession().then((session) => {
      const u = session?.user ?? null
      setUser(u)
      setCurrentUser(u)
      if (u) fetchAll()
    })

    const { data: { subscription } } = onAuthStateChange((u) => {
      setUser(u)
      setCurrentUser(u)
      if (u) fetchAll()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const fn = isSignUp ? signUpWithEmail : signInWithEmail
    const { error: authError } = await fn(email, password)
    setSubmitting(false)
    if (authError) {
      setError(authError.message)
    } else if (isSignUp) {
      setError('Check your email to confirm your account before signing in.')
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    const { error: authError } = await signInWithGoogle()
    if (authError) setError(authError.message)
  }

  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
          <svg className="animate-spin w-5 h-5 text-navy-900 dark:text-gold" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium tracking-wide uppercase">Loading Workspace…</span>
        </div>
      </div>
    )
  }

  if (user) return children

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-navy-950 px-4">
      <div className="bg-white dark:bg-navy-900 p-8 rounded-xl shadow-xl border border-gray-200 dark:border-navy-800 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center shadow-sm shadow-gold/20">
            <svg className="w-4 h-4 text-navy-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 dark:text-white tracking-tight text-lg">Membership PM</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          {isSignUp ? 'Get started in seconds.' : 'Please sign in to continue.'}
        </p>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-navy-800 rounded-lg text-sm font-bold text-gray-700 dark:text-slate-200 bg-white dark:bg-navy-900 hover:bg-gray-50 dark:hover:bg-navy-800 transition-all duration-200 mb-4 shadow-sm active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-gray-200 dark:border-navy-800" />
          <span className="text-[10px] font-bold text-gray-400 dark:text-navy-700 uppercase tracking-widest">or</span>
          <div className="flex-1 border-t border-gray-200 dark:border-navy-800" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="label text-[10px] font-bold uppercase tracking-wider" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label text-[10px] font-bold uppercase tracking-wider" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input"
              placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className={`text-xs px-3 py-2 rounded font-medium ${
              error.includes('Check your email')
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
            }`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center disabled:opacity-60 text-sm font-bold h-11 shadow-gold/20"
          >
            {submitting
              ? (isSignUp ? 'Creating account…' : 'Signing in…')
              : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            className="text-xs font-bold text-navy-950 dark:text-gold hover:underline uppercase tracking-wide"
            onClick={() => { setIsSignUp((v) => !v); setError('') }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
