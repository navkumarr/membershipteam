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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Action Items</h2>
        <div className="flex items-center gap-2">
          {/* View toggle — desktop only */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all duration-200 ${
                view === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              KANBAN
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all duration-200 ${
                view === 'timeline'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              TIMELINE
            </button>
          </div>

          <button onClick={() => setShowTeamModal(true)} className="btn-secondary h-9">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline font-bold text-xs uppercase">Team</span>
          </button>

          <button onClick={() => openAdd('todo')} className="btn-primary h-9">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline font-bold text-xs uppercase">Add Item</span>
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
