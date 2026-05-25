import { useState } from 'react'
import useStore from '../../store/useStore'

export default function AddActionItemModal({ onClose, defaultStatus = 'todo', item = null }) {
  const teamMembers = useStore((s) => s.teamMembers)
  const addActionItem = useStore((s) => s.addActionItem)
  const updateActionItem = useStore((s) => s.updateActionItem)

  const isEdit = !!item

  const [form, setForm] = useState({
    title: item?.title || '',
    description: item?.description || '',
    assigneeId: item?.assigneeId || '',
    startDate: item?.startDate || '',
    dueDate: item?.dueDate || '',
    status: item?.status || defaultStatus,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    setSubmitting(true)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      assigneeId: form.assigneeId || null,
      startDate: form.startDate || null,
      dueDate: form.dueDate || null,
      status: form.status,
    }
    if (isEdit) {
      await updateActionItem(item.id, payload)
    } else {
      await addActionItem(payload)
    }
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            {isEdit ? 'Edit Action Item' : 'Add Action Item'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              className="input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="input min-h-[80px] resize-none"
              placeholder="Optional details…"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" className="input" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="assigneeId">Assignee</label>
              <select id="assigneeId" name="assigneeId" className="input" value={form.assigneeId} onChange={handleChange}>
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="startDate">Start Date</label>
              <input id="startDate" name="startDate" type="date" className="input" value={form.startDate} onChange={handleChange} />
            </div>
            <div>
              <label className="label" htmlFor="dueDate">Due Date</label>
              <input id="dueDate" name="dueDate" type="date" className="input" value={form.dueDate} onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? (isEdit ? 'Saving…' : 'Adding…') : (isEdit ? 'Save Changes' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
