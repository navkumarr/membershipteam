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

export default function Sidebar() {
  const location = useLocation()
  const currentUser = useStore((s) => s.currentUser)

  const initials = currentUser?.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : '?'

  async function handleSignOut() {
    await signOut()
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 text-gray-100 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-wide">Membership PM</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-2 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Workspace
        </p>
        {navItems.map((item) => {
          const isActive = location.pathname === '/' && item.href.startsWith('/')
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-gray-700/60 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700/40'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-gray-700/60">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-300 truncate">{currentUser?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-200 transition-colors flex-shrink-0"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
