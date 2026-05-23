import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import useStore from '../../store/useStore'

const CATEGORY_COLORS = {
  'Planning': 'bg-indigo-50 text-indigo-700',
  'Weekly Sync': 'bg-teal-50 text-teal-700',
  'Review': 'bg-amber-50 text-amber-700',
  'Retro': 'bg-pink-50 text-pink-700',
  'Design': 'bg-purple-50 text-purple-700',
}

export default function MeetingNotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const meetingNotes = useStore((s) => s.meetingNotes)
  const updateMeetingNote = useStore((s) => s.updateMeetingNote)

  const note = meetingNotes.find((n) => n.id === id)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(note?.name || '')
  const [content, setContent] = useState(note?.content || '')
  const [mode, setMode] = useState('write') // 'write' | 'preview'
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    if (note) {
      setTitleDraft(note.name)
      setContent(note.content || '')
    }
  }, [id])

  // Auto-save with debounce
  useEffect(() => {
    if (!note) return
    setSaved(false)
    const timer = setTimeout(() => {
      updateMeetingNote(id, { content })
      setSaved(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [content, id])

  function commitTitle() {
    if (titleDraft.trim() && titleDraft !== note?.name) {
      updateMeetingNote(id, { name: titleDraft.trim() })
    } else {
      setTitleDraft(note?.name || '')
    }
    setEditingTitle(false)
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Note not found.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go home</button>
        </div>
      </div>
    )
  }

  const catCls = CATEGORY_COLORS[note.category] || 'bg-gray-100 text-gray-600'

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-6">
          {editingTitle ? (
            <input
              className="text-3xl font-bold text-gray-900 w-full border-b-2 border-indigo-400 outline-none bg-transparent pb-1 mb-4"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle()
                if (e.key === 'Escape') { setTitleDraft(note.name); setEditingTitle(false) }
              }}
              autoFocus
            />
          ) : (
            <h1
              className="text-3xl font-bold text-gray-900 cursor-text hover:bg-gray-100 rounded px-1 -ml-1 transition-colors inline-block mb-4"
              onClick={() => setEditingTitle(true)}
              title="Click to edit title"
            >
              {note.name}
            </h1>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-500">
            {note.date && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(parseISO(note.date), 'MMMM d, yyyy')}
              </span>
            )}
            {note.category && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catCls}`}>
                {note.category}
              </span>
            )}
          </div>
        </div>

        {/* Editor toolbar */}
        <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
          <div className="flex rounded-md overflow-hidden border border-gray-200">
            <button
              onClick={() => setMode('write')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'write'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${
                mode === 'preview'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Preview
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Format hints */}
            {mode === 'write' && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-mono bg-gray-100 px-1 rounded"># H1</span>
                <span className="font-mono bg-gray-100 px-1 rounded">**bold**</span>
                <span className="font-mono bg-gray-100 px-1 rounded">- list</span>
                <span className="font-mono bg-gray-100 px-1 rounded">- [ ] task</span>
              </div>
            )}
            <span className={`text-xs ${saved ? 'text-gray-400' : 'text-amber-500'}`}>
              {saved ? 'Saved' : 'Saving…'}
            </span>
          </div>
        </div>

        {/* Write mode */}
        {mode === 'write' && (
          <textarea
            className="w-full min-h-[60vh] text-gray-800 text-sm leading-relaxed resize-none outline-none bg-transparent placeholder-gray-300 font-mono"
            placeholder={`Start writing your meeting notes here…\n\n# Heading 1\n## Heading 2\n\n**bold text**, _italic text_\n\n- Bullet item\n- [ ] Task checkbox\n- [x] Completed task\n\n| Column A | Column B |\n|----------|----------|\n| Cell     | Cell     |`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        )}

        {/* Preview mode */}
        {mode === 'preview' && (
          <div className="min-h-[60vh]">
            {content.trim() ? (
              <div className="prose prose-sm prose-gray max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {content}
                </Markdown>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-gray-400 text-sm">Nothing to preview yet. Switch to Write to add content.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
