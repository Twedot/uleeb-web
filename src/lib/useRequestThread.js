import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// Backs the chat page — mirrors uleeb mobile's lib/useRequestThread.ts.
// Polls every few seconds while the thread is open (only once accepted,
// since that's when chatEnabled/messages actually exist) — simple and
// good enough for a two-person conversation, no WebSocket infra needed.
export function useRequestThread(requestId, token) {
  const [detail, setDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [d, m] = await Promise.all([
        api.get(`/requests/${requestId}`, token),
        api.get(`/requests/${requestId}/messages`, token).catch(() => []),
      ]);
      setDetail(d);
      setMessages(m ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this conversation.');
    } finally {
      setLoading(false);
    }
  }, [requestId, token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token || detail?.status !== 'accepted') return;
    const interval = setInterval(() => {
      api.get(`/requests/${requestId}/messages`, token).then(setMessages).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [detail?.status, requestId, token]);

  async function sendMessage(body) {
    if (!token) return;
    const msg = await api.post(`/requests/${requestId}/messages`, { body }, token);
    setMessages((prev) => [...prev, msg]);
  }

  async function scheduleInspection(at) {
    if (!token) return;
    const updated = await api.post(`/requests/${requestId}/inspection`, { at: at.toISOString() }, token);
    setDetail((prev) => (prev ? { ...prev, inspectionAt: updated.inspectionAt } : prev));
  }

  return { detail, messages, loading, error, sendMessage, scheduleInspection, refresh: load };
}
