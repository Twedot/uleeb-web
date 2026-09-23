import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

// Mirrors uleeb mobile's store/bookmarks.tsx exactly (same endpoints, same
// Plus/Pro-only gating).
const BookmarksContext = createContext(null);

export function BookmarksProvider({ children }) {
  const { token, user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    // Bookmarking is Plus/Pro only — free tenants have nothing to fetch and
    // the endpoint would 402 anyway.
    if (!token || user?.plan === 'free') {
      setBookmarks([]);
      return;
    }
    setLoading(true);
    try {
      const list = await api.get('/bookmarks', token);
      setBookmarks(list ?? []);
    } catch {
      // keep whatever we last had on a transient failure
    } finally {
      setLoading(false);
    }
  }, [token, user?.plan]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isBookmarked(propertyId) {
    return bookmarks.some((p) => p.id === propertyId);
  }

  async function toggleBookmark(propertyId) {
    if (!token) return;
    if (isBookmarked(propertyId)) {
      await api.del(`/properties/${propertyId}/bookmark`, token);
      setBookmarks((prev) => prev.filter((p) => p.id !== propertyId));
    } else {
      await api.post(`/properties/${propertyId}/bookmark`, undefined, token);
      await refresh();
    }
  }

  return (
    <BookmarksContext.Provider value={{ bookmarks, loading, isBookmarked, toggleBookmark, refresh }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
}
