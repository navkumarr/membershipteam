import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import useStore from '../../store/useStore'

const CATEGORY_COLORS = {
  'Planning': 'bg-indigo-50 text-indigo-700',
  'Weekly Sync': 'bg-teal-50 text-teal-700',
  'Review': 'bg-amber-50 text-amber-700',
  'Retro': 'bg-pink-50 text-pink-700',
  'Design': 'bg-purple-50 text-purple-700',
}

function CategoryBadge({ category }) {
  if (!category) return null
  const cls = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600'
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
        <svg className="w-3.5 h-3.5 text-gray-300 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return (
      <svg
        className={`w-3.5 h-3.5 text-indigo-500 ml-1 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )
  }

  if (meetingNotes.length === 0) {
    return (
      <div className="card p-12 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-400">No meeting notes yet. Create your first page.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 w-full">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center font-semibold text-gray-600 hover:text-gray-800"
              >
                Name <SortIcon col="name" />
              </button>
            </th>
            <th className="text-left px-4 py-3 whitespace-nowrap">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center font-semibold text-gray-600 hover:text-gray-800"
              >
                Date <SortIcon col="date" />
              </button>
            </th>
            <th className="text-left px-4 py-3 whitespace-nowrap">
              <button
                onClick={() => handleSort('category')}
                className="flex items-center font-semibold text-gray-600 hover:text-gray-800"
              >
                Category <SortIcon col="category" />
              </button>
            </th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((note) => (
            <tr key={note.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 group">
              <td className="px-4 py-3">
                <Link
                  to={`/meeting/${note.id}`}
                  className="font-medium text-gray-800 hover:text-indigo-600 transition-colors"
                >
                  {note.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {note.date ? format(parseISO(note.date), 'MMM d, yyyy') : '—'}
              </td>
              <td className="px-4 py-3">
                <CategoryBadge category={note.category} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => deleteMeetingNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
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
