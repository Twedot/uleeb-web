import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertiesContext';
import { HomeIcon, PlayIcon, SearchIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/(tabs)/properties.tsx.
const LISTING_LIMITS = { free: 7, plus: 15 };
const STATUS_FILTERS = ['all', 'verified', 'rented', 'under_review', 'unverified'];

export default function Properties() {
  const { user } = useAuth();
  const { properties } = useProperties();
  const navigate = useNavigate();
  const limit = user?.plan ? LISTING_LIMITS[user.plan] : undefined;
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = useMemo(() => {
    let list = properties;
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.verificationStatus === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [properties, query, statusFilter]);

  function handleAddProperty() {
    if (limit !== undefined && properties.length >= limit) {
      navigate('/plans');
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

      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <SearchIcon size={15} color="#94A3B8" />
          <input
            style={styles.searchInput}
            placeholder="Search by title, location or state"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={styles.filterRow}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              style={{ ...styles.filterChip, ...(statusFilter === s ? styles.filterChipActive : null) }}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s === 'under_review' ? 'Under review' : s === 'rented' ? 'Rented' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>{properties.length === 0 ? 'No properties yet' : 'No matches'}</p>
          <p style={styles.emptySub}>
            {properties.length === 0
              ? 'List your first property to start receiving requests.'
              : 'Try a different search term or filter.'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((item) => (
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
          <HomeIcon size={20} color="#94A3B8" />
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
        {item.verificationStatus === 'rented' && (
          <span style={{ ...styles.statusBadge, background: '#F3E8FF', color: '#7C3AED' }}>Rented</span>
        )}
      </div>
    </button>
  );
}

const styles = {
  screen: { maxWidth: 1120, margin: '0 auto', padding: '32px 24px 48px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 },
  controls: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 16px',
    background: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: 999, maxWidth: 480,
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13.5, color: '#0F172A',
  },
  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  filterChip: {
    height: 34, padding: '0 14px', borderRadius: 999, border: '1px solid #DBEAFE',
    background: '#FFFFFF', fontSize: 12.5, fontWeight: 600, color: '#475569', cursor: 'pointer',
  },
  filterChipActive: { background: '#2563EB', borderColor: '#2563EB', color: '#FFFFFF' },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 28, color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#475569', marginTop: 4 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A', marginBottom: 8 },
  emptySub: { fontSize: 13.5, color: '#475569', lineHeight: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  row: {
    background: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: 20, padding: 14,
    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%',
    boxShadow: '0 2px 8px rgba(59,130,246,0.06)',
  },
  thumb: {
    position: 'relative', width: 52, height: 52, borderRadius: 16, background: '#E3EFFD', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  videoBadge: {
    position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 999,
    background: 'rgba(37,99,235,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  name: { fontWeight: 700, fontSize: 14.5, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statusBadge: { display: 'inline-block', borderRadius: 999, padding: '3px 8px', marginTop: 6, fontSize: 11, fontWeight: 600 },
  addBtn: {
    flexShrink: 0, height: 44, padding: '0 22px', borderRadius: 999, background: '#0F172A', color: '#FFFFFF',
    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
  },
};
