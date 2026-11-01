import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoBack } from '../hooks/useGoBack';
import { agents, BASE_URL } from '../lib/api';

function photoSrc(raw) {
  if (!raw) return null;
  return raw.startsWith('http') ? raw : `${BASE_URL}${raw}`;
}
import { ChevronLeftIcon } from '../components/icons';

function StarRow({ sum, count, size = 12 }) {
  const avg = count > 0 ? sum / count : 0;
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: size, color: avg >= n ? '#F59E0B' : '#CBD5E1' }}>★</span>
      ))}
      {count > 0 && (
        <span style={{ fontSize: size - 1, color: '#94A3B8', marginLeft: 4 }}>
          {avg.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}

function AgentCard({ agent, onClick }) {
  const initials = agent.name?.charAt(0)?.toUpperCase() ?? '?';
  const avg = agent.ratingCount > 0 ? agent.ratingSum / agent.ratingCount : 0;
  return (
    <button type="button" onClick={onClick} style={styles.card}>
      <div style={styles.avatar}>{initials}</div>
      <div style={styles.cardInfo}>
        <div style={styles.nameRow}>
          <span style={styles.agentName}>{agent.name}</span>
          {agent.verified && <span style={styles.verifiedBadge}>✓ Verified</span>}
        </div>
        {agent.landlordType && <p style={styles.agentType}>{agent.landlordType}</p>}
        <div style={styles.metaRow}>
          {agent.ratingCount > 0
            ? <StarRow sum={agent.ratingSum} count={agent.ratingCount} />
            : <span style={styles.noRating}>No ratings yet</span>}
          <span style={styles.dot}>·</span>
          <span style={styles.propCount}>{agent.propertyCount} {agent.propertyCount === 1 ? 'listing' : 'listings'}</span>
        </div>
        {(agent.state || agent.country) && (
          <p style={styles.location}>{[agent.state, agent.country].filter(Boolean).join(', ')}</p>
        )}
      </div>
      <span style={styles.arrow}>›</span>
    </button>
  );
}

export default function AgentSearch() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const goBack = useGoBack('/discover');
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [topLoading, setTopLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounce = useRef(null);

  useEffect(() => {
    if (!token) return;
    setTopLoading(true);
    agents.top(token)
      .then(setTopAgents)
      .catch((e) => setError(e?.message || 'Could not load top agents'))
      .finally(() => setTopLoading(false));
  }, [token]);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (q.trim() === '') { setResults([]); return; }
    debounce.current = setTimeout(() => {
      setLoading(true);
      setError('');
      agents.search(q, token)
        .then(setResults)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 350);
  }, [q, token]);

  const list = q.trim() ? results : topAgents;
  const isEmpty = !loading && !topLoading && list.length === 0;

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button type="button" onClick={goBack} style={styles.backBtn}>
          <ChevronLeftIcon size={15} />
        </button>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search agents by name…"
            style={styles.searchInput}
            autoFocus
          />
          {q && (
            <button type="button" onClick={() => setQ('')} style={styles.clearBtn}>✕</button>
          )}
        </div>
      </div>

      <p style={styles.sectionLabel}>
        {q.trim() ? 'Results' : '⭐ Top rated agents'}
      </p>

      {loading && (
        <div style={styles.center}>
          <span style={styles.loadingText}>Searching…</span>
        </div>
      )}
      {error && <p style={styles.errorText}>{error}</p>}
      {!loading && isEmpty && (
        <div style={styles.center}>
          <p style={styles.emptyText}>
            {q.trim() ? 'No agents found for that name.' : 'No top-rated agents yet.'}
          </p>
        </div>
      )}

      <div style={styles.list}>
        {list.map((a) => (
          <AgentCard key={a.id} agent={a} onClick={() => navigate(`/agents/${a.id}`)} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 640, margin: '0 auto', minHeight: '100dvh', background: '#F0F7FF' },
  header: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 12px',
    background: '#FFFFFF', borderBottom: '1px solid #DBEAFE', position: 'sticky', top: 0, zIndex: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center', background: '#EEF6FF',
    borderRadius: 12, padding: '0 12px', gap: 8, border: '1.5px solid #BFDBFE',
  },
  searchIcon: { fontSize: 14, flexShrink: 0 },
  searchInput: {
    flex: 1, border: 'none', background: 'transparent', outline: 'none',
    fontSize: 14, color: '#0F172A', padding: '10px 0',
  },
  clearBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 14, padding: 0,
  },
  sectionLabel: {
    fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
    color: '#64748B', padding: '16px 16px 8px',
  },
  list: { display: 'flex', flexDirection: 'column' },
  card: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    background: '#FFFFFF', borderBottom: '1px solid #EEF6FF',
    border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
    transition: 'background 0.1s',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 999, background: '#2563EB',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#FFFFFF', fontWeight: 700, fontSize: 18, flexShrink: 0,
  },
  cardInfo: { flex: 1, minWidth: 0 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 },
  agentName: { fontWeight: 700, fontSize: 14.5, color: '#0F172A' },
  verifiedBadge: {
    fontSize: 10, fontWeight: 600, background: '#E3F5EA', color: '#2F8F55',
    padding: '2px 7px', borderRadius: 999,
  },
  agentType: { fontSize: 12, color: '#64748B', margin: '0 0 4px' },
  metaRow: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  dot: { color: '#CBD5E1', fontSize: 12 },
  propCount: { fontSize: 12, color: '#64748B' },
  noRating: { fontSize: 12, color: '#94A3B8' },
  location: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  arrow: { color: '#94A3B8', fontSize: 18, flexShrink: 0 },
  center: { display: 'flex', justifyContent: 'center', padding: '48px 16px' },
  loadingText: { fontSize: 14, color: '#94A3B8' },
  emptyText: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  errorText: { fontSize: 13, color: '#EF4444', padding: '12px 16px' },
};
