import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { useAuth } from './AuthContext';


// Mirrors uleeb mobile's store/swipes.tsx — records a swipe in either
// direction (right also creates the Request server-side, same as the old
// dedicated endpoint did). Throws ApiError(402) if the free-plan 15-swipe
// rolling cap is hit.
// Also fetches the current swipe count on mount so free-plan tenants can
// see their remaining swipes before they start swiping.
const SwipesContext = createContext(null);

export function SwipesProvider({ children }) {
  const { token } = useAuth();
  // null = not loaded yet; -1 = unlimited (Plus/Pro); ≥0 = remaining today
  const [swipesRemaining, setSwipesRemaining] = useState(null);
  const [swipesCap, setSwipesCap] = useState(15);

  const fetchCount = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.get('/me/swipe-count', token);
      setSwipesRemaining(data.remaining ?? null);
      if (data.cap > 0) setSwipesCap(data.cap);
    } catch {
      // non-fatal — count display is best-effort
    }
  }, [token]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  async function recordSwipe(propertyId, direction) {
    if (!token) throw new ApiError(401, 'Not signed in');
    const result = await api.post(`/properties/${propertyId}/swipe`, { direction }, token);
    if (result?.remaining !== undefined) setSwipesRemaining(result.remaining);
    return result;
  }

  return (
    <SwipesContext.Provider value={{ recordSwipe, swipesRemaining, swipesCap }}>
      {children}
    </SwipesContext.Provider>
  );
}

export function useSwipes() {
  const ctx = useContext(SwipesContext);
  if (!ctx) throw new Error('useSwipes must be used within SwipesProvider');
  return ctx;
}
