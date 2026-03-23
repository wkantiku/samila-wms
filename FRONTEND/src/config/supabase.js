// ══════════════════════════════════════════════════════════════
//  SAMILA WMS 3PL — Supabase Client (Frontend)
//  ค่าจาก env vars (ตั้งใน Vercel Dashboard หรือ .env.local)
// ══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL  || 'https://cwkhnokgbvhieietgjau.supabase.co';
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3a2hub2tnYnZoaWVpZXRnamF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzYyNTYsImV4cCI6MjA4OTY1MjI1Nn0.UviUso-JVptJvl328zU1hEURFNbT4cMTJEccHOj6Tlw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth helpers ──────────────────────────────────────────────
export const signInWithEmail = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// ── Generic CRUD ──────────────────────────────────────────────
export const db = {
  list: (table, select = '*', filters = {}) => {
    let q = supabase.from(table).select(select);
    Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
    return q;
  },
  get:    (table, id, select = '*') =>
    supabase.from(table).select(select).eq('id', id).single(),
  create: (table, data) =>
    supabase.from(table).insert(data).select().single(),
  update: (table, id, data) =>
    supabase.from(table).update(data).eq('id', id).select().single(),
  remove: (table, id) =>
    supabase.from(table).delete().eq('id', id),
};
