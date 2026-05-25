import { Link, useLocation } from 'react-router-dom'
import { signOut } from '../lib/auth'
import useStore from '../store/useStore'

const navItems = [
  {
    label: 'Action Items',
    href: '/',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Meeting Notes',
    href: '/#meeting-notes',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
]

export default function Sidebar({ isDark, onToggleTheme }) {
  const location = useLocation()
  const currentUser = useStore((s) => s.currentUser)

  const initials = currentUser?.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : '?'

  async function handleSignOut() {
    await signOut()
  }

  return (
    <aside className="hidden md:flex w-56 flex-shrink-0 bg-navy-950 text-slate-100 flex-col h-full border-r border-navy-900/50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-navy-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gold flex items-center justify-center flex-shrink-0 shadow-sm shadow-gold/20">
            <svg className="w-4 h-4 text-navy-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-wide text-white">Membership PM</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-2 pt-2 pb-1 text-xs font-semibold text-navy-600 uppercase tracking-wider">
          Workspace
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === '/' && item.href.startsWith('/')
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-navy-900 text-gold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-navy-900'
              }`}
            >
              <span className={isActive ? 'text-gold' : 'text-navy-600'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-navy-900 bg-navy-950/50">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-xs font-bold text-navy-950 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 truncate font-medium">{currentUser?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={onToggleTheme}
            className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-400 hover:text-gold hover:bg-navy-900 transition-all duration-200"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark
              </>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-navy-900 transition-all duration-200 flex-shrink-0"
            title="Sign out"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
