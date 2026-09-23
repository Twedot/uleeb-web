import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CompassIcon, HomeIcon, InboxIcon, PersonIcon } from './icons';

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
                    <Icon size={17} color={isActive ? '#131110' : '#5B5750'} strokeWidth={to === '/discover' ? 2 : 1.8} />
                    <span className="app-nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <Link to="/profile" style={styles.avatar} aria-label="Profile">
            <span style={styles.avatarText}>{initials}</span>
          </Link>
        </div>
      </nav>

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100dvh', background: '#F7F6F2' },
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100, height: 64,
    background: 'rgba(247,246,242,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #EFEDE6',
  },
  navInner: {
    height: '100%', maxWidth: 1120, margin: '0 auto', padding: '0 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 },
  logoText: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: '#181614' },
  links: { display: 'flex', alignItems: 'center', gap: 4 },
  link: {
    display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: '#5B5750',
    fontSize: 14, fontWeight: 600, padding: '8px 14px', borderRadius: 999,
  },
  linkActive: { color: '#131110', background: '#FFFFFF' },
  avatar: {
    width: 34, height: 34, borderRadius: 999, background: '#131110', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
  },
  avatarText: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#FFFFFF' },
  content: { paddingTop: 64, minHeight: '100dvh' },
};
