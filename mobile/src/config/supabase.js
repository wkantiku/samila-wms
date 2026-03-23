// ══════════════════════════════════════════════════════════════
//  SAMILA WMS 3PL — Supabase Client (Mobile)
//  👉 แก้ไข URL และ KEY จาก Supabase Dashboard → Settings → API
// ══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL  = 'https://cwkhnokgbvhieietgjau.supabase.co';
export const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3a2hub2tnYnZoaWVpZXRnamF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzYyNTYsImV4cCI6MjA4OTY1MjI1Nn0.UviUso-JVptJvl328zU1hEURFNbT4cMTJEccHOj6Tlw';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage:          AsyncStorage,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});

// ── Auth ──────────────────────────────────────────────────────
export const loginSupabase = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  // ดึงข้อมูล user จากตาราง users
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', data.user.id)
    .single();
  return userData || { email: data.user.email };
};

export const logoutSupabase = () => supabase.auth.signOut();

export const getSupabaseSession = () => supabase.auth.getSession();

// ── Receiving ─────────────────────────────────────────────────
export const createReceiving = async (grNumber, items) => {
  const { data, error } = await supabase
    .from('receiving_orders')
    .insert({
      gr_number:    grNumber,
      gr_date:      new Date().toISOString(),
      warehouse_id: 1,
      status:       'RECEIVING',
    })
    .select()
    .single();
  if (error) throw error;

  if (items?.length) {
    const rows = items.map(i => ({
      gr_id:             data.id,
      barcode:           i.barcode,
      quantity_received: i.quantity,
      location_id:       null,
    }));
    await supabase.from('receiving_items').insert(rows);
  }
  return data;
};

// ── Putaway ───────────────────────────────────────────────────
export const getPutawayTasks = () =>
  supabase.from('receiving_orders')
    .select('*, receiving_items(*)')
    .in('status', ['RECEIVING', 'QC'])
    .order('created_at', { ascending: false });

export const completePutaway = (id) =>
  supabase.from('receiving_orders')
    .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
    .eq('id', id);

// ── Picking ───────────────────────────────────────────────────
export const getPickList = (pickNumber) =>
  supabase.from('picking_lists')
    .select('*, picking_items(*)')
    .eq('pick_number', pickNumber.toUpperCase())
    .single();

export const updatePickItem = (itemId, qtyPicked) =>
  supabase.from('picking_items')
    .update({ quantity_picked: qtyPicked, pick_status: 'PICKED', picked_at: new Date().toISOString() })
    .eq('id', itemId);

export const completePicking = (pickId) =>
  supabase.from('picking_lists')
    .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
    .eq('id', pickId);

// ── Shipping ──────────────────────────────────────────────────
export const createShipment = async (soNumber, carrier, tracking, weight, items) => {
  const { data: so } = await supabase
    .from('sales_orders').select('id').eq('so_number', soNumber).single();

  const { data, error } = await supabase
    .from('shipment_orders')
    .insert({
      so_id:           so?.id,
      warehouse_id:    1,
      shipment_number: `SHIP-${Date.now()}`,
      shipment_date:   new Date().toISOString(),
      carrier,
      tracking_number: tracking,
      total_weight_kg: parseFloat(weight) || 0,
      status:          'SHIPPED',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── Stock Count ───────────────────────────────────────────────
export const createStockCountSession = (countNumber) =>
  supabase.from('stock_counts')
    .insert({
      count_number: countNumber,
      count_date:   new Date().toISOString(),
      warehouse_id: 1,
      count_type:   'CYCLE',
      status:       'COUNTING',
    })
    .select()
    .single();

export const addStockCountItem = (countId, location, barcode, countedQty) =>
  supabase.from('stock_counts')
    .update({
      physical_quantity: countedQty,
      status:            'VERIFIED',
    })
    .eq('id', countId);

// ── Inventory / Barcode lookup ────────────────────────────────
export const searchBarcode = (barcode) =>
  supabase.from('products')
    .select('*, inventory(*)')
    .eq('barcode', barcode)
    .single();
