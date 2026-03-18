import apiClient from './apiClient';

export const authService = {
  async login(username, password) {
    const res = await apiClient.post('/api/auth/login', { username, password });
    const { access_token, user } = res.data;
    localStorage.setItem('wms_session', JSON.stringify({ token: access_token, user }));
    return user;
  },

  async logout() {
    try { await apiClient.post('/api/auth/logout'); } catch {}
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
