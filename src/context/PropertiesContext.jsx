import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

// Landlord's own listings — mirrors uleeb mobile's store/properties.tsx.
// Read-only for now: mobile's addProperty uploads photos/video/document via
// multipart form data, a real file-upload flow that's its own separate
// build (see the "Add property" button's placeholder in pages/Properties).
const PropertiesContext = createContext(null);

export function PropertiesProvider({ children }) {
  const { token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    // Not gated on current role — properties you've listed stay yours
    // across a role switch, and the backend already scopes this to what
    // you actually own.
    if (!token) return;
    setLoading(true);
    try {
      const list = await api.get('/properties/mine/list', token);
      setProperties(list ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <PropertiesContext.Provider value={{ properties, loading, refresh }}>{children}</PropertiesContext.Provider>;
}

export function useProperties() {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error('useProperties must be used within PropertiesProvider');
  return ctx;
}
