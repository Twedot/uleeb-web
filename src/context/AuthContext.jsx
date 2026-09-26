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
        // A dead session — either the token itself is no good (401) or
        // the account it points at is simply gone (404, e.g. deleted
        // between visits) — should sign the device out so it can log in
        // fresh. Anything else (network blip) is transient and shouldn't
        // touch the stored token. Missing this 404 case meant a stale
        // token from a since-removed account was NEVER cleared: every
        // page load kept retrying the same dead token, got the same
        // failure, and landed back on the login screen every time.
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
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

  // Web counterpart to mobile's payAndUpgrade — same two-call shape
  // (initialize -> real Paystack checkout -> verify), but a full-page
  // redirect instead of WebBrowser.openAuthSessionAsync (the standard way
  // a web app hands off to a hosted checkout). Paystack redirects back to
  // callbackUrl with a `reference` query param; verifyUpgrade below
  // (called by pages/Plans.jsx on load) finishes the job.
  async function initiateUpgrade(plan, months = 1) {
    if (!token) throw new Error('Not signed in');
    const callbackUrl = `${window.location.origin}/plans`;
    const init = await api.post('/billing/paystack/initialize', { plan, months, callbackUrl }, token);
    window.location.href = init.authorizationUrl;
  }

  async function verifyUpgrade(reference) {
    if (!token) return null;
    const updated = await api.post('/billing/paystack/verify', { reference }, token);
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
        initiateUpgrade,
        verifyUpgrade,
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
