import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestsContext';
import { useSentRequests } from '../context/SentRequestsContext';
import { CheckIcon, ChevronRightIcon, HomeIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/(tabs)/requests/index.tsx —
// role-branched: a landlord sees applicants for their listings, a tenant
// sees the requests they've sent. Both poll (see RequestsContext/
// SentRequestsContext) so an accept/decline made on the other side shows
// up here without a manual refresh.
export default function Requests() {
  const { user } = useAuth();
  return user?.role === 'landlord' ? <LandlordRequests /> : <TenantSentRequests />;
}

function LandlordRequests() {
  const { requests } = useRequests();
  const navigate = useNavigate();
  const pendingCount = requests.filter((r) => r.status === 'new').length;

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <h1 style={styles.title}>Requests</h1>
        <p style={styles.subtitle}>{pendingCount} new · click to review</p>
      </div>

      {requests.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>No requests yet</p>
          <p style={styles.emptySub}>Tenants who like your listing will show up here.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {requests.map((item) => <ApplicantRow key={item.id} item={item} onClick={() => navigate(`/requests/${item.id}`)} />)}
        </div>
      )}
    </div>
  );
}

function ApplicantRow({ item, onClick }) {
  const resolved = item.status !== 'new';
  const name = item.tenantName || 'Tenant';

  return (
    <button type="button" onClick={onClick} style={{ ...styles.row, ...(resolved ? { opacity: item.status === 'declined' ? 0.55 : 1 } : null) }}>
      <div style={{ ...styles.avatar, ...(item.status === 'new' ? styles.avatarNew : null) }}>
        <span style={{ ...styles.avatarText, ...(item.status !== 'new' ? { color: '#9B968C' } : null) }}>{name.charAt(0)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={styles.nameRow}>
          <span style={styles.name}>{name}</span>
          {item.tenantVerified && <CheckIcon size={11} color="#2F8F55" />}
        </div>
        <p style={styles.meta}>
          {item.occupation || 'Occupation not set'}
          {item.budget ? ` · ₦${item.budget.toLocaleString()} budget` : ''}
        </p>
      </div>
      {item.status === 'new' && (
        <>
          <span style={styles.newChip}>New</span>
          <span style={styles.chevron}><ChevronRightIcon size={10} /></span>
        </>
      )}
      {item.status === 'accepted' && <span style={{ ...styles.statusChip, background: '#E3F5EA', color: '#1F6B3D' }}>Accepted</span>}
      {item.status === 'declined' && <span style={{ ...styles.statusChip, background: '#F0EFE9', color: '#9B968C' }}>Declined</span>}
    </button>
  );
}

function TenantSentRequests() {
  const { sentRequests } = useSentRequests();
  const navigate = useNavigate();
  const pendingCount = sentRequests.filter((r) => r.status === 'new').length;

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <h1 style={styles.title}>Your requests</h1>
        <p style={styles.subtitle}>{pendingCount} pending · click a home for details</p>
      </div>

      {sentRequests.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>No requests yet</p>
          <p style={styles.emptySub}>Swipe right on a home in Discover to send a request.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {sentRequests.map((item) => <SentRequestRow key={item.id} item={item} onClick={() => navigate(`/property/${item.propertyId}`)} />)}
        </div>
      )}
    </div>
  );
}

function SentRequestRow({ item, onClick }) {
  // The backend embeds this directly in /requests/mine — deliberately
  // NOT re-derived from ListingsContext's discovery feed, which now
  // excludes every property you've already requested (see
  // uleeb-api's PropertyIDsForTenant), guaranteeing a lookup there
  // would never find it.
  const property = item.property;
  if (!property) return null;

  return (
    <button type="button" onClick={onClick} style={{ ...styles.row, ...(item.status === 'declined' ? { opacity: 0.55 } : null) }}>
      <div style={styles.propertyThumb}><HomeIcon size={20} color="#9B968C" /></div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <p style={styles.name}>{property.title}</p>
        <p style={styles.meta}>₦{Number(property.price ?? 0).toLocaleString()} / year</p>
      </div>
      {item.status === 'new' && <span style={styles.newChip}>Pending</span>}
      {item.status === 'accepted' && <span style={{ ...styles.statusChip, background: '#E3F5EA', color: '#1F6B3D' }}>Accepted</span>}
      {item.status === 'declined' && <span style={{ ...styles.statusChip, background: '#F0EFE9', color: '#9B968C' }}>Declined</span>}
    </button>
  );
}

const styles = {
  screen: { maxWidth: 640, margin: '0 auto', padding: '24px 24px 48px' },
  header: { marginBottom: 8 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#181614' },
  subtitle: { fontSize: 13, color: '#5B5750', marginTop: 4 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#181614', marginBottom: 8 },
  emptySub: { fontSize: 13.5, color: '#5B5750', lineHeight: '20px' },
  list: { display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16 },
  row: {
    background: '#FFFFFF', border: '1px solid #EFEDE6', borderRadius: 20, padding: 14,
    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%',
  },
  avatar: { width: 44, height: 44, borderRadius: 999, background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarNew: { background: '#131110' },
  avatarText: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: '#FFFFFF' },
  propertyThumb: { width: 44, height: 44, borderRadius: 12, background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 5 },
  name: { fontWeight: 700, fontSize: 14.5, color: '#181614' },
  meta: { fontSize: 12, color: '#9B968C', marginTop: 2 },
  newChip: { background: '#F0EFE9', padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, color: '#181614' },
  chevron: { width: 26, height: 26, borderRadius: 999, background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statusChip: { padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700 },
};
