import apiClient from './apiClient';
import { supabase } from '../config/supabase';

export const authService = {
  // ── Primary: FastAPI backend ──────────────────────────────
  async login(username, password) {
    const res = await apiClient.post('/api/auth/login', { username, password });
    const { access_token, user } = res.data;
    localStorage.setItem('wms_session', JSON.stringify({ token: access_token, user }));
    return user;
  },

  // ── Supabase auth (email/password) ────────────────────────
  async loginWithSupabase(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    // ดึงโปรไฟล์จากตาราง users
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    const user = userData || {
      id: data.user.id,
      email: data.user.email,
      name: data.user.email,
      role: 'operator',
      username: data.user.email,
      warehouses: ['All'],
      status: 'active',
    };

    // เก็บ session แบบเดิมเพื่อให้ระบบที่มีอยู่ใช้ได้
    localStorage.setItem('wms_session', JSON.stringify({
      token: data.session.access_token,
      user,
    }));
    return user;
  },

  async logout() {
    try { await apiClient.post('/api/auth/logout'); } catch {}
    try { await supabase.auth.signOut(); } catch {}
    localStorage.removeItem('wms_session');
    localStorage.removeItem('wms_pwa_session');
  },

  async getMe() {
    const res = await apiClient.get('/api/auth/me');
    return res.data;
  },

  getSession() {
    try {
      const s = localStorage.getItem('wms_session');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  },

  getCurrentUser() {
    return this.getSession()?.user || null;
  },

  getToken() {
    return this.getSession()?.token || null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },
};
