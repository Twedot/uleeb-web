import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestsContext';
import { useSentRequests } from '../context/SentRequestsContext';
import { useNotifications } from '../context/NotificationsContext';
import { BellIcon, CompassIcon, HomeIcon, InboxIcon, PersonIcon } from './icons';
import { propertiesApi, agents as agentsApi, BASE_URL } from '../lib/api';

const SUGGESTIONS = [
  { label: 'Lagos', type: 'state' },
  { label: 'Abuja', type: 'state' },
  { label: 'Rivers', type: 'state' },
  { label: 'Kano', type: 'state' },
];

function SearchBar() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [properties, setProperties] = useState([]);
  const [agentResults, setAgentResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const debounce = useRef(null);

  const close = useCallback(() => { setOpen(false); setQ(''); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (q.trim().length < 2) { setProperties([]); setAgentResults([]); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [props, ags] = await Promise.allSettled([
          propertiesApi.search(q, token),
          agentsApi.search(q, token),
        ]);
        setProperties(props.status === 'fulfilled' ? (props.value ?? []) : []);
        setAgentResults(ags.status === 'fulfilled' ? (ags.value ?? []) : []);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [q, token]);

  function openSearch() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function go(path) { close(); navigate(path); }

  const hasResults = properties.length > 0 || agentResults.length > 0;
  const showSuggestions = q.trim().length < 2;

  return (
    <div ref={wrapRef} style={ss.wrap}>
      {/* Pill trigger */}
      <button type="button" onClick={openSearch} style={ss.pill} aria-label="Search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <span style={ss.pillText}>Search…</span>
      </button>

      {open && (
        <div style={ss.dropdown}>
          {/* Input row */}
          <div style={ss.inputRow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search properties, agents, states…"
              style={ss.input}
            />
            {q && <button type="button" onClick={() => setQ('')} style={ss.clearBtn}>✕</button>}
          </div>

          <div style={ss.body}>
            {loading && <p style={ss.hint}>Searching…</p>}

            {!loading && showSuggestions && (
              <>
                <p style={ss.sectionLabel}>Suggestions</p>
                {SUGGESTIONS.map((s) => (
                  <button key={s.label} type="button" style={ss.row} onClick={() => { setQ(s.label); inputRef.current?.focus(); }}>
                    <span style={ss.rowIcon}>📍</span>
                    <span style={ss.rowText}>{s.label}</span>
                    <span style={ss.rowSub}>State</span>
                  </button>
                ))}
                <button type="button" style={{ ...ss.row, borderTop: '1px solid #EEF6FF', marginTop: 4 }} onClick={() => go('/agents')}>
                  <span style={ss.rowIcon}>⭐</span>
                  <span style={ss.rowText}>Browse top agents</span>
                  <span style={ss.rowArrow}>›</span>
                </button>
              </>
            )}

            {!loading && !showSuggestions && !hasResults && (
              <p style={ss.hint}>No results for "{q}"</p>
            )}

            {!loading && properties.length > 0 && (
              <>
                <p style={ss.sectionLabel}>Properties</p>
                {properties.slice(0, 5).map((p) => (
                  <button key={p.id} type="button" style={ss.row} onClick={() => go(`/property/${p.id}`)}>
                    {p.photos?.[0]
                      ? <img src={`${BASE_URL}${p.photos[0]}`} alt="" style={ss.thumb} onError={(e) => { e.target.style.display = 'none'; }} />
                      : <div style={ss.thumbBlank} />}
                    <div style={ss.rowStack}>
                      <span style={ss.rowText}>{p.title}</span>
                      <span style={ss.rowSub}>{p.location}, {p.state} · ₦{Number(p.price).toLocaleString()}/yr</span>
                    </div>
                    <span style={ss.rowArrow}>›</span>
                  </button>
                ))}
              </>
            )}

            {!loading && agentResults.length > 0 && (
              <>
                <p style={ss.sectionLabel}>Agents</p>
                {agentResults.slice(0, 3).map((a) => (
                  <button key={a.id} type="button" style={ss.row} onClick={() => go(`/agents/${a.id}`)}>
                    <div style={ss.agentAvatar}>{a.name?.charAt(0)?.toUpperCase()}</div>
                    <div style={ss.rowStack}>
                      <span style={ss.rowText}>{a.name}{a.verified ? ' ✓' : ''}</span>
                      <span style={ss.rowSub}>{a.propertyCount} listing{a.propertyCount !== 1 ? 's' : ''}{a.state ? ` · ${a.state}` : ''}</span>
                    </div>
                    <span style={ss.rowArrow}>›</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ss = {
  wrap: { position: 'relative' },
  pill: {
    display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px',
    background: '#F0F7FF', border: '1.5px solid #DBEAFE', borderRadius: 999,
    cursor: 'pointer', minWidth: 160,
  },
  pillText: { fontSize: 13.5, color: '#94A3B8', fontWeight: 500 },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
    width: 420, background: '#FFFFFF', borderRadius: 18,
    boxShadow: '0 8px 40px rgba(37,99,235,0.14)', border: '1px solid #DBEAFE',
    overflow: 'hidden', zIndex: 2000,
  },
  inputRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
    borderBottom: '1px solid #EEF6FF',
  },
  input: { flex: 1, border: 'none', outline: 'none', fontSize: 14.5, color: '#0F172A', background: 'transparent' },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 13, padding: 0, lineHeight: 1 },
  body: { maxHeight: 380, overflowY: 'auto', paddingBottom: 6 },
  sectionLabel: {
    fontSize: 10.5, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase',
    color: '#94A3B8', padding: '10px 16px 4px',
  },
  hint: { fontSize: 13, color: '#94A3B8', padding: '14px 16px' },
  row: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    background: 'none', border: 'none', padding: '9px 16px', cursor: 'pointer',
    textAlign: 'left', transition: 'background 0.1s',
  },
  rowIcon: { fontSize: 15, flexShrink: 0 },
  rowText: { fontSize: 14, fontWeight: 600, color: '#0F172A', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowSub: { fontSize: 12, color: '#94A3B8', flexShrink: 0 },
  rowArrow: { fontSize: 16, color: '#CBD5E1', flexShrink: 0 },
  rowStack: { flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 },
  thumb: { width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  thumbBlank: { width: 38, height: 38, borderRadius: 8, background: '#DBEAFE', flexShrink: 0 },
  agentAvatar: {
    width: 34, height: 34, borderRadius: 999, background: '#2563EB',
    color: '#FFFFFF', fontWeight: 700, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
};

// Real web layout for the authenticated app — a fixed TOP nav bar (same
// pattern as the marketing site's own Nav.jsx: logo left, links center,
// account right), not a bottom tab bar simulating a phone. Content below
// it is a normal responsive page, not a boxed phone-width column — each
// page picks its own sensible max-width for its own content instead of
// this shell forcing one on everything.
const TABS = [
  { to: '/discover', label: 'Discover', icon: CompassIcon, roles: ['tenant'] },
  { to: '/properties', label: 'Properties', icon: HomeIcon, roles: ['landlord'] },
  { to: '/requests', label: 'Requests', icon: InboxIcon, roles: ['tenant', 'landlord'] },
  { to: '/profile', label: 'Profile', icon: PersonIcon, roles: ['tenant', 'landlord'] },
];

export default function AppShell() {
  const { user } = useAuth();
  const role = user?.role ?? 'tenant';
  const visibleTabs = TABS.filter((t) => t.roles.includes(role));
  const firstName = user?.name?.split(' ')[0] ?? 'You';
  const initials = firstName.charAt(0).toUpperCase();
  const walletNaira = Math.floor((user?.walletKobo ?? 0) / 100);
  // A badge on the Requests tab for whatever needs this account's
  // attention: a landlord hasn't reviewed yet ('new' applicants), a
  // tenant has something outstanding worth checking — a request still
  // pending a decision OR one that just got accepted (declined ones are
  // resolved, nothing to draw the eye to). Both contexts already poll
  // every 8s, so this stays live without any extra fetching of its own.
  const { requests } = useRequests();
  const { sentRequests } = useSentRequests();
  const { unreadCount: notifUnread } = useNotifications();
  const requestsBadge = role === 'landlord'
    ? requests.filter((r) => r.status === 'new').length
    : sentRequests.filter((r) => r.status === 'new' || r.status === 'accepted').length;

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <Link to={visibleTabs[0]?.to ?? '/profile'} style={styles.logo}>
            <img src="/logo.png" alt="uleeb" width={30} height={30} style={{ borderRadius: 9 }} />
            <span style={styles.logoText}>uleeb</span>
          </Link>

          <div style={styles.links}>
            {visibleTabs.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="app-nav-link" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : null) })}>
                {({ isActive }) => (
                  <>
                    <span style={{ position: 'relative', display: 'flex' }}>
                      <Icon size={17} color={isActive ? '#2563EB' : '#475569'} strokeWidth={to === '/discover' ? 2 : 1.8} />
                      {to === '/requests' && requestsBadge > 0 && (
                        <span style={styles.badge}>{requestsBadge > 9 ? '9+' : requestsBadge}</span>
                      )}
                    </span>
                    <span className="app-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <SearchBar />

          <div style={styles.rightGroup}>
            <div className="wallet-chip" style={styles.walletChip}>
              <span style={{ fontSize: 13 }}>💰</span>
              <span style={styles.walletChipText}>₦{walletNaira.toLocaleString()}</span>
            </div>
            <Link to="/notifications" style={styles.bellBtn} aria-label="Notifications">
              <BellIcon size={17} color="#475569" />
              {notifUnread > 0 && (
                <span style={styles.badge}>{notifUnread > 9 ? '9+' : notifUnread}</span>
              )}
            </Link>
            <Link to="/profile" style={styles.avatar} aria-label="Profile">
              <span style={styles.avatarText}>{initials}</span>
            </Link>
          </div>
        </div>
      </nav>

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100dvh', background: '#EEF6FF' },
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100, height: 64,
    background: 'rgba(238,246,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #DBEAFE',
  },
  navInner: {
    height: '100%', maxWidth: 1120, margin: '0 auto', padding: '0 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 },
  logoText: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 17, color: '#0F172A' },
  links: { display: 'flex', alignItems: 'center', gap: 4 },
  link: {
    display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: '#475569',
    fontSize: 14, fontWeight: 600, padding: '8px 14px', borderRadius: 999,
  },
  linkActive: { color: '#2563EB', background: '#DBEAFE' },
  badge: {
    position: 'absolute', top: -6, right: -8, minWidth: 15, height: 15, padding: '0 3px', borderRadius: 999,
    background: '#2563EB', color: '#FFFFFF', fontSize: 9.5, fontWeight: 700, lineHeight: '15px', textAlign: 'center',
  },
  rightGroup: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  walletChip: {
    display: 'flex', alignItems: 'center', gap: 5, height: 34, padding: '0 12px', borderRadius: 999,
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: 'none', cursor: 'pointer',
    flexShrink: 0,
  },
  walletChipText: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 13, color: '#FFFFFF' },
  bellBtn: {
    position: 'relative', width: 34, height: 34, borderRadius: 999,
    border: '1.5px solid #BFDBFE', background: '#FFFFFF', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
  },
  avatar: {
    width: 34, height: 34, borderRadius: 999, background: '#2563EB', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
  },
  avatarText: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 13, color: '#FFFFFF' },
  content: { paddingTop: 64, minHeight: '100dvh', background: '#FFFFFF' },
};
