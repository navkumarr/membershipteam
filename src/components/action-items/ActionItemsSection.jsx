import { useState } from 'react'
import KanbanView from './KanbanView'
import TimelineView from './TimelineView'
import AddActionItemModal from './AddActionItemModal'
import ManageTeamModal from '../team/ManageTeamModal'

export default function ActionItemsSection() {
  const [view, setView] = useState('kanban')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState('todo')
  const [editingItem, setEditingItem] = useState(null)

  function openAdd(status = 'todo') {
    setDefaultStatus(status)
    setEditingItem(null)
    setShowAddModal(true)
  }

  function openEdit(item) {
    setEditingItem(item)
    setShowAddModal(true)
  }

  function closeItemModal() {
    setShowAddModal(false)
    setEditingItem(null)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Action Items</h2>
        <div className="flex items-center gap-2">
          {/* View toggle — desktop only */}
          <div className="hidden sm:flex items-center bg-gray-100 dark:bg-navy-800 rounded-md p-0.5 gap-0.5">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === 'kanban'
                  ? 'bg-white dark:bg-navy-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                view === 'timeline'
                  ? 'bg-white dark:bg-navy-700 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              Timeline
            </button>
          </div>

          <button onClick={() => setShowTeamModal(true)} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Team</span>
          </button>

          <button onClick={() => openAdd('todo')} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      {/* Always kanban on mobile, toggleable on desktop */}
      <div className="sm:hidden">
        <KanbanView onAddItem={openAdd} onEdit={openEdit} />
      </div>
      <div className="hidden sm:block">
        {view === 'kanban' ? (
          <KanbanView onAddItem={openAdd} onEdit={openEdit} />
        ) : (
          <TimelineView />
        )}
      </div>

      {showAddModal && (
        <AddActionItemModal
          defaultStatus={defaultStatus}
          item={editingItem}
          onClose={closeItemModal}
        />
      )}
      {showTeamModal && <ManageTeamModal onClose={() => setShowTeamModal(false)} />}
    </section>
  )
}
