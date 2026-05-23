# Membership — Project Management Tool

A lightweight Notion-style project management app built with React and Vite. Supports action item tracking (kanban + timeline views) and collaborative meeting notes with markdown editing.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Features

- **Action Items** — kanban board with drag-and-drop, timeline view with start/due date bars, team member assignment
- **Meeting Notes** — table of pages with write/preview markdown editor, auto-save
- **Team Management** — add/remove members with color avatars

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 18 + Vite |
| Styling | Tailwind CSS + @tailwindcss/typography |
| State | Zustand |
| Routing | React Router v7 |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Markdown | react-markdown + remark-gfm |
| Date utils | date-fns |
| Database (ready) | @supabase/supabase-js |

## Project Structure

```
src/
  lib/supabase.js              # Supabase client (plug in credentials to activate)
  store/useStore.js            # Zustand store — swap local state for Supabase calls here
  components/
    action-items/              # Kanban, timeline, cards, add modal
    meeting-notes/             # Table, page editor, add modal
    team/                      # Manage team modal
```

## Connecting Supabase

See [SUPABASE.md](./SUPABASE.md) for step-by-step database setup and auth integration.
