import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoBack } from '../hooks/useGoBack';
import { agents, BASE_URL } from '../lib/api';
import { ChevronLeftIcon } from '../components/icons';

function photoSrc(raw) {
  if (!raw) return null;
  return raw.startsWith('http') ? raw : `${BASE_URL}${raw}`;
}

function avgRating(sum, count) {
  return count > 0 ? sum / count : 0;
}

function StarDisplay({ sum, count, size = 18 }) {
  const avg = avgRating(sum, count);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: size, color: avg >= n ? '#FBBF24' : 'rgba(255,255,255,0.25)' }}>★</span>
      ))}
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginLeft: 6 }}>
        {count > 0 ? `${avg.toFixed(1)} (${count})` : 'No ratings yet'}
      </span>
    </div>
  );
}

function PropertyTile({ property, onClick }) {
  const src = photoSrc(property.photos?.[0]);
  const [loaded, setLoaded] = useState(false);
  return (
    <button type="button" onClick={onClick} style={s.tile}>
      {src ? (
        <>
          {!loaded && <div style={s.tileShimmer} />}
          <img
            src={src}
            alt={property.title}
            style={{ ...s.tileImg, opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </>
      ) : (
        <div style={s.tileBlank}><span style={{ fontSize: 20 }}>🏠</span></div>
      )}
      <div style={s.tileOverlay}>
        <span style={s.tilePrice}>₦{Number(property.price ?? 0).toLocaleString()}</span>
        {property.verificationStatus === 'verified' && <span style={s.tileCheck}>✓</span>}
      </div>
    </button>
  );
}

export default function AgentProfile() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const goBack = useGoBack('/agents');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    agents.profile(id, token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <button type="button" onClick={goBack} style={s.backBtn}><ChevronLeftIcon size={15} /></button>
          <span style={s.headerTitle}>Agent profile</span>
        </div>
        <div style={s.heroLoading}>
          <div style={s.shimCircle} />
          <div style={{ ...s.shimLine, width: 160 }} />
          <div style={{ ...s.shimLine, width: 100 }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <button type="button" onClick={goBack} style={s.backBtn}><ChevronLeftIcon size={15} /></button>
          <span style={s.headerTitle}>Agent profile</span>
        </div>
        <p style={{ padding: 24, color: '#EF4444', fontSize: 13 }}>{error || 'Could not load this agent.'}</p>
      </div>
    );
  }

  const { agent, properties, locked } = data;
  const avg = avgRating(agent.ratingSum, agent.ratingCount);

  return (
    <div style={s.page}>
      {/* Sticky header */}
      <div style={s.header}>
        <button type="button" onClick={goBack} style={s.backBtn}><ChevronLeftIcon size={15} /></button>
        <span style={s.headerTitle}>Agent profile</span>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.avatarRing}>
            <div style={s.avatar}>{agent.name?.charAt(0)?.toUpperCase()}</div>
          </div>
          <h1 style={s.heroName}>{agent.name}</h1>
          <div style={s.badgeRow}>
            {agent.verified && (
              <span style={s.verifiedBadge}>✓ Verified landlord</span>
            )}
            {agent.landlordType && (
              <span style={s.typeBadge}>{agent.landlordType}</span>
            )}
          </div>
          {(agent.state || agent.country) && (
            <p style={s.heroLocation}>📍 {[agent.state, agent.country].filter(Boolean).join(', ')}</p>
          )}
          <StarDisplay sum={agent.ratingSum} count={agent.ratingCount} />
        </div>
      </div>

      {/* Stats row */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <span style={s.statNum}>{agent.propertyCount}</span>
          <span style={s.statLabel}>Listings</span>
        </div>
        <div style={s.statDivider} />
        <div style={s.statCard}>
          <span style={s.statNum}>{agent.ratingCount > 0 ? avg.toFixed(1) : '—'}</span>
          <span style={s.statLabel}>Avg rating</span>
        </div>
        <div style={s.statDivider} />
        <div style={s.statCard}>
          <span style={s.statNum}>{agent.ratingCount}</span>
          <span style={s.statLabel}>Reviews</span>
        </div>
      </div>

      {/* Properties */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}>Properties</span>
          {!locked && (
            <span style={s.sectionCount}>{properties.length} listing{properties.length !== 1 ? 's' : ''}</span>
          )}
          {locked && <span style={s.lockHint}>🔒 Plus/Pro</span>}
        </div>

        {locked ? (
          <div style={s.lockedWrap}>
            <div style={s.ghostGrid}>
              {[...Array(6)].map((_, i) => <div key={i} style={s.ghostTile} />)}
            </div>
            <div style={s.lockedOverlay}>
              <div style={s.lockBadge}>🔒</div>
              <p style={s.lockHead}>Upgrade to see all listings</p>
              <p style={s.lockSub}>Plus and Pro members can browse any agent's full property portfolio.</p>
              <button type="button" style={s.upgradeBtn} onClick={() => navigate('/plans')}>
                Upgrade plan
              </button>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: 32 }}>🏗️</span>
            <p style={s.emptyText}>No active listings right now</p>
          </div>
        ) : (
          <div style={s.grid}>
            {properties.map((p) => (
              <PropertyTile key={p.id} property={p} onClick={() => navigate(`/property/${p.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { maxWidth: 640, margin: '0 auto', minHeight: '100dvh', background: '#F0F7FF' },

  // Header
  header: {
    position: 'sticky', top: 0, zIndex: 10,
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    background: 'rgba(240,247,255,0.92)', backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #DBEAFE',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  headerTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 17, color: '#0F172A' },

  // Hero
  hero: {
    background: 'linear-gradient(145deg, #0F172A 0%, #1E3A8A 55%, #1D4ED8 100%)',
    padding: '36px 24px 32px',
  },
  heroInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  avatarRing: {
    width: 96, height: 96, borderRadius: 999,
    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 4, marginBottom: 4,
  },
  avatar: {
    width: '100%', height: '100%', borderRadius: 999, background: '#2563EB',
    border: '3px solid rgba(255,255,255,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 36, color: '#FFFFFF',
  },
  heroName: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 22,
    color: '#FFFFFF', margin: 0, textAlign: 'center',
  },
  badgeRow: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  verifiedBadge: {
    fontSize: 12, fontWeight: 600, color: '#34D399',
    background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
    padding: '4px 12px', borderRadius: 999,
  },
  typeBadge: {
    fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.75)',
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
    padding: '4px 12px', borderRadius: 999,
  },
  heroLocation: { fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 },

  // Stats row
  statsRow: {
    display: 'flex', background: '#FFFFFF', padding: '0',
    borderBottom: '1px solid #DBEAFE',
  },
  statCard: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '18px 8px', gap: 3,
  },
  statDivider: { width: 1, background: '#DBEAFE', margin: '14px 0' },
  statNum: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 22, color: '#0F172A' },
  statLabel: { fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.7 },

  // Section
  section: { padding: '0 0 48px' },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 16px 12px',
  },
  sectionTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, color: '#0F172A' },
  sectionCount: { fontSize: 12, color: '#94A3B8', fontWeight: 600 },
  lockHint: { fontSize: 12, color: '#94A3B8' },

  // 3-col grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 },
  tile: {
    position: 'relative', aspectRatio: '3/4', overflow: 'hidden',
    border: 'none', padding: 0, cursor: 'pointer', background: '#E2E8F0', display: 'block',
  },
  tileShimmer: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(90deg, #E2E8F0 25%, #CBD5E1 50%, #E2E8F0 75%)',
  },
  tileImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.25s' },
  tileBlank: {
    width: '100%', height: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: '#E2E8F0',
  },
  tileOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
    padding: '20px 6px 6px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  tilePrice: { fontSize: 11, fontWeight: 700, color: '#FFFFFF' },
  tileCheck: { fontSize: 11, color: '#34D399', fontWeight: 700 },

  // Locked
  lockedWrap: { position: 'relative', overflow: 'hidden', margin: '0 16px', borderRadius: 20 },
  ghostGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, filter: 'blur(4px)', userSelect: 'none' },
  ghostTile: { aspectRatio: '3/4', background: '#CBD5E1' },
  lockedOverlay: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 10, padding: 28,
    background: 'rgba(240,247,255,0.88)', backdropFilter: 'blur(6px)',
  },
  lockBadge: { fontSize: 40 },
  lockHead: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A', textAlign: 'center' },
  lockSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: '20px', maxWidth: 260 },
  upgradeBtn: {
    marginTop: 6, height: 46, padding: '0 32px', borderRadius: 999,
    background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', color: '#FFFFFF',
    border: 'none', fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
  },

  // Empty
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 24px' },
  emptyText: { fontSize: 14, color: '#94A3B8' },

  // Loading
  heroLoading: {
    background: 'linear-gradient(145deg, #0F172A, #1E3A8A)',
    padding: '40px 24px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 14,
  },
  shimCircle: { width: 80, height: 80, borderRadius: 999, background: 'rgba(255,255,255,0.12)' },
  shimLine: { height: 14, borderRadius: 8, background: 'rgba(255,255,255,0.12)' },
};
