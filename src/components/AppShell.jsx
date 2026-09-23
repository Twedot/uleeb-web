import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CompassIcon, HomeIcon, InboxIcon, PersonIcon } from './icons';

// Web counterpart to uleeb mobile's app/(tabs)/_layout.tsx — same
// role-based tab visibility (tenants get Discover, landlords get
// Properties; both always get Requests and Profile), same tab set.
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

  return (
    <div style={styles.shell}>
      <div style={styles.content}>
        <Outlet />
      </div>
      <nav style={styles.tabBar}>
        {visibleTabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({ ...styles.tab, ...(isActive ? styles.tabActive : null) })}>
            {({ isActive }) => (
              <>
                <Icon size={22} color={isActive ? '#131110' : '#9B968C'} strokeWidth={to === '/discover' ? 2 : 1.8} />
                <span style={{ ...styles.tabLabel, color: isActive ? '#131110' : '#9B968C' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 480, margin: '0 auto',
    background: '#F7F6F2', position: 'relative', overflow: 'hidden',
  },
  content: { flex: 1, minHeight: 0, overflowY: 'auto' },
  tabBar: {
    display: 'flex', borderTop: '1px solid #EFEDE6', background: '#FFFFFF',
    paddingTop: 8, paddingBottom: 'max(8px, env(safe-area-inset-bottom))', flexShrink: 0,
  },
  tab: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    textDecoration: 'none', paddingTop: 2, paddingBottom: 2,
  },
  tabActive: {},
  tabLabel: { fontSize: 11, fontWeight: 600 },
};
