import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import { HomeIcon, PlayIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/(tabs)/properties.tsx. "Add
// property" is a placeholder here — mobile's version uploads photos/
// video/document via multipart form data, a real file-upload build of its
// own that isn't in this pass.
const LISTING_LIMITS = { free: 1, pro: 5 };

export default function Properties() {
  const { user } = useAuth();
  const { properties } = useProperties();
  const navigate = useNavigate();
  const limit = user?.plan ? LISTING_LIMITS[user.plan] : undefined;

  function handleAddProperty() {
    window.alert("Listing a property from the web is coming soon — for now, add properties from the Uleeb app.");
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <h1 style={styles.title}>Your properties</h1>
        <p style={styles.subtitle}>
          {properties.length} listed{limit !== undefined ? ` · ${user?.plan} plan (max ${limit})` : ''}
        </p>
      </div>

      {properties.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>No properties yet</p>
          <p style={styles.emptySub}>List your first property to start receiving requests.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {properties.map((item) => (
            <PropertyRow key={item.id} item={item} onClick={() => navigate(`/my-properties/${item.id}`)} />
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <button type="button" style={styles.addBtn} onClick={handleAddProperty}>
          Add property
        </button>
      </div>
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
  screen: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: { padding: '16px 24px 0' },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#181614' },
  subtitle: { fontSize: 13, color: '#5B5750', marginTop: 4 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#181614', marginBottom: 8 },
  emptySub: { fontSize: 13.5, color: '#5B5750', lineHeight: '20px' },
  list: { flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 },
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
  footer: { padding: '8px 24px 16px' },
  addBtn: {
    width: '100%', height: 54, borderRadius: 999, background: '#131110', color: '#FFFFFF',
    fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
};
