// ══════════════════════════════════════════════════════
//  Samila WMS 3PL — Auth Token Helper
// ══════════════════════════════════════════════════════
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from './api';

const TOKEN_KEY = 'samila_token';
const USER_KEY  = 'samila_user';

// ── Save / Get / Clear token ──────────────────────────
export const saveToken  = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken   = ()      => AsyncStorage.getItem(TOKEN_KEY);
export const clearAuth  = ()      => AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);

export const saveUser   = (user)  => AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser    = async () => {
  const s = await AsyncStorage.getItem(USER_KEY);
  return s ? JSON.parse(s) : null;
};

// ── Login API call ────────────────────────────────────
export async function loginApi(username, password) {
  const res = await fetch(API.login, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.detail || 'Login failed');
  await saveToken(json.access_token);
  await saveUser(json.user || { username });
  return json;
}

// ── Authenticated fetch wrapper ───────────────────────
export async function authFetch(url, options = {}) {
  const token = await getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
