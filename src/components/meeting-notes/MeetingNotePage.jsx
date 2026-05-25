import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import useStore from '../../store/useStore'

const CATEGORY_COLORS = {
  'Planning': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'Weekly Sync': 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  'Review': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'Retro': 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
  'Design': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
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
  const [mode, setMode] = useState('write')
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    if (note) {
      setTitleDraft(note.name)
      setContent(note.content || '')
    }
  }, [id])

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
          <p className="text-gray-500 dark:text-slate-400 mb-4">Note not found.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Go home</button>
        </div>
      </div>
    )
  }

  const catCls = CATEGORY_COLORS[note.category] || 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-slate-300'

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-6 transition-colors"
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
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white w-full border-b-2 border-gold outline-none bg-transparent pb-1 mb-4"
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
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white cursor-text hover:bg-gray-100 dark:hover:bg-navy-800 rounded px-1 -ml-1 transition-colors inline-block mb-4"
              onClick={() => setEditingTitle(true)}
              title="Click to edit title"
            >
              {note.name}
            </h1>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 flex-wrap">
            {note.date && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-navy-700 pb-2">
          <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-navy-600">
            <button
              onClick={() => setMode('write')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'write'
                  ? 'bg-navy-900 dark:bg-gold text-white dark:text-navy-900'
                  : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-navy-700'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 dark:border-navy-600 ${
                mode === 'preview'
                  ? 'bg-navy-900 dark:bg-gold text-white dark:text-navy-900'
                  : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-navy-700'
              }`}
            >
              Preview
            </button>
          </div>

          <div className="flex items-center gap-3">
            {mode === 'write' && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                <span className="font-mono bg-gray-100 dark:bg-navy-700 px-1 rounded"># H1</span>
                <span className="font-mono bg-gray-100 dark:bg-navy-700 px-1 rounded">**bold**</span>
                <span className="font-mono bg-gray-100 dark:bg-navy-700 px-1 rounded">- list</span>
                <span className="font-mono bg-gray-100 dark:bg-navy-700 px-1 rounded">- [ ] task</span>
              </div>
            )}
            <span className={`text-xs ${saved ? 'text-gray-400 dark:text-slate-500' : 'text-amber-500'}`}>
              {saved ? 'Saved' : 'Saving…'}
            </span>
          </div>
        </div>

        {mode === 'write' && (
          <textarea
            className="w-full min-h-[60vh] text-gray-800 dark:text-slate-200 text-sm leading-relaxed resize-none outline-none bg-transparent placeholder-gray-300 dark:placeholder-navy-600 font-mono"
            placeholder={`Start writing your meeting notes here…\n\n# Heading 1\n## Heading 2\n\n**bold text**, _italic text_\n\n- Bullet item\n- [ ] Task checkbox\n- [x] Completed task`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        )}

        {mode === 'preview' && (
          <div className="min-h-[60vh]">
            {content.trim() ? (
              <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {content}
                </Markdown>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-gray-400 dark:text-slate-500 text-sm">Nothing to preview yet. Switch to Write to add content.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
