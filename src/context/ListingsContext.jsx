import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

// Tenant's browse feed — mirrors uleeb mobile's store/listings.tsx exactly
// (same endpoint, same shape). `country` is only actually honored by the
// backend for Pro tenants; everyone else is locked server-side to their own
// account country regardless of what's passed here.
const ListingsContext = createContext(null);

export function ListingsProvider({ children }) {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(
    async (country) => {
      if (!token) return;
      setLoading(true);
      try {
        const query = country ? `?country=${encodeURIComponent(country)}` : '';
        const list = await api.get(`/properties${query}`, token);
        setListings(list ?? []);
      } catch {
        // Keep whatever we last had rather than blanking the feed on a
        // transient network error.
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <ListingsContext.Provider value={{ listings, loading, refresh }}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings must be used within ListingsProvider');
  return ctx;
}
