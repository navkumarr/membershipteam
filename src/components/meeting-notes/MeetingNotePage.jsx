import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import useStore from '../../store/useStore'

const CATEGORY_COLORS = {
  'Planning': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border dark:border-blue-800/50',
  'Weekly Sync': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border dark:border-emerald-800/50',
  'Review': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border dark:border-amber-800/50',
  'Retro': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border dark:border-pink-800/50',
  'Design': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border dark:border-purple-800/50',
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

  const catCls = CATEGORY_COLORS[note.category] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border dark:border-slate-700'

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-all duration-200 group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          {editingTitle ? (
            <input
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white w-full border-b-2 border-slate-900 dark:border-slate-100 outline-none bg-transparent pb-1 mb-4"
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
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white cursor-text hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 -ml-1 transition-colors inline-block mb-4"
              onClick={() => setEditingTitle(true)}
              title="Click to edit title"
            >
              {note.name}
            </h1>
          )}

          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            {note.date && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <svg className="w-4 h-4 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(parseISO(note.date), 'MMMM d, yyyy')}
              </span>
            )}
            {note.category && (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight uppercase ${catCls}`}>
                {note.category}
              </span>
            )}
          </div>
        </div>

        {/* Editor toolbar */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900">
            <button
              onClick={() => setMode('write')}
              className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-md ${
                mode === 'write'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              WRITE
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 rounded-md ${
                mode === 'preview'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              PREVIEW
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors duration-500 ${saved ? 'text-emerald-500/50 dark:text-emerald-500/30' : 'text-slate-400'}`}>
              {saved ? '● Synced' : '○ Saving'}
            </span>
          </div>
        </div>

        {mode === 'write' && (
          <textarea
            className="w-full min-h-[60vh] text-slate-800 dark:text-slate-200 text-sm leading-relaxed resize-none outline-none bg-transparent placeholder-slate-300 dark:placeholder-slate-800 font-mono focus:ring-0"
            placeholder={`Start writing your meeting notes here…\n\n# Heading 1\n## Heading 2\n\n**bold text**, _italic text_\n\n- Bullet item\n- [ ] Task checkbox\n- [x] Completed task`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        )}

        {mode === 'preview' && (
          <div className="min-h-[60vh]">
            {content.trim() ? (
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-slate-900 dark:prose-a:text-slate-100 prose-strong:text-slate-900 dark:prose-strong:text-white">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {content}
                </Markdown>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <p className="text-slate-400 dark:text-slate-700 text-sm italic">Nothing to preview yet. Switch to Write to add content.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
