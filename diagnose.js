// Supabase connection diagnostics
// Run with: node diagnose.js

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ── Parse .env ────────────────────────────────────────────────────────────────
const env = {}
try {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
} catch {
  console.error('❌ Could not read .env file — run this from the project root.')
  process.exit(1)
}

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY

// ── Helpers ───────────────────────────────────────────────────────────────────
const results = { pass: 0, fail: 0, warn: 0 }
const failures = []

function pass(label, detail = '')  { results.pass++; console.log(`  ✅  ${label}${detail ? '  →  ' + detail : ''}`) }
function fail(label, detail = '')  { results.fail++; failures.push(label); console.log(`  ❌  ${label}${detail ? '  →  ' + detail : ''}`) }
function warn(label, detail = '')  { results.warn++; console.log(`  ⚠️   ${label}${detail ? '  →  ' + detail : ''}`) }
function section(title)            { console.log(`\n[${title}]`) }

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n🔍  Supabase Connection Diagnostics')
  console.log('─'.repeat(52))

  // 1. Credentials present
  section('1  Credentials')
  if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder') || SUPABASE_URL === 'undefined') {
    fail('VITE_SUPABASE_URL', 'missing or still a placeholder')
    process.exit(1)
  }
  pass('VITE_SUPABASE_URL', SUPABASE_URL)

  if (!SUPABASE_KEY || SUPABASE_KEY.includes('placeholder') || SUPABASE_KEY === 'undefined') {
    fail('VITE_SUPABASE_PUBLISHABLE_KEY', 'missing or still a placeholder')
    process.exit(1)
  }
  pass('VITE_SUPABASE_PUBLISHABLE_KEY', SUPABASE_KEY.slice(0, 28) + '…')

  // 2. Network reachability
  section('2  Network')
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers: { apikey: SUPABASE_KEY } })
    // 200 or 400 both mean the project is reachable
    if (res.status < 500) {
      pass('Project reachable', `HTTP ${res.status}`)
    } else {
      fail('Project reachable', `HTTP ${res.status} — Supabase may be down or paused`)
    }
  } catch (e) {
    fail('Project reachable', e.message)
    console.log('\n  Cannot reach Supabase at all — check your URL and internet connection.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // 3. Auth service
  section('3  Auth service')
  try {
    // Intentionally wrong credentials — just testing the auth endpoint responds
    const { error } = await supabase.auth.signInWithPassword({
      email: 'diag-probe@test.invalid',
      password: 'probe-password',
    })
    if (error?.message?.toLowerCase().includes('invalid') || error?.code === 'invalid_credentials') {
      pass('Auth endpoint responding', 'correctly rejected bad credentials')
    } else if (error) {
      warn('Auth endpoint', `unexpected error: ${error.message}`)
    } else {
      warn('Auth endpoint', 'accepted dummy credentials — something is off')
    }
  } catch (e) {
    fail('Auth endpoint', e.message)
  }

  // 4. Table existence (unauthenticated probe)
  //    Error code 42P01 = table does not exist
  //    Error PGRST301 / JWT required / 42501 = table exists but RLS blocked (correct)
  //    No error = table exists and anon can read (RLS may be misconfigured)
  section('4  Table existence  (unauthenticated probe)')
  const tables = ['profiles', 'action_items', 'meeting_notes']
  const tableExists = {}

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (!error) {
      warn(table, 'exists but RLS is NOT blocking anonymous reads — check your policies')
      tableExists[table] = true
    } else if (error.code === '42P01') {
      fail(table, 'TABLE DOES NOT EXIST — run the setup SQL')
      tableExists[table] = false
    } else {
      // Blocked by RLS, JWT missing, or PGRST301 — all mean table exists and RLS is working
      pass(table, `exists  (RLS blocked anon: ${error.code})`)
      tableExists[table] = true
    }
  }

  // 5. Trigger existence (via pg_trigger, requires service role — skip if not available)
  section('5  Session & authenticated checks')
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    warn('No active session in this script context',
      'sign in via the app first, then re-run for authenticated checks')
  } else {
    pass('Active session', session.user.email)

    // Authenticated table reads
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(10)
      if (!error) {
        pass(`${table}  (authenticated read)`, `${data.length} row(s) returned`)
      } else {
        fail(`${table}  (authenticated read)`, `${error.code}: ${error.message}`)
      }
    }

    // Profile row for current user
    section('6  Profile row for current user')
    const { data: profile, error: pe } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      pass('Profile row exists', `name: "${profile.name}"  color: ${profile.avatar_color}`)
    } else if (pe?.code === 'PGRST116') {
      fail('Profile row missing',
        'trigger did not fire at signup (profiles table was missing then) — run the backfill query')
      console.log(`
  Backfill query to run in Supabase SQL Editor:

    insert into profiles (id, email, name, avatar_color)
    select id, email,
      coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
      '#6366f1'
    from auth.users
    on conflict (id) do nothing;
`)
    } else {
      fail('Profile row', pe?.message || 'unknown error')
    }
  }

  // 6. handle_new_user trigger (check via function existence)
  section(session ? '7  Function & trigger existence' : '6  Function & trigger existence')
  {
    const { data, error } = await supabase
      .rpc('handle_new_user') // calling it directly will fail but the error type tells us if it exists
      .maybeSingle()

    if (error?.code === '42883') {
      fail('handle_new_user function', 'DOES NOT EXIST — run the trigger setup SQL')
    } else if (error?.message?.includes('wrong number') || error?.code === 'PGRST202' || error?.code === '42P01') {
      // Function exists but can't be called this way — that's fine
      pass('handle_new_user function', 'exists')
    } else if (!error) {
      pass('handle_new_user function', 'exists')
    } else {
      warn('handle_new_user function', `${error.code}: ${error.message}`)
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(52))
  console.log(`  ${results.pass} passed   ${results.fail} failed   ${results.warn} warnings\n`)

  if (failures.length > 0) {
    console.log('  Failed checks:')
    failures.forEach((f) => console.log(`    •  ${f}`))
    console.log()
  } else if (results.warn === 0) {
    console.log('  Everything looks good. 🎉\n')
  }
}

run().catch((err) => {
  console.error('\nScript crashed:', err.message)
  process.exit(1)
})
