import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import { HomeIcon, PlayIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/(tabs)/properties.tsx.
const LISTING_LIMITS = { free: 1, pro: 5 };

export default function Properties() {
  const { user } = useAuth();
  const { properties } = useProperties();
  const navigate = useNavigate();
  const limit = user?.plan ? LISTING_LIMITS[user.plan] : undefined;

  function handleAddProperty() {
    if (limit !== undefined && properties.length >= limit) {
      if (window.confirm(`Your ${user.plan} plan is limited to ${limit} propert${limit === 1 ? 'y' : 'ies'}. View plans to add more?`)) {
        navigate('/plans');
      }
      return;
    }
    navigate('/add-property');
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Your properties</h1>
          <p style={styles.subtitle}>
            {properties.length} listed{limit !== undefined ? ` · ${user?.plan} plan (max ${limit})` : ''}
          </p>
        </div>
        <button type="button" style={styles.addBtn} onClick={handleAddProperty}>
          Add property
        </button>
      </div>

      {properties.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>No properties yet</p>
          <p style={styles.emptySub}>List your first property to start receiving requests.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {properties.map((item) => (
            <PropertyRow key={item.id} item={item} onClick={() => navigate(`/my-properties/${item.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyRow({ item, onClick }) {
  return (
    <button type="button" onClick={onClick} style={styles.row}>
      <div style={styles.thumb}>
        {item.photos?.[0] ? (
          <img src={item.photos[0]} alt="" style={styles.thumbImg} />
        ) : (
          <HomeIcon size={20} color="#9B968C" />
        )}
        {item.videoUrl && (
          <div style={styles.videoBadge}>
            <PlayIcon size={9} color="#FFFFFF" />
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <p style={styles.name}>{item.title}</p>
        <p style={styles.meta}>
          ₦{Number(item.price || 0).toLocaleString()} / year · {item.photos?.length ?? 0} photos
        </p>
        {item.verificationStatus === 'verified' && (
          <span style={{ ...styles.statusBadge, background: '#E3F5EA', color: '#2F8F55' }}>Verified</span>
        )}
        {item.verificationStatus === 'under_review' && (
          <span style={{ ...styles.statusBadge, background: '#FBF1DA', color: '#B8860B' }}>Under review</span>
        )}
      </div>
    </button>
  );
}

const styles = {
  screen: { maxWidth: 1120, margin: '0 auto', padding: '32px 24px 48px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#181614' },
  subtitle: { fontSize: 13, color: '#5B5750', marginTop: 4 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#181614', marginBottom: 8 },
  emptySub: { fontSize: 13.5, color: '#5B5750', lineHeight: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  row: {
    background: '#FFFFFF', border: '1px solid #EFEDE6', borderRadius: 20, padding: 14,
    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%',
  },
  thumb: {
    position: 'relative', width: 52, height: 52, borderRadius: 16, background: '#F0EFE9', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  videoBadge: {
    position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 999,
    background: 'rgba(19,17,16,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  name: { fontWeight: 700, fontSize: 14.5, color: '#181614', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { fontSize: 12, color: '#9B968C', marginTop: 2 },
  statusBadge: { display: 'inline-block', borderRadius: 999, padding: '3px 8px', marginTop: 6, fontSize: 11, fontWeight: 600 },
  addBtn: {
    flexShrink: 0, height: 44, padding: '0 22px', borderRadius: 999, background: '#131110', color: '#FFFFFF',
    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
};
