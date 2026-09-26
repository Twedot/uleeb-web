import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

// Tenant's own sent requests — mirrors uleeb mobile's store/sentRequests.tsx.
// Deliberately not gated on the account's current role, same reasoning as
// RequestsContext: requests sent as a tenant stay yours regardless of
// which role the account is switched into right now.
const SentRequestsContext = createContext(null);

export function SentRequestsProvider({ children }) {
  const { token } = useAuth();
  const [sentRequests, setSentRequests] = useState([]);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const list = await api.get('/requests/mine', token);
      // Keep the embedded `property` the backend already sends (fetched
      // independently by ListMine, never subject to the discovery feed's
      // exclusion of already-requested properties) — dropping it here and
      // re-deriving from ListingsContext instead broke the Requests page
      // the moment that exclusion shipped, since a requested property is
      // now guaranteed to be MISSING from that list.
      setSentRequests((list ?? []).map((r) => ({ id: r.id, propertyId: r.propertyId, status: r.status, property: r.property })));
    } catch {
      // keep whatever we last had on a transient failure
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // A landlord accepting/declining is a change on the OTHER side's
  // client — polling is what surfaces it here without a manual refresh.
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(refresh, 8000);
    return () => clearInterval(interval);
  }, [token, refresh]);

  async function sendRequest(propertyId) {
    if (!token) return;
    if (sentRequests.some((r) => r.propertyId === propertyId)) return;
    try {
      await api.post(`/properties/${propertyId}/requests`, undefined, token);
      // CreateForProperty's response is the bare request, not enriched
      // with `property` the way ListMine's is — refetching (rather than
      // pushing an incomplete local entry) keeps sentRequests entries
      // consistently shaped everywhere they're used.
      await refresh();
    } catch {
      // A duplicate (409) or transient failure — fails silently, same as
      // mobile, rather than interrupting whatever triggered it.
    }
  }

  function getStatusFor(propertyId) {
    return sentRequests.find((r) => r.propertyId === propertyId)?.status ?? null;
  }

  function getRequestIdFor(propertyId) {
    return sentRequests.find((r) => r.propertyId === propertyId)?.id ?? null;
  }

  return (
    <SentRequestsContext.Provider value={{ sentRequests, sendRequest, getStatusFor, getRequestIdFor, refresh }}>
      {children}
    </SentRequestsContext.Provider>
  );
}

export function useSentRequests() {
  const ctx = useContext(SentRequestsContext);
  if (!ctx) throw new Error('useSentRequests must be used within SentRequestsProvider');
  return ctx;
}
