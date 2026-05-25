import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import AuthGate from './components/AuthGate'
import Sidebar from './components/Sidebar'
import ActionItemsSection from './components/action-items/ActionItemsSection'
import MeetingNotesSection from './components/meeting-notes/MeetingNotesSection'
import MeetingNotePage from './components/meeting-notes/MeetingNotePage'
import useStore from './store/useStore'
import { signOut } from './lib/auth'

function ThemeToggle({ isDark, onToggle, className = '' }) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-md transition-colors text-slate-400 hover:text-white hover:bg-navy-800 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

function MobileTopBar({ isDark, onToggleTheme }) {
  const currentUser = useStore((s) => s.currentUser)

  return (
    <div className="md:hidden flex items-center justify-between px-4 h-14 bg-navy-900 border-b border-navy-800 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gold flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-navy-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="font-semibold text-sm text-white">Membership PM</span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        <button
          onClick={() => signOut()}
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          title="Sign out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  function handleMeetingNotesClick() {
    const scroll = () =>
      document.getElementById('meeting-notes')?.scrollIntoView({ behavior: 'smooth' })
    if (!isHome) {
      navigate('/')
      setTimeout(scroll, 150)
    } else {
      scroll()
    }
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-navy-800 flex z-40">
      <Link
        to="/"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
          isHome ? 'text-gold' : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <span>Action Items</span>
      </Link>
      <button
        onClick={handleMeetingNotesClick}
        className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Meeting Notes</span>
      </button>
    </nav>
  )
}

function Dashboard() {
  const loading = useStore((s) => s.loading)
  const error = useStore((s) => s.error)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400">
          <svg className="animate-spin w-5 h-5 text-navy-900 dark:text-gold" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Loading workspace…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load data</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-12 pb-24 md:pb-8">
        <ActionItemsSection />
        <MeetingNotesSection />
      </div>
    </div>
  )
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      return stored ? stored === 'dark' : true
    } catch {
      return true
    }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light') } catch {}
  }, [isDark])

  function toggleTheme() {
    setIsDark((d) => !d)
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthGate>
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-950 transition-colors duration-200">
          <Sidebar isDark={isDark} onToggleTheme={toggleTheme} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <MobileTopBar isDark={isDark} onToggleTheme={toggleTheme} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/meeting/:id" element={<MeetingNotePage />} />
            </Routes>
          </div>
          <MobileBottomNav />
        </div>
      </AuthGate>
    </BrowserRouter>
  )
}
