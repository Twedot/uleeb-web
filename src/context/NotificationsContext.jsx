import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

const NotificationsContext = createContext(null);
const POLL_MS = 30_000;

export function NotificationsProvider({ children }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get('/notifications', token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // non-fatal — stale list is fine
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [token, refresh]);

  async function markRead(id) {
    try {
      await api.post(`/notifications/${id}/read`, undefined, token);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // non-fatal
    }
  }

  async function markAllRead() {
    try {
      await api.post('/notifications/read-all', undefined, token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // non-fatal
    }
  }

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, loading, refresh, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
