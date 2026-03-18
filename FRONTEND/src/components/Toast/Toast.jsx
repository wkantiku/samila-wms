import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import './Toast.css';

// ── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
  }, []);

  const toast = useCallback((msg, type = 'success', duration = 3500) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, msg, type, leaving: false }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Convenience aliases
  toast.success = (msg, d) => toast(msg, 'success', d);
  toast.error   = (msg, d) => toast(msg, 'error',   d ?? 5000);
  toast.warn    = (msg, d) => toast(msg, 'warn',    d);
  toast.info    = (msg, d) => toast(msg, 'info',    d);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type} ${t.leaving ? 'toast-leave' : 'toast-enter'}`}
            role="alert"
          >
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warn' ? '⚠' : 'ℹ'}
            </span>
            <span className="toast-msg">{t.msg}</span>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="ปิด">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export default ToastProvider;
