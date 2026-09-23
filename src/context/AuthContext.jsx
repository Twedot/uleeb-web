import { createContext, useContext, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';

// Mirrors uleeb mobile's store/auth.tsx — same shape, same backend
// calls, same "how much of the profile is already filled in decides
// where you land" logic — just localStorage instead of AsyncStorage,
// and pages navigate themselves (via react-router) instead of a
// module-level `router` import.

export function isRoleVerified(user, role) {
  if (!user) return false;
  return role === 'landlord' ? user.landlordVerified : user.tenantVerified;
}

// Where to land right after a successful sign-in/verify, based on how
// much of the profile is already filled in — tenants land on the swipe
// deck, landlords on their own listings, mirroring the mobile tab
// bar's own role-based default (see components/AppShell.jsx).
export function postAuthRoute(user) {
  if (!user) return '/login';
  if (!user.role) return '/account-type';
  return user.role === 'landlord' ? '/properties' : '/discover';
}

const TOKEN_KEY = 'uleeb.web.token';

function fromApiUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    occupation: u.occupation,
    role: u.role,
    state: u.state,
    country: u.country,
    budget: u.budget != null ? String(u.budget) : undefined,
    landlordType: u.landlordType,
    tenantVerified: u.tenantVerified,
    landlordVerified: u.landlordVerified,
    plan: u.plan,
    planExpiresAt: u.planExpiresAt,
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [pendingPhone, setPendingPhone] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
          const me = await api.get('/me', stored);
          setToken(stored);
          setUser(fromApiUser(me));
        }
      } catch (err) {
        // Only a real "this token is no good" response should sign the
        // device out — anything else (network blip) is transient.
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function persistSession(res) {
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    const authUser = fromApiUser(res.user);
    setUser(authUser);
    return authUser;
  }

  async function requestPhoneCode(phone) {
    setIsSigningIn(true);
    try {
      await api.post('/auth/phone/request-code', { phone });
      setPendingPhone(phone);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function verifyPhoneCode(code) {
    if (!pendingPhone) return null;
    setIsSigningIn(true);
    try {
      const res = await api.post('/auth/phone/verify', { phone: pendingPhone, code, role: '' });
      const authUser = await persistSession(res);
      setPendingPhone(null);
      return authUser;
    } catch {
      return null;
    } finally {
      setIsSigningIn(false);
    }
  }

  function cancelPhoneVerification() {
    setPendingPhone(null);
  }

  async function setRole(role) {
    if (!token) throw new Error('Not signed in');
    const updated = await api.patch('/me', { role }, token);
    const authUser = fromApiUser(updated);
    setUser(authUser);
    return authUser;
  }

  async function updateProfile(fields) {
    if (!token) return;
    const payload = { ...fields };
    if (fields.budget !== undefined) payload.budget = Number(fields.budget) || 0;
    const updated = await api.patch('/me', payload, token);
    setUser(fromApiUser(updated));
  }

  async function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setPendingPhone(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isSigningIn,
        pendingPhone,
        requestPhoneCode,
        verifyPhoneCode,
        cancelPhoneVerification,
        setRole,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
