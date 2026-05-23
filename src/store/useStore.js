import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const AVATAR_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#3b82f6']

// Normalize DB rows → store shape (snake_case → camelCase)
const normalizeProfile = (r) => ({
  id: r.id,
  name: r.name || r.email?.split('@')[0] || 'Unknown',
  email: r.email,
  avatarColor: r.avatar_color || AVATAR_COLORS[0],
})

const normalizeItem = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  status: r.status,
  assigneeId: r.assignee_id,
  startDate: r.start_date,
  dueDate: r.due_date,
})

const normalizeNote = (r) => ({
  id: r.id,
  name: r.name,
  date: r.date,
  category: r.category,
  content: r.content || '',
})

const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // ── Data ──────────────────────────────────────────────────────────────────
  teamMembers: [], // profiles of all signed-up users
  actionItems: [],
  meetingNotes: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    const [
      { data: profiles, error: e1 },
      { data: items, error: e2 },
      { data: notes, error: e3 },
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('action_items').select('*').order('created_at'),
      supabase.from('meeting_notes').select('*').order('created_at'),
    ])
    const firstError = e1 || e2 || e3
    set({
      loading: false,
      error: firstError?.message ?? null,
      teamMembers: (profiles ?? []).map(normalizeProfile),
      actionItems: (items ?? []).map(normalizeItem),
      meetingNotes: (notes ?? []).map(normalizeNote),
    })
  },

  // ── Action Items ──────────────────────────────────────────────────────────
  addActionItem: async (item) => {
    const { data, error } = await supabase
      .from('action_items')
      .insert({
        title: item.title,
        description: item.description || null,
        status: item.status || 'todo',
        assignee_id: item.assigneeId || null,
        start_date: item.startDate || null,
        due_date: item.dueDate || null,
      })
      .select()
      .single()
    if (!error) set((s) => ({ actionItems: [...s.actionItems, normalizeItem(data)] }))
    return { error }
  },

  updateActionItem: async (id, updates) => {
    // Optimistic update first
    set((s) => ({
      actionItems: s.actionItems.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }))
    const dbUpdates = {}
    if ('title' in updates) dbUpdates.title = updates.title
    if ('description' in updates) dbUpdates.description = updates.description
    if ('status' in updates) dbUpdates.status = updates.status
    if ('assigneeId' in updates) dbUpdates.assignee_id = updates.assigneeId
    if ('startDate' in updates) dbUpdates.start_date = updates.startDate
    if ('dueDate' in updates) dbUpdates.due_date = updates.dueDate
    await supabase.from('action_items').update(dbUpdates).eq('id', id)
  },

  deleteActionItem: async (id) => {
    set((s) => ({ actionItems: s.actionItems.filter((i) => i.id !== id) }))
    await supabase.from('action_items').delete().eq('id', id)
  },

  moveActionItem: async (id, newStatus) => {
    set((s) => ({
      actionItems: s.actionItems.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
    }))
    await supabase.from('action_items').update({ status: newStatus }).eq('id', id)
  },

  // ── Meeting Notes ─────────────────────────────────────────────────────────
  addMeetingNote: async (note) => {
    const { data, error } = await supabase
      .from('meeting_notes')
      .insert({ name: note.name, date: note.date || null, category: note.category || null, content: '' })
      .select()
      .single()
    if (!error) {
      set((s) => ({ meetingNotes: [...s.meetingNotes, normalizeNote(data)] }))
      return data.id
    }
    return null
  },

  updateMeetingNote: async (id, updates) => {
    set((s) => ({
      meetingNotes: s.meetingNotes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }))
    await supabase.from('meeting_notes').update(updates).eq('id', id)
  },

  deleteMeetingNote: async (id) => {
    set((s) => ({ meetingNotes: s.meetingNotes.filter((n) => n.id !== id) }))
    await supabase.from('meeting_notes').delete().eq('id', id)
  },
}))

export default useStore
