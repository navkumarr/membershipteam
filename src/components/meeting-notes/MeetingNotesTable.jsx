import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import useStore from '../../store/useStore'

const CATEGORY_COLORS = {
  'Planning': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'Weekly Sync': 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  'Review': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'Retro': 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
  'Design': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
}

function CategoryBadge({ category }) {
  if (!category) return null
  const cls = CATEGORY_COLORS[category] || 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-slate-300'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {category}
    </span>
  )
}

export default function MeetingNotesTable() {
  const meetingNotes = useStore((s) => s.meetingNotes)
  const deleteMeetingNote = useStore((s) => s.deleteMeetingNote)

  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...meetingNotes].sort((a, b) => {
    let av = a[sortKey] ?? ''
    let bv = b[sortKey] ?? ''
    if (sortKey === 'date') {
      av = av ? new Date(av) : new Date(0)
      bv = bv ? new Date(bv) : new Date(0)
    } else {
      av = String(av).toLowerCase()
      bv = String(bv).toLowerCase()
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function SortIcon({ col }) {
    if (sortKey !== col) {
      return (
        <svg className="w-3.5 h-3.5 text-gray-300 dark:text-navy-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return (
      <svg
        className={`w-3.5 h-3.5 text-gold ml-1 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )
  }

  if (meetingNotes.length === 0) {
    return (
      <div className="card p-12 text-center">
        <svg className="w-10 h-10 text-gray-300 dark:text-navy-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-400 dark:text-slate-500">No meeting notes yet. Create your first page.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900/50">
            <th className="text-left px-4 py-3 w-full">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white"
              >
                Name <SortIcon col="name" />
              </button>
            </th>
            <th className="text-left px-4 py-3 whitespace-nowrap hidden sm:table-cell">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white"
              >
                Date <SortIcon col="date" />
              </button>
            </th>
            <th className="text-left px-4 py-3 whitespace-nowrap hidden md:table-cell">
              <button
                onClick={() => handleSort('category')}
                className="flex items-center font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white"
              >
                Category <SortIcon col="category" />
              </button>
            </th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((note) => (
            <tr key={note.id} className="border-b border-gray-100 dark:border-navy-700 last:border-0 hover:bg-gray-50 dark:hover:bg-navy-700/40 group">
              <td className="px-4 py-3">
                <Link
                  to={`/meeting/${note.id}`}
                  className="font-medium text-gray-800 dark:text-slate-100 hover:text-navy-900 dark:hover:text-gold transition-colors"
                >
                  {note.name}
                </Link>
                {/* Show date inline on mobile */}
                {note.date && (
                  <p className="sm:hidden text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {format(parseISO(note.date), 'MMM d, yyyy')}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">
                {note.date ? format(parseISO(note.date), 'MMM d, yyyy') : '—'}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <CategoryBadge category={note.category} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => deleteMeetingNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 dark:text-navy-600 hover:text-red-500"
                  aria-label="Delete note"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
