import { useInView } from '../hooks/useInView';

// A small stylized swipe-card stack (CSS only, no real screenshots yet) —
// communicates the core mechanic without needing production app captures.
function PropertyCardMockup({ style, title, price, tag, tagColor }) {
  return (
    <div style={{
      position: 'absolute', width: 260, borderRadius: 24, background: '#fff',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden', ...style,
    }}>
      <div style={{
        height: 160, background: 'linear-gradient(135deg, #EFEDE6, #E6E3DB)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 14,
      }}>
        <span style={{
          background: tagColor === 'green' ? 'var(--green-bg)' : '#fff',
          color: tagColor === 'green' ? 'var(--green)' : 'var(--text)',
          fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999,
          border: '1px solid var(--border)',
        }}>{tag}</span>
      </div>
      <div style={{ padding: 18 }}>
        <div className="display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Lekki Phase 1, Lagos</div>
        <div className="display" style={{ fontWeight: 700, fontSize: 18 }}>{price}</div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [ref, inView] = useInView(0.1);

  return (
    <section id="top" style={{ paddingTop: 68 }}>
      <div className="hero-split" style={{ maxWidth: 1180, margin: '0 auto', padding: '140px 48px 100px' }}>
        <div className="hero-row" style={{ display: 'flex', alignItems: 'center', gap: 64 }}>
          <div ref={ref} style={{ flex: '1 1 520px' }}>
            <div className={`reveal ${inView ? 'visible' : ''}`} style={{ marginBottom: 22 }}>
              <span className="section-pill">Nigeria-first rental marketplace</span>
            </div>
            <h1 className={`display reveal delay-1 ${inView ? 'visible' : ''}`} style={{
              fontSize: 'clamp(36px, 5.5vw, 60px)', fontWeight: 700, lineHeight: 1.06,
              marginBottom: 22, letterSpacing: '-0.02em',
            }}>
              Find your next home,<br />swipe by swipe.
            </h1>
            <p className={`reveal delay-2 ${inView ? 'visible' : ''}`} style={{
              fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480, marginBottom: 36,
            }}>
              uleeb matches tenants with verified rentals across Nigeria — swipe to discover,
              chat directly with landlords once accepted, and schedule inspections without
              ever going through a middleman.
            </p>
            <div className={`hero-cta reveal delay-3 ${inView ? 'visible' : ''}`} style={{ display: 'flex', gap: 14 }}>
              <a href="#cta" className="btn-hero-black">Get the app</a>
              <a href="#landlords" className="btn-hero-outline">List a property</a>
            </div>
          </div>

          <div className="hero-visual" style={{ flex: '1 1 420px', position: 'relative', height: 420 }}>
            <PropertyCardMockup
              title="2-bed flat, Lekki"
              price="₦2,400,000 / yr"
              tag="Verified"
              tagColor="green"
              style={{ left: 10, top: 30, animation: 'floatCard 6s ease-in-out infinite', zIndex: 2 }}
            />
            <PropertyCardMockup
              title="3-bed duplex, Ikoyi"
              price="₦5,100,000 / yr"
              tag="New"
              tagColor="neutral"
              style={{ right: 0, top: 0, animation: 'floatCard2 7s ease-in-out infinite', zIndex: 1, opacity: 0.9 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
