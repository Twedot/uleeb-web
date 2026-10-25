// Reusable network/fetch error state.
// Usage:
//   <NetworkError onRetry={loadData} />                   — inline inside a page
//   <NetworkError fullScreen onRetry={loadData} />        — fills the viewport
//   <NetworkError message="Custom message" onRetry={...} />
export default function NetworkError({ onRetry, message, fullScreen = false }) {
  return (
    <div style={{ ...s.wrap, ...(fullScreen ? s.fullScreen : {}) }}>
      <div style={s.card}>
        <div style={s.iconWrap}>
          <div style={s.iconCircle}>
            <span style={{ fontSize: 36 }}>📡</span>
          </div>
        </div>

        <h2 style={s.title}>Connection problem</h2>
        <p style={s.sub}>
          {message || "We couldn't reach the server. Check your internet connection and try again."}
        </p>

        {onRetry && (
          <button type="button" onClick={onRetry} style={s.retryBtn}>
            Try again
          </button>
        )}

        {/* Subtle decoration */}
        <div style={s.dots}>
          <div style={{ ...s.dot, background: '#F4C8DC' }} />
          <div style={{ ...s.dot, background: '#C8F23E' }} />
          <div style={{ ...s.dot, background: '#F5CC38' }} />
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px',
  },
  fullScreen: {
    minHeight: '100vh', background: '#EEF6FF',
  },
  card: {
    background: '#fff', borderRadius: 28, padding: '44px 40px',
    boxShadow: '0 12px 48px rgba(15,23,42,0.09)',
    maxWidth: 420, width: '100%', textAlign: 'center',
  },
  iconWrap: { marginBottom: 20 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 999,
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
    fontSize: 22, color: '#0F172A', marginBottom: 10,
  },
  sub: {
    fontSize: 14.5, color: '#475569', lineHeight: 1.7,
    maxWidth: 320, margin: '0 auto 28px',
  },
  retryBtn: {
    height: 48, padding: '0 36px', borderRadius: 999,
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    border: 'none', fontSize: 14.5, fontWeight: 600, color: '#fff',
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
    transition: 'transform 0.15s',
  },
  dots: {
    display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28,
  },
  dot: { width: 8, height: 8, borderRadius: 999 },
};
