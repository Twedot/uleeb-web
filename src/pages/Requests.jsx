import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestsContext';
import { useSentRequests } from '../context/SentRequestsContext';
import { CheckIcon, ChevronRightIcon, HomeIcon } from '../components/icons';

export default function Requests() {
  const { user } = useAuth();
  return user?.role === 'landlord' ? <LandlordRequests /> : <TenantSentRequests />;
}

function LandlordRequests() {
  const { requests } = useRequests();
  const navigate = useNavigate();
  const newItems = requests.filter((r) => r.status === 'new');
  const otherItems = requests.filter((r) => r.status !== 'new');

  const groups = [
    { label: 'New', items: newItems },
    { label: 'Reviewed', items: otherItems },
  ].filter((g) => g.items.length > 0);

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Requests</h1>
          {newItems.length > 0 && (
            <span style={styles.badge}>{newItems.length > 9 ? '9+' : newItems.length}</span>
          )}
        </div>
        <p style={styles.subtitle}>Tap a name to review and respond</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No requests yet" sub="Tenants who like your listing will show up here." />
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.label}>
              <p style={styles.groupLabel}>{group.label}</p>
              <div style={styles.groupBlock}>
                {group.items.map((item, i) => (
                  <ApplicantRow
                    key={item.id}
                    item={item}
                    isLast={i === group.items.length - 1}
                    onClick={() => navigate(`/requests/${item.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicantRow({ item, isLast, onClick }) {
  const name = item.tenantName || 'Tenant';
  const initials = name.charAt(0).toUpperCase();
  const isNew = item.status === 'new';
  const isAccepted = item.status === 'accepted';
  const isDeclined = item.status === 'declined';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.row,
        ...(!isLast ? styles.rowBorder : null),
        ...(isDeclined ? { opacity: 0.5 } : null),
      }}
    >
      <div style={{ ...styles.avatar, ...(isNew ? styles.avatarNew : styles.avatarDone) }}>
        <span style={styles.avatarText}>{initials}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={styles.nameRow}>
          <span style={styles.name}>{name}</span>
          {item.tenantVerified && <CheckIcon size={11} color="#16A34A" />}
        </div>
        <p style={styles.meta}>
          {item.occupation || 'Occupation not set'}
          {item.budget ? ` · ₦${item.budget.toLocaleString()} budget` : ''}
        </p>
      </div>
      {isNew && (
        <>
          <span style={styles.newChip}>New</span>
          <ChevronRightIcon size={12} color="#94A3B8" />
        </>
      )}
      {isAccepted && <span style={{ ...styles.statusChip, background: '#D1FAE5', color: '#15803D' }}>Accepted</span>}
      {isDeclined && <span style={{ ...styles.statusChip, background: '#F1F5F9', color: '#94A3B8' }}>Declined</span>}
    </button>
  );
}

function TenantSentRequests() {
  const { sentRequests } = useSentRequests();
  const navigate = useNavigate();
  const pendingItems = sentRequests.filter((r) => r.status === 'new');
  const resolvedItems = sentRequests.filter((r) => r.status !== 'new');

  const groups = [
    { label: 'Pending', items: pendingItems },
    { label: 'Resolved', items: resolvedItems },
  ].filter((g) => g.items.length > 0);

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>My requests</h1>
          {pendingItems.length > 0 && (
            <span style={styles.badge}>{pendingItems.length > 9 ? '9+' : pendingItems.length}</span>
          )}
        </div>
        <p style={styles.subtitle}>Swipe right in Discover to send a request</p>
      </div>

      {sentRequests.length === 0 ? (
        <EmptyState title="No requests yet" sub="Swipe right on a home in Discover to send a request." />
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.label}>
              <p style={styles.groupLabel}>{group.label}</p>
              <div style={styles.groupBlock}>
                {group.items.map((item, i) => (
                  <SentRequestRow
                    key={item.id}
                    item={item}
                    isLast={i === group.items.length - 1}
                    onClick={() => navigate(`/property/${item.propertyId}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SentRequestRow({ item, isLast, onClick }) {
  const property = item.property;
  if (!property) return null;
  const photo = property.photos?.[0];
  const isAccepted = item.status === 'accepted';
  const isDeclined = item.status === 'declined';
  const isPending = item.status === 'new';
  const isRented = property.verificationStatus === 'rented';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.row,
        ...(!isLast ? styles.rowBorder : null),
        ...(isDeclined ? { opacity: 0.5 } : null),
      }}
    >
      <div style={styles.thumb}>
        {photo ? (
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
        ) : (
          <HomeIcon size={18} color="#94A3B8" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <p style={styles.name}>{property.title}</p>
        <p style={styles.meta}>{property.location}, {property.state}</p>
        <p style={{ ...styles.meta, marginTop: 1 }}>₦{Number(property.price ?? 0).toLocaleString()} / year</p>
      </div>
      {isRented && <span style={{ ...styles.statusChip, background: '#F3E8FF', color: '#7C3AED' }}>Rented</span>}
      {!isRented && isPending && <span style={styles.newChip}>Pending</span>}
      {!isRented && isAccepted && <span style={{ ...styles.statusChip, background: '#D1FAE5', color: '#15803D' }}>Accepted</span>}
      {!isRented && isDeclined && <span style={{ ...styles.statusChip, background: '#F1F5F9', color: '#94A3B8' }}>Declined</span>}
    </button>
  );
}

function EmptyState({ title, sub }) {
  return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}><HomeIcon size={24} color="#94A3B8" /></div>
      <p style={styles.emptyTitle}>{title}</p>
      <p style={styles.emptySub}>{sub}</p>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 600, margin: '0 auto', padding: '24px 0 48px' },
  header: { padding: '0 20px 16px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 24, color: '#0F172A' },
  badge: {
    minWidth: 22, height: 22, borderRadius: 999, background: '#EF4444', color: '#FFFFFF',
    fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 5px',
  },
  subtitle: { fontSize: 13, color: '#94A3B8' },
  groupLabel: {
    fontSize: 12.5, fontWeight: 700, color: '#94A3B8', padding: '4px 20px 6px',
  },
  groupBlock: {
    background: '#FFFFFF', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9',
    marginBottom: 20,
  },
  row: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
    background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
  },
  rowBorder: { borderBottom: '1px solid #F1F5F9' },
  avatar: {
    width: 48, height: 48, borderRadius: 999, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  avatarNew: { background: '#0F172A' },
  avatarDone: { background: '#E2E8F0' },
  avatarText: { fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 700, color: '#FFFFFF' },
  thumb: {
    width: 48, height: 48, borderRadius: 14, background: '#E3EFFD', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  nameRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 },
  name: { fontWeight: 700, fontSize: 14.5, color: '#0F172A' },
  meta: { fontSize: 12, color: '#94A3B8', marginTop: 1, lineHeight: '16px' },
  newChip: {
    background: '#DBEAFE', padding: '5px 11px', borderRadius: 999,
    fontSize: 11.5, fontWeight: 700, color: '#2563EB', flexShrink: 0,
  },
  statusChip: { padding: '5px 11px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, flexShrink: 0 },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 32px', textAlign: 'center', gap: 12,
  },
  emptyIcon: {
    width: 56, height: 56, borderRadius: 18, background: '#F1F5F9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A', marginBottom: 4 },
  emptySub: { fontSize: 13.5, color: '#475569', lineHeight: '20px', maxWidth: 280 },
};
