import { useState } from 'react'
import useStore from '../../store/useStore'
import { generateActionItems } from '../../lib/gemini'

export default function GeminiModal({ onClose }) {
  const actionItems = useStore((s) => s.actionItems)
  const teamMembers = useStore((s) => s.teamMembers)
  const addActionItem = useStore((s) => s.addActionItem)

  const [context, setContext] = useState('')
  const [generated, setGenerated] = useState([]) // [{title, description}]
  const [selected, setSelected] = useState(new Set())
  const [assigneeId, setAssigneeId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [done, setDone] = useState(false)

  async function handleGenerate() {
    if (!context.trim()) {
      setError('Please describe your project or goal first.')
      return
    }
    setError('')
    setLoading(true)
    setGenerated([])
    setSelected(new Set())
    try {
      const items = await generateActionItems(context.trim(), actionItems)
      setGenerated(items)
      setSelected(new Set(items.map((_, i) => i))) // select all by default
    } catch (err) {
      setError(err.message || 'Failed to generate items. Check your Gemini API key.')
    } finally {
      setLoading(false)
    }
  }

  function toggleSelect(idx) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === generated.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(generated.map((_, i) => i)))
    }
  }

  async function handleAdd() {
    const toAdd = generated.filter((_, i) => selected.has(i))
    if (toAdd.length === 0) return
    setAdding(true)
    await Promise.all(
      toAdd.map((item) =>
        addActionItem({
          title: item.title,
          description: item.description,
          status: 'todo',
          assigneeId: assigneeId || null,
        })
      )
    )
    setAdding(false)
    setDone(true)
    setTimeout(onClose, 800)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-lg mx-4 p-6 z-50 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-800">Generate with Gemini</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Context input */}
        <div className="mb-4">
          <label className="label">What are you working on?</label>
          <textarea
            className="input min-h-[80px] resize-none text-sm"
            placeholder="e.g. Building a SaaS onboarding flow — need to improve activation rate from signup to first value moment"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            autoFocus
          />
        </div>

        {error && (
          <p className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded mb-3">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !context.trim()}
          className="btn-primary w-full justify-center mb-4 disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {generated.length > 0 ? 'Regenerate' : 'Generate Action Items'}
            </>
          )}
        </button>

        {/* Generated items */}
        {generated.length > 0 && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {selected.size} of {generated.length} selected
              </p>
              <button onClick={toggleAll} className="text-xs text-indigo-600 hover:underline">
                {selected.size === generated.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {generated.map((item, i) => (
                <div
                  key={i}
                  onClick={() => toggleSelect(i)}
                  className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selected.has(i)
                      ? 'border-indigo-300 bg-indigo-50/60'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                    selected.has(i) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                  }`}>
                    {selected.has(i) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Assignee */}
            <div className="mb-4">
              <label className="label">Assign to (optional)</label>
              <select
                className="input"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={selected.size === 0 || adding || done}
                className="btn-primary disabled:opacity-60"
              >
                {done ? '✓ Added!' : adding ? 'Adding…' : `Add ${selected.size} Item${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
