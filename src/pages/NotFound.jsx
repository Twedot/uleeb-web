import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={s.screen}>
      <div style={s.card}>
        {/* Big accent number */}
        <div style={s.number}>404</div>

        {/* Icon */}
        <div style={s.iconWrap}>
          <span style={{ fontSize: 48 }}>🏚️</span>
        </div>

        <h1 style={s.title}>This page doesn't exist</h1>
        <p style={s.sub}>
          The link you followed might be broken, or the page may have been removed.
        </p>

        <div style={s.actions}>
          <button type="button" onClick={() => navigate(-1)} style={s.backBtn}>
            ← Go back
          </button>
          <Link to={user ? '/discover' : '/'} style={s.homeBtn}>
            {user ? 'Back to app' : 'Go home'}
          </Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  screen: {
    minHeight: '100vh', background: '#EEF6FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#fff', borderRadius: 32, padding: '52px 48px',
    boxShadow: '0 16px 60px rgba(15,23,42,0.10)',
    maxWidth: 480, width: '100%', textAlign: 'center',
  },
  number: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 800,
    fontSize: 96, lineHeight: 1, letterSpacing: '-4px',
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    marginBottom: 8,
  },
  iconWrap: { marginBottom: 20 },
  title: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
    fontSize: 24, color: '#0F172A', marginBottom: 12,
  },
  sub: {
    fontSize: 15, color: '#475569', lineHeight: 1.7,
    maxWidth: 340, margin: '0 auto 36px',
  },
  actions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  backBtn: {
    height: 48, padding: '0 24px', borderRadius: 999,
    background: '#fff', border: '1.5px solid #BFDBFE',
    fontSize: 14, fontWeight: 600, color: '#0F172A', cursor: 'pointer',
    fontFamily: 'inherit',
  },
  homeBtn: {
    height: 48, padding: '0 28px', borderRadius: 999,
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    border: 'none', fontSize: 14, fontWeight: 600, color: '#fff',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
    textDecoration: 'none',
  },
};
