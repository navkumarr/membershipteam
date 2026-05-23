import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthGate from './components/AuthGate'
import Sidebar from './components/Sidebar'
import ActionItemsSection from './components/action-items/ActionItemsSection'
import MeetingNotesSection from './components/meeting-notes/MeetingNotesSection'
import MeetingNotePage from './components/meeting-notes/MeetingNotePage'
import useStore from './store/useStore'

function Dashboard() {
  const loading = useStore((s) => s.loading)
  const error = useStore((s) => s.error)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
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
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        <ActionItemsSection />
        <MeetingNotesSection />
      </div>
    </div>
  )
}

export default function App() {
  // import.meta.env.BASE_URL reflects the vite base config (/repo-name/ on GH Pages, / locally)
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthGate>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meeting/:id" element={<MeetingNotePage />} />
          </Routes>
        </div>
      </AuthGate>
    </BrowserRouter>
  )
}
