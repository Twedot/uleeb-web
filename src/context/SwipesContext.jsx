import { createContext, useContext } from 'react';
import { api, ApiError } from '../lib/api';
import { useAuth } from './AuthContext';

// Mirrors uleeb mobile's store/swipes.tsx — records a swipe in either
// direction (right also creates the Request server-side, same as the old
// dedicated endpoint did). Throws ApiError(402) if the free-plan 15-swipe
// rolling cap is hit.
const SwipesContext = createContext(null);

export function SwipesProvider({ children }) {
  const { token } = useAuth();

  async function recordSwipe(propertyId, direction) {
    if (!token) throw new ApiError(401, 'Not signed in');
    return api.post(`/properties/${propertyId}/swipe`, { direction }, token);
  }

  return <SwipesContext.Provider value={{ recordSwipe }}>{children}</SwipesContext.Provider>;
}

export function useSwipes() {
  const ctx = useContext(SwipesContext);
  if (!ctx) throw new Error('useSwipes must be used within SwipesProvider');
  return ctx;
}
