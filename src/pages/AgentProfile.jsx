import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoBack } from '../hooks/useGoBack';
import { agents, BASE_URL } from '../lib/api';
import { ChevronLeftIcon } from '../components/icons';

function Stars({ sum, count }) {
  const avg = count > 0 ? sum / count : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: 16, color: avg >= n ? '#F59E0B' : '#CBD5E1' }}>★</span>
      ))}
      <span style={{ fontSize: 13, color: '#475569', marginLeft: 4 }}>
        {count > 0 ? `${avg.toFixed(1)} (${count} rating${count !== 1 ? 's' : ''})` : 'No ratings yet'}
      </span>
    </div>
  );
}

function PropertyTile({ property, onClick }) {
  const photo = property.photos?.[0];
  return (
    <button type="button" onClick={onClick} style={styles.tile}>
      {photo
        ? <img src={`${BASE_URL}${photo}`} alt={property.title} style={styles.tileImg} onError={(e) => { e.target.style.display = 'none'; }} />
        : <div style={styles.tileBlank} />}
      <div style={styles.tileOverlay}>
        <span style={styles.tilePrice}>₦{property.price?.toLocaleString()}</span>
        {property.verificationStatus === 'verified' && (
          <span style={styles.tileVerified}>✓</span>
        )}
      </div>
    </button>
  );
}

export default function AgentProfile() {
  const { id } = useParams();
  const { token, user } = useAuth();
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

  const isPaid = user?.plan === 'plus' || user?.plan === 'pro';

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.header}>
          <button type="button" onClick={goBack} style={styles.backBtn}><ChevronLeftIcon size={15} /></button>
        </div>
        <div style={styles.loadingBody}>
          <div style={styles.shimmerAvatar} />
          <div style={styles.shimmerLine} />
          <div style={{ ...styles.shimmerLine, width: '50%' }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={styles.screen}>
        <div style={styles.header}>
          <button type="button" onClick={goBack} style={styles.backBtn}><ChevronLeftIcon size={15} /></button>
          <h1 style={styles.headerTitle}>Agent profile</h1>
        </div>
        <p style={styles.errorText}>{error || 'Could not load this agent.'}</p>
      </div>
    );
  }

  const { agent, properties, locked } = data;

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button type="button" onClick={goBack} style={styles.backBtn}><ChevronLeftIcon size={15} /></button>
        <h1 style={styles.headerTitle}>Agent profile</h1>
      </div>

      {/* Agent card */}
      <div style={styles.agentCard}>
        <div style={styles.avatar}>{agent.name?.charAt(0)?.toUpperCase()}</div>
        <h2 style={styles.agentName}>{agent.name}</h2>
        {agent.verified && <span style={styles.verifiedBadge}>✓ Verified landlord</span>}
        {agent.landlordType && <p style={styles.agentType}>{agent.landlordType}</p>}
        {(agent.state || agent.country) && (
          <p style={styles.location}>📍 {[agent.state, agent.country].filter(Boolean).join(', ')}</p>
        )}
        <Stars sum={agent.ratingSum} count={agent.ratingCount} />
        <div style={styles.statsRow}>
          <div style={styles.statPill}>
            <span style={styles.statNum}>{agent.propertyCount}</span>
            <span style={styles.statLabel}>listings</span>
          </div>
          {agent.ratingCount > 0 && (
            <div style={styles.statPill}>
              <span style={styles.statNum}>{(agent.ratingSum / agent.ratingCount).toFixed(1)}</span>
              <span style={styles.statLabel}>avg rating</span>
            </div>
          )}
        </div>
      </div>

      {/* Property grid */}
      <div style={styles.gridHeader}>
        <span style={styles.gridTitle}>Properties</span>
        {locked && (
          <span style={styles.lockNote}>Plus/Pro to view</span>
        )}
      </div>

      {locked ? (
        <div style={styles.lockedWrap}>
          {/* Blurred ghost grid */}
          <div style={styles.ghostGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={styles.ghostTile} />
            ))}
          </div>
          <div style={styles.lockedOverlay}>
            <p style={styles.lockIcon}>🔒</p>
            <p style={styles.lockHeading}>Upgrade to see all listings</p>
            <p style={styles.lockSub}>Plus and Pro members can browse any agent's full property portfolio.</p>
            <button type="button" onClick={() => navigate('/plans')} style={styles.upgradeBtn}>
              Upgrade plan
            </button>
          </div>
        </div>
      ) : properties.length === 0 ? (
        <p style={styles.emptyText}>This agent has no active listings.</p>
      ) : (
        <div style={styles.grid}>
          {properties.map((p) => (
            <PropertyTile
              key={p.id}
              property={p}
              onClick={() => navigate(`/property/${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  screen: { maxWidth: 640, margin: '0 auto', minHeight: '100dvh', background: '#F0F7FF' },
  header: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px',
    background: '#FFFFFF', borderBottom: '1px solid #DBEAFE', position: 'sticky', top: 0, zIndex: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  headerTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A' },

  // Loading state
  loadingBody: { padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  shimmerAvatar: { width: 80, height: 80, borderRadius: 999, background: '#DBEAFE', animation: 'pulse 1.5s infinite' },
  shimmerLine: { height: 16, width: '70%', background: '#DBEAFE', borderRadius: 8, animation: 'pulse 1.5s infinite' },

  // Agent card section
  agentCard: {
    background: '#FFFFFF', padding: '28px 24px 20px', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: 8, borderBottom: '1px solid #DBEAFE',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 999, background: '#2563EB', color: '#FFFFFF',
    fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  agentName: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 22, color: '#0F172A', margin: 0 },
  verifiedBadge: {
    fontSize: 12, fontWeight: 600, background: '#E3F5EA', color: '#2F8F55',
    padding: '3px 10px', borderRadius: 999,
  },
  agentType: { fontSize: 13, color: '#64748B', margin: 0 },
  location: { fontSize: 13, color: '#64748B', margin: 0 },
  statsRow: { display: 'flex', gap: 12, marginTop: 8 },
  statPill: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: '#EEF6FF', padding: '8px 20px', borderRadius: 12,
  },
  statNum: { fontWeight: 700, fontSize: 20, color: '#2563EB' },
  statLabel: { fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6 },

  // Grid header
  gridHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 16px 8px',
  },
  gridTitle: { fontWeight: 700, fontSize: 15, color: '#0F172A' },
  lockNote: { fontSize: 12, color: '#94A3B8' },

  // 3-column TikTok-style grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: '0 0 24px' },
  tile: {
    position: 'relative', aspectRatio: '3/4', overflow: 'hidden',
    border: 'none', padding: 0, cursor: 'pointer', background: '#E2E8F0',
  },
  tileImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  tileBlank: { width: '100%', height: '100%', background: '#CBD5E1' },
  tileOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
    padding: '20px 6px 6px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  tilePrice: { fontSize: 11, fontWeight: 700, color: '#FFFFFF' },
  tileVerified: { fontSize: 11, color: '#34D399', fontWeight: 700 },

  // Locked state
  lockedWrap: { position: 'relative', overflow: 'hidden' },
  ghostGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, filter: 'blur(6px)', userSelect: 'none' },
  ghostTile: { aspectRatio: '3/4', background: '#CBD5E1' },
  lockedOverlay: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px',
    background: 'rgba(240,247,255,0.85)', backdropFilter: 'blur(4px)',
  },
  lockIcon: { fontSize: 36, margin: 0 },
  lockHeading: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 17, color: '#0F172A', margin: 0, textAlign: 'center' },
  lockSub: { fontSize: 13, color: '#64748B', margin: 0, textAlign: 'center', maxWidth: 280, lineHeight: '20px' },
  upgradeBtn: {
    marginTop: 8, height: 44, padding: '0 28px', borderRadius: 999,
    background: '#2563EB', color: '#FFFFFF', border: 'none',
    fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
  },

  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '40px 24px' },
  errorText: { fontSize: 13, color: '#EF4444', padding: '24px 16px' },
};
