// Web equivalents of the mobile app's components/ui.tsx primitives —
// same visual language (pill radius, black/white/cream palette),
// translated from RN StyleSheet to plain CSS so the auth funnel here
// looks identical to the app.

export function Chip({ children, tone = 'light' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: tone === 'dark' ? '#fff' : 'var(--text)',
        background: tone === 'dark' ? 'var(--ink)' : '#fff',
        border: tone === 'dark' ? 'none' : '1px solid var(--border)',
      }}
    >
      {children}
    </span>
  );
}

export function Label({ children, style }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function PrimaryButton({ label, onClick, type = 'button', disabled, variant = 'primary' }) {
  const base = {
    height: 54,
    width: '100%',
    borderRadius: 999,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'opacity 0.15s, filter 0.15s',
    fontFamily: 'inherit',
  };
  const variants = {
    primary: { background: 'var(--ink)', color: '#fff' },
    secondary: { background: '#fff', color: 'var(--text)', border: '1.5px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text-muted)' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.15)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
    >
      {label}
    </button>
  );
}
