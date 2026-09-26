import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

// Landlord's inbox — mirrors uleeb mobile's store/requests.tsx exactly,
// including the polling (no WebSocket infra for a two-person exchange
// this infrequent) and NOT gating on the account's current role, since
// properties (and requests against them) stay yours across a role switch.
const RequestsContext = createContext(null);

export function RequestsProvider({ children }) {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await api.get('/requests/inbox', token);
      setRequests(list ?? []);
    } catch {
      // keep whatever we last had on a transient failure
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(refresh, 8000);
    return () => clearInterval(interval);
  }, [token, refresh]);

  function getRequest(id) {
    return requests.find((r) => r.id === id);
  }

  async function acceptRequest(id) {
    if (!token) return;
    await api.post(`/requests/${id}/accept`, undefined, token);
    // Re-fetch rather than patch locally — accepting reveals the
    // applicant's contact info, which only the enriched inbox list carries.
    await refresh();
  }

  async function declineRequest(id) {
    if (!token) return;
    await api.post(`/requests/${id}/decline`, undefined, token);
    await refresh();
  }

  return (
    <RequestsContext.Provider value={{ requests, loading, refresh, getRequest, acceptRequest, declineRequest }}>
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider');
  return ctx;
}
