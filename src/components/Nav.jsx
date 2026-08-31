import { useEffect, useState, useRef } from 'react';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Listings', href: '#features' },
];

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, background: 'var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span className="display" style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>U</span>
      </div>
      <span className="display" style={{ fontWeight: 700, fontSize: 19, color: 'var(--text)' }}>uleeb</span>
    </div>
  );
}

// Same fixed, hide-on-scroll-down header pattern as twedot-site's Nav —
// just re-skinned (no purple, no flag/language picker uleeb has no need
// for yet), plus a "Powered by Twedot" backlink since this site links
// back the other way from Twedot's own.
export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 80);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <nav
      className="nav-wrap"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
        height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(247,246,242,0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-sub)',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <a href="#top"><Logo /></a>

      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {NAV_LINKS.map((l) => (
          <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <a href="#cta" className="btn-primary" style={{ textDecoration: 'none' }}>Get the app</a>

        <div ref={menuRef} style={{ position: 'relative' }} className="nav-links">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: '50%', border: 'none',
              background: menuOpen ? 'var(--bg-alt)' : 'transparent',
              color: 'var(--text)', cursor: 'pointer', transition: 'background 0.2s',
              marginLeft: 4,
            }}
          >
            <MenuIcon />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 190,
              background: '#fff', border: '1px solid var(--border)', borderRadius: 14,
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden', padding: 6,
            }}>
              <a href="https://twedot.com" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 14px', borderRadius: 8, color: 'var(--text)', fontSize: 14.5, fontWeight: 600 }}>
                Powered by Twedot ↗
              </a>
              <a href="mailto:hello@uleeb.com" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 14px', borderRadius: 8, color: 'var(--text)', fontSize: 14.5, fontWeight: 600 }}>
                Contact
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
