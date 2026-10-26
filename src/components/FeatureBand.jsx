import { useInView } from '../hooks/useInView';

const FEATURES = [
  {
    accent: '#F4C8DC',      // pink
    icon: '🏠',
    tag: 'For tenants',
    title: 'Swipe through verified homes',
    desc: 'Browse real listings near you. No dead ads, no fake photos — every home is tied to a verified landlord ready to respond.',
  },
  {
    accent: '#C8F23E',      // lime
    icon: '💬',
    tag: 'Direct connect',
    title: 'Talk directly to the owner',
    desc: 'Chat with landlords and agents in-app once your interest is accepted. Get answers fast and arrange viewings without the back-and-forth.',
  },
  {
    accent: '#F5CC38',      // yellow
    icon: '💬',
    tag: 'For landlords',
    title: 'Review interest before you commit',
    desc: 'See a tenant\'s occupation, budget and profile before you accept anyone or share a phone number.',
  },
];

function FeatureCard({ f, delay, inView }) {
  return (
    <div
      className={`reveal delay-${delay} ${inView ? 'visible' : ''}`}
      style={{
        flex: '1 1 280px', borderRadius: 28, background: '#fff',
        boxShadow: '0 8px 36px rgba(15,23,42,0.09)',
        overflow: 'hidden',
        transition: 'transform 0.25s, box-shadow 0.25s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 56px rgba(15,23,42,0.16)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 36px rgba(15,23,42,0.09)'; }}
    >
      {/* Coloured top panel — same approach as Plans cards */}
      <div style={{
        height: 160, background: f.accent,
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '22px 24px',
      }}>
        <span style={{
          background: 'rgba(15,23,42,0.10)', color: '#0F172A',
          fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
        }}>{f.tag}</span>
        <span style={{ fontSize: 52, lineHeight: 1 }}>{f.icon}</span>
      </div>

      {/* White body */}
      <div style={{ padding: '22px 24px 28px' }}>
        <h3 className="display" style={{ fontWeight: 700, fontSize: 20, color: '#0F172A', lineHeight: 1.2, marginBottom: 12 }}>
          {f.title}
        </h3>
        <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.7 }}>{f.desc}</p>
      </div>
    </div>
  );
}

export default function FeatureBand() {
  const [ref, inView] = useInView(0.15);

  return (
    <section style={{ background: 'var(--bg)', padding: 'clamp(72px, 10vw, 120px) 48px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        {/* Header */}
        <div ref={ref} className={`reveal ${inView ? 'visible' : ''}`} style={{ marginBottom: 52, textAlign: 'center' }}>
          <span className="section-pill" style={{ marginBottom: 16, display: 'inline-block' }}>Why uleeb</span>
          <h2 className="display" style={{
            fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 700, color: '#0F172A', lineHeight: 1.1,
          }}>
            Renting, simplified<br />from both sides.
          </h2>
        </div>

        {/* 3 colored cards */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.tag} f={f} delay={i + 1} inView={inView} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .feature-band-cards { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
