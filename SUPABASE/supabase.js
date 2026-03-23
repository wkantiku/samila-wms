// ══════════════════════════════════════════════════════════════
//  SAMILA WMS 3PL — Supabase Client (ใช้ร่วมกัน Frontend + Mobile)
//  แก้ไข SUPABASE_URL และ SUPABASE_ANON_KEY ด้วยค่าจาก Dashboard
// ══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

// 👉 ค่าจาก Supabase Dashboard → Settings → API
export const SUPABASE_URL  = 'https://cwkhnokgbvhieietgjau.supabase.co';
export const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3a2hub2tnYnZoaWVpZXRnamF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzYyNTYsImV4cCI6MjA4OTY1MjI1Nn0.UviUso-JVptJvl328zU1hEURFNbT4cMTJEccHOj6Tlw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth helpers ──────────────────────────────────────────────
export const signIn  = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// ── Generic CRUD ──────────────────────────────────────────────
export const db = {
  // Read all rows (with optional filter)
  list: (table, select = '*', filters = {}) => {
    let q = supabase.from(table).select(select);
    Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
    return q;
  },

  // Read single row by id
  get: (table, id, select = '*') =>
    supabase.from(table).select(select).eq('id', id).single(),

  // Create
  create: (table, data) =>
    supabase.from(table).insert(data).select().single(),

  // Update
  update: (table, id, data) =>
    supabase.from(table).update(data).eq('id', id).select().single(),

  // Delete
  remove: (table, id) =>
    supabase.from(table).delete().eq('id', id),
};

// ── WMS-specific queries ──────────────────────────────────────
export const wms = {
  // Dashboard KPIs
  dashboardStats: async () => {
    const [inv, so, pick, ship] = await Promise.all([
      supabase.from('inventory').select('id, quantity_on_hand, quantity_available', { count: 'exact' }),
      supabase.from('sales_orders').select('id, status', { count: 'exact' }).neq('status', 'CANCELLED'),
      supabase.from('picking_lists').select('id, status').eq('status', 'PENDING'),
      supabase.from('shipment_orders').select('id, status').eq('status', 'PREPARED'),
    ]);
    return {
      totalInventory: inv.count || 0,
      activeOrders:   so.count  || 0,
      pendingPicks:   pick.data?.length || 0,
      pendingShips:   ship.data?.length || 0,
    };
  },

  // Receiving
  createReceiving: (grNumber, items) =>
    supabase.rpc('create_receiving', { gr_number: grNumber, items }),

  // Inventory search by barcode
  searchByBarcode: (barcode) =>
    supabase.from('products')
      .select('*, inventory(*)')
      .eq('barcode', barcode)
      .single(),

  // Picking lists pending
  pendingPickLists: () =>
    supabase.from('picking_lists')
      .select('*, picking_items(*)')
      .in('status', ['PENDING', 'IN_PROGRESS'])
      .order('created_at', { ascending: false }),

  // Stock count
  createStockCount: (data) =>
    supabase.from('stock_counts').insert(data).select().single(),
};
