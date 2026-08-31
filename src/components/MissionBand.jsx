import { useInView } from '../hooks/useInView';

// Mirrors twedot-site's FeaturesSection (Bolt.eu's "About us" band) —
// full-bleed brand-color gradient, one huge statement, short paragraph,
// single pill button. Twedot's is purple; uleeb's own brand is ink black.
export default function MissionBand() {
  const [ref, inView] = useInView(0.2);

  return (
    <section style={{
      background: 'linear-gradient(160deg, #232019 0%, #131110 100%)',
      padding: 'clamp(80px, 11vw, 140px) 24px',
      textAlign: 'center',
    }}>
      <div ref={ref} className={`reveal ${inView ? 'visible' : ''}`} style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 22 }}>
          Why uleeb
        </div>
        <h2 className="display" style={{ fontSize: 'clamp(32px, 6vw, 68px)', fontWeight: 700, color: '#fff', lineHeight: 1.05, marginBottom: 26 }}>
          Renting a home in Nigeria shouldn't mean chasing dead ads and fake agents.
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 36px' }}>
          Every listing on uleeb is tied to a real, verified landlord — and every
          conversation only starts once they've actually accepted your interest.
          No middlemen, no guesswork.
        </p>
        <a
          href="#how-it-works"
          style={{
            display: 'inline-block', background: '#fff', color: 'var(--ink)',
            fontWeight: 700, fontSize: 15, padding: '15px 32px', borderRadius: 10,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
        >
          See how it works
        </a>
      </div>
    </section>
  );
}
