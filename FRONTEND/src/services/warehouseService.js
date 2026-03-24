import apiClient from './apiClient';
import { supabase } from '../config/supabase';

const _mapSupabaseWh = (w) => ({
  id: w.id, code: w.code,
  name: w.name_en, name_th: w.name_th || w.name_en,
  location: w.city || '', province: w.city || '',
  active: w.is_active !== false, icon: w.icon || '🏭',
  companyNo: w.company_no || 'COMP-001',
  type: w.wh_type || 'General',
  zones: w.zones || 0, staff: w.staff || 0,
  capacity: w.total_capacity || 0, used: w.used_sqm || 0,
});

export const warehouseService = {
  async getAll() {
    try {
      return (await apiClient.get('/api/warehouses')).data;
    } catch {
      // FastAPI offline → fallback to Supabase
      const { data } = await supabase.from('warehouses').select('*').order('id');
      return (data || []).map(_mapSupabaseWh);
    }
  },
  async create(data)       { return (await apiClient.post('/api/warehouses', data)).data; },
  async update(id, data)   { return (await apiClient.put(`/api/warehouses/${id}`, data)).data; },
  async delete(id)         { return (await apiClient.delete(`/api/warehouses/${id}`)).data; },
};
