import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { HERO_CARDS } from '../assets/houseImages';

function PropertyCard({ card, title, price, tag, style }) {
  return (
    <div style={{
      position: 'absolute', width: 270, borderRadius: 28, background: '#fff',
      boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
      overflow: 'hidden', ...style,
    }}>
      {/* Photo area — shows image if available, falls back to accent colour */}
      <div style={{
        height: 168, position: 'relative', background: card.accent,
        overflow: 'hidden',
      }}>
        {card.src && (
          <img
            src={card.src}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <span style={{
          position: 'absolute', top: 14, right: 14,
          background: tag === 'Verified' ? '#0F172A' : 'rgba(255,255,255,0.95)',
          color: tag === 'Verified' ? '#fff' : '#0F172A',
          fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 999,
          letterSpacing: 0.3,
        }}>{tag}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <div className="display" style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 10 }}>{card.area}</div>
        <div className="display" style={{ fontWeight: 700, fontSize: 17, color: '#0F172A' }}>{price}</div>
      </div>
    </div>
  );
}

// Floating badge that adds atmosphere around the card stack
function FloatBadge({ style, children }) {
  return (
    <div style={{
      position: 'absolute', background: '#fff', borderRadius: 14,
      boxShadow: '0 8px 28px rgba(15,23,42,0.12)', padding: '10px 16px',
      fontSize: 12.5, fontWeight: 700, color: '#0F172A',
      display: 'flex', alignItems: 'center', gap: 8, ...style,
    }}>
      {children}
    </div>
  );
}

export default function Hero() {
  const [ref, inView] = useInView(0.1);

  return (
    <section id="top" style={{ paddingTop: 68, background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(80px,10vw,140px) 48px clamp(80px,10vw,120px)' }}>
        <div className="hero-row" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(40px,6vw,80px)' }}>

          {/* ── Left: copy ── */}
          <div ref={ref} style={{ flex: '1 1 520px' }}>
            <div className={`reveal ${inView ? 'visible' : ''}`} style={{ marginBottom: 22 }}>
              <span className="section-pill">Rent smarter. No middlemen.</span>
            </div>
            <h1 className={`display reveal delay-1 ${inView ? 'visible' : ''}`} style={{
              fontSize: 'clamp(36px, 5.5vw, 62px)', fontWeight: 700, lineHeight: 1.06,
              marginBottom: 22, letterSpacing: '-0.02em', color: '#0F172A',
            }}>
              Find your next home,<br />swipe by swipe.
            </h1>
            <p className={`reveal delay-2 ${inView ? 'visible' : ''}`} style={{
              fontSize: 17.5, color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: 480, marginBottom: 38,
            }}>
              uleeb matches tenants with verified rentals near you — swipe to discover,
              chat directly with landlords once accepted, and schedule inspections without
              ever going through a middleman.
            </p>
            <div className={`reveal delay-3 ${inView ? 'visible' : ''}`} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/login" className="btn-hero-black">Get started free</Link>
              <Link to="/login" className="btn-hero-outline">List a property</Link>
            </div>

            {/* Small trust row */}
            <div className={`reveal delay-3 ${inView ? 'visible' : ''}`} style={{
              display: 'flex', alignItems: 'center', gap: 20, marginTop: 32, flexWrap: 'wrap',
            }}>
              {[['🏠', 'Verified listings'], ['🔒', 'No middlemen'], ['⚡', 'Free to browse']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', fontWeight: 600 }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: card stack ── */}
          <div className="hero-visual" style={{ flex: '1 1 420px', position: 'relative', height: 440, minWidth: 320 }}>
            {/* Back card — Accra */}
            <PropertyCard
              card={HERO_CARDS[1]}
              title="3-bed apartment, Accra"
              price="GH₵ 36,000 / yr"
              tag="New"
              style={{ right: 0, top: 10, transform: 'rotate(4deg)', zIndex: 1, opacity: 0.88, animation: 'floatCard2 7s ease-in-out infinite' }}
            />
            {/* Front card — Lagos */}
            <PropertyCard
              card={HERO_CARDS[0]}
              title="2-bed flat, Lekki"
              price="₦2,400,000 / yr"
              tag="Verified"
              style={{ left: 10, top: 20, transform: 'rotate(-3deg)', zIndex: 2, animation: 'floatCard 6s ease-in-out infinite' }}
            />

            {/* Floating badges */}
            <FloatBadge style={{ bottom: 30, left: -10, animation: 'floatCard 8s ease-in-out infinite', zIndex: 3 }}>
              <span style={{ fontSize: 16 }}>✅</span> Request sent!
            </FloatBadge>
            <FloatBadge style={{ top: 0, right: -8, animation: 'floatCard2 9s ease-in-out infinite', zIndex: 3 }}>
              <span style={{ fontSize: 16 }}>💬</span> Landlord replied
            </FloatBadge>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .hero-row { flex-direction: column !important; }
          .hero-visual { width: 100%; margin: 0 auto; }
        }
      `}</style>
    </section>
  );
}
