import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { format } from 'date-fns'

export default function AddMeetingNoteModal({ onClose }) {
  const addMeetingNote = useStore((s) => s.addMeetingNote)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    setSubmitting(true)
    const id = await addMeetingNote({
      name: form.name.trim(),
      date: form.date,
      category: form.category.trim(),
    })
    setSubmitting(false)
    if (id) {
      onClose()
      navigate(`/meeting/${id}`)
    } else {
      setError('Failed to create page. Please try again.')
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">New Meeting Note</h3>
          <button onClick={onClose} className="btn-ghost p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="note-name">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="note-name"
              name="name"
              className="input"
              placeholder="e.g. Weekly Sync — May W3"
              value={form.name}
              onChange={handleChange}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="note-date">Date</label>
              <input
                id="note-date"
                name="date"
                type="date"
                className="input"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label" htmlFor="note-category">Category</label>
              <input
                id="note-category"
                name="category"
                className="input"
                placeholder="e.g. Planning, Review…"
                value={form.category}
                onChange={handleChange}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option value="Planning" />
                <option value="Weekly Sync" />
                <option value="Review" />
                <option value="Retro" />
                <option value="Design" />
              </datalist>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? 'Creating…' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
