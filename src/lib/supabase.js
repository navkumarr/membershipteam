import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * Expected table schemas:
 *
 * team_members(
 *   id          uuid primary key default gen_random_uuid(),
 *   name        text not null,
 *   email       text unique,
 *   avatar_color text,
 *   created_at  timestamptz default now()
 * )
 *
 * action_items(
 *   id          uuid primary key default gen_random_uuid(),
 *   title       text not null,
 *   description text,
 *   status      text check (status in ('todo','in-progress','done')) default 'todo',
 *   assignee_id uuid references team_members(id) on delete set null,
 *   due_date    date,
 *   created_at  timestamptz default now(),
 *   updated_at  timestamptz default now()
 * )
 *
 * meeting_notes(
 *   id          uuid primary key default gen_random_uuid(),
 *   name        text not null,
 *   date        date,
 *   category    text,
 *   content     text,
 *   created_at  timestamptz default now(),
 *   updated_at  timestamptz default now()
 * )
 */
