import { useInView } from '../hooks/useInView';
import { HOUSE_IMAGES } from '../assets/houseImages';

function ListingCard({ l }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 22,
      width: 248, flexShrink: 0, overflow: 'hidden',
      boxShadow: '0 6px 28px rgba(15,23,42,0.10)',
      transition: 'transform 0.25s, box-shadow 0.25s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 52px rgba(15,23,42,0.18)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 28px rgba(15,23,42,0.10)'; }}
    >
      {/* Photo — shows real image or bold accent fallback */}
      <div style={{ height: 148, position: 'relative', background: l.accent, overflow: 'hidden' }}>
        {l.src && (
          <img
            src={l.src}
            alt={l.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        {/* Gradient overlay for legibility when photo shows */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.35) 100%)',
          pointerEvents: 'none',
        }} />
        <span style={{
          position: 'absolute', top: 11, right: 11,
          background: '#0F172A', color: '#fff',
          fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
          letterSpacing: 0.3,
        }}>Verified</span>
      </div>

      <div style={{ padding: '14px 16px 18px' }}>
        <div className="display" style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 3 }}>{l.title}</div>
        <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 10 }}>{l.area}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="display" style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{l.price}</div>
          <div style={{
            width: 30, height: 30, borderRadius: 999,
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingParade() {
  const [headerRef, headerInView] = useInView(0.2);
  const doubled = [...HOUSE_IMAGES, ...HOUSE_IMAGES];

  return (
    <section id="features" style={{ background: 'var(--bg-alt)', padding: 'clamp(64px, 9vw, 110px) 0', overflow: 'hidden' }}>
      <div ref={headerRef} style={{ textAlign: 'center', padding: '0 48px', marginBottom: 52 }}>
        <div className={`reveal ${headerInView ? 'visible' : ''}`}>
          <span className="section-pill" style={{ marginBottom: 16, display: 'inline-block' }}>Live listings</span>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 700, lineHeight: 1.1, color: '#0F172A' }}>
            Verified listings, every city.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 12, maxWidth: 460, margin: '12px auto 0' }}>
            From Lagos to Abuja to Port Harcourt — real landlords, real photos, real prices.
          </p>
        </div>
      </div>

      <div className="marquee-wrap">
        <div className="marquee-track" style={{ paddingLeft: 32, gap: 20 }}>
          {doubled.map((l, i) => <ListingCard key={i} l={l} />)}
        </div>
      </div>
    </section>
  );
}
