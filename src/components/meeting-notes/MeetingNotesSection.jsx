import { useState } from 'react'
import MeetingNotesTable from './MeetingNotesTable'
import AddMeetingNoteModal from './AddMeetingNoteModal'

export default function MeetingNotesSection() {
  const [showModal, setShowModal] = useState(false)

  return (
    <section id="meeting-notes">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meeting Notes</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Page</span>
        </button>
      </div>

      <MeetingNotesTable />

      {showModal && (
        <AddMeetingNoteModal onClose={() => setShowModal(false)} />
      )}
    </section>
  )
}
