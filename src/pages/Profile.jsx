import { useNavigate } from 'react-router-dom';
import { useAuth, isRoleVerified } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import { CheckIcon, ChevronRightIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/(tabs)/profile.tsx — replaces the
// old placeholder Home.jsx (see its own header comment: "this page exists
// to prove the auth funnel really works end to end", always meant to be
// swapped for the real thing).
export default function Profile() {
  const { user, signOut } = useAuth();
  const { properties } = useProperties();
  const navigate = useNavigate();

  if (!user) return null;

  const firstName = user.name?.split(' ')[0] ?? 'You';
  const initials = firstName.charAt(0).toUpperCase();
  const isLandlord = user.role === 'landlord';
  const planLabel = (user.plan ?? 'free').toUpperCase();
  const verified = isRoleVerified(user, user.role ?? 'tenant');

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div style={styles.screen}>
      <button type="button" style={styles.header} onClick={() => navigate('/edit-profile')}>
        <div style={styles.avatar}>
          <span style={styles.avatarText}>{initials}</span>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{firstName}</span>
            {verified && (
              <span style={styles.verifiedBadge}>
                <CheckIcon size={11} color="#FFFFFF" strokeWidth={2.6} />
              </span>
            )}
          </div>
          <p style={styles.plan}>
            {(isLandlord ? 'LANDLORD' : 'TENANT')} · {planLabel} PLAN
          </p>
        </div>
      </button>

      {!verified && (
        <button type="button" style={styles.nudge} onClick={() => navigate('/edit-profile')}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={styles.nudgeTitle}>Finish setting up your {isLandlord ? 'landlord' : 'tenant'} profile</p>
            <p style={styles.nudgeSub}>
              {isLandlord ? 'Add how you list properties to get verified.' : 'Add your occupation, budget, and state to get verified.'}
            </p>
          </div>
          <ChevronRightIcon size={14} color="#9B968C" />
        </button>
      )}

      {isLandlord ? (
        <div style={styles.leaseCard}>
          <p style={styles.leaseLabel}>Properties listed</p>
          <p style={styles.leaseTitle}>{properties.length}</p>
          <p style={styles.leaseSub}>
            {properties.length === 0 ? 'List your first property to get started.' : 'Manage them from the Properties tab.'}
          </p>
        </div>
      ) : (
        <div style={styles.leaseCard}>
          <p style={styles.leaseLabel}>Current lease</p>
          <p style={styles.leaseTitle}>None yet</p>
          <p style={styles.leaseSub}>Swipe on a home to get started.</p>
        </div>
      )}

      <div style={styles.menu}>
        <MenuRow label="Edit profile" sub="Name, occupation, state" onClick={() => navigate('/edit-profile')} />
        <MenuRow
          label={isLandlord ? 'Switch to tenant' : 'Switch to landlord'}
          sub={isLandlord ? 'Browse and request homes instead' : 'List a property instead'}
          onClick={() => navigate('/account-type')}
        />
        {!isLandlord && <MenuRow label="Verification" sub="What each badge means" onClick={() => navigate('/trust')} />}
        {!isLandlord && <MenuRow label="Saved homes" sub="Homes you've bookmarked" onClick={() => navigate('/saved-homes')} />}
        <MenuRow label="Plans" sub="Free · Plus · Pro" onClick={() => navigate('/plans')} />
        <MenuRow label="Sign out" sub={user.email ?? user.phone ?? ''} onClick={handleSignOut} />
      </div>
    </div>
  );
}

function MenuRow({ label, sub, onClick }) {
  return (
    <button type="button" style={styles.menuRow} onClick={onClick}>
      <div style={{ textAlign: 'left' }}>
        <p style={styles.menuLabel}>{label}</p>
        <p style={styles.menuSub}>{sub}</p>
      </div>
      <ChevronRightIcon size={14} color="#9B968C" />
    </button>
  );
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 24px 24px', overflowY: 'auto', height: '100%' },
  header: { display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  avatar: {
    width: 56, height: 56, borderRadius: 999, background: '#131110',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: '#FFFFFF' },
  nameRow: { display: 'flex', alignItems: 'center', gap: 6 },
  name: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: '#181614' },
  verifiedBadge: {
    width: 18, height: 18, borderRadius: 999, background: '#2F8F55',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  plan: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, color: '#9B968C', marginTop: 2 },
  nudge: {
    display: 'flex', alignItems: 'center', gap: 10, background: '#F0EFE9', border: '1px solid #EFEDE6',
    borderRadius: 16, padding: 16, cursor: 'pointer',
  },
  nudgeTitle: { fontSize: 13.5, fontWeight: 700, color: '#181614', marginBottom: 2 },
  nudgeSub: { fontSize: 12, color: '#9B968C' },
  leaseCard: { background: '#FFFFFF', border: '1px solid #EFEDE6', borderRadius: 28, padding: 16 },
  leaseLabel: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#9B968C', marginBottom: 6 },
  leaseTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: '#181614', marginBottom: 4 },
  leaseSub: { fontSize: 13, color: '#5B5750' },
  menu: { display: 'flex', flexDirection: 'column', gap: 12 },
  menuRow: {
    background: '#FFFFFF', border: '1px solid #EFEDE6', borderRadius: 16, padding: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%',
  },
  menuLabel: { fontSize: 14.5, fontWeight: 700, color: '#181614' },
  menuSub: { fontSize: 12, color: '#9B968C', marginTop: 2 },
};
