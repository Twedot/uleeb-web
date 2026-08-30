import { useInView } from '../hooks/useInView';

const FEATURES = [
  {
    title: 'Swipe to discover',
    body: 'Browse verified rentals near you, one card at a time — swipe right on the ones you want to see more of.',
    icon: '👆',
  },
  {
    title: 'Verified listings',
    body: 'Every property is tied to a real landlord account — no more chasing dead links or fake ads.',
    icon: '✓',
  },
  {
    title: 'Chat once accepted',
    body: "Once a landlord accepts your interest, message them directly in-app — no phone number handed out before then.",
    icon: '💬',
  },
  {
    title: 'Schedule inspections',
    body: 'Pick a time that works for both sides and lock it in, right inside the same conversation.',
    icon: '📅',
  },
  {
    title: 'Filter by state',
    body: 'Search your own state, or unlock multi-state and cross-country search on a paid plan.',
    icon: '📍',
  },
  {
    title: 'Bookmark for later',
    body: "Save a place you're not ready to commit to yet and come back to it whenever.",
    icon: '🔖',
  },
];

export default function Features() {
  const [ref, inView] = useInView(0.1);

  return (
    <section id="features" style={{ padding: '96px 0', background: 'var(--bg-alt)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 48px' }}>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className={`section-pill reveal ${inView ? 'visible' : ''}`}>What you get</span>
          <h2 className={`display reveal delay-1 ${inView ? 'visible' : ''}`} style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, marginTop: 18, letterSpacing: '-0.02em',
          }}>
            Everything you need,<br />nothing you don't.
          </h2>
        </div>

        <div className="features-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
        }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`feature-card reveal ${inView ? 'visible' : ''} ${i % 3 === 1 ? 'delay-1' : i % 3 === 2 ? 'delay-2' : ''}`}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: 'var(--bg-alt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 18,
              }}>{f.icon}</div>
              <div className="display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
