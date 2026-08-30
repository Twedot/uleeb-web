const LINKS = [
  { title: 'Product', items: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'For landlords', href: '#landlords' },
  ]},
  { title: 'Company', items: [
    { label: 'Powered by Twedot', href: 'https://twedot.com', external: true },
    { label: 'Contact', href: 'mailto:hello@uleeb.com' },
  ]},
];

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, background: 'var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span className="display" style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>U</span>
      </div>
      <span className="display" style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>uleeb</span>
    </div>
  );
}

// Mirrors twedot-site's Footer structure (brand column + link columns +
// bottom bar) — simplified, since uleeb doesn't have Twedot's years of
// legal pages/social presence yet, but keeps the same shape and the
// backlink to twedot.com that ties the two sites together.
export default function Footer() {
  return (
    <footer className="footer-wrap" style={{ background: 'var(--bg-alt)', borderTop: '1px solid var(--border-sub)', padding: '64px 48px 0' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', gap: 48, marginBottom: 48, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200, maxWidth: 280 }}>
            <Logo />
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.85 }}>
              A Nigeria-first rental marketplace, built by Twedot.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            {LINKS.map((col) => (
              <div key={col.title}>
                <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {col.title}
                </div>
                {col.items.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="footer-link"
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-sub)', padding: '20px 0 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>© 2026 uleeb. A Twedot product.</div>
          <a href="https://twedot.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-faint)', fontSize: 13, fontWeight: 600 }}>
            twedot.com ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
