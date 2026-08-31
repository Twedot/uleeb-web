import { useInView } from '../hooks/useInView';
import PhoneMockup from './PhoneMockup';

// Mirrors twedot-site's CTASection (Bolt's "Download our apps" section):
// full-bleed dark band, a tilted phone mockup on one side, headline +
// subtext + single button on the other.
export default function CTASection() {
  const [ref, inView] = useInView(0.2);

  return (
    <section id="cta" style={{ background: 'var(--ink)', padding: 'clamp(72px, 10vw, 120px) 24px' }}>
      <div ref={ref} className={`reveal ${inView ? 'visible' : ''} cta-split`} style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 64 }}>

        <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center' }}>
          <PhoneMockup variant="chat" tilt={-6} />
        </div>

        <div style={{ flex: '1 1 380px' }}>
          <div className="section-pill" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)', marginBottom: 22 }}>
            Live now
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 700, lineHeight: 1.1, color: '#fff', marginBottom: 18 }}>
            uleeb is live — get it today.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
            Verified rentals, real landlords, no middleman. Download uleeb and
            start swiping through homes near you.
          </p>

          {/* TODO: point at the real App Store / Play Store listing once
              uleeb is actually submitted — placeholder until then. */}
          <a href="#" className="btn-hero-white" style={{ display: 'inline-flex', textDecoration: 'none', padding: '16px 36px', borderRadius: 999 }}>
            Get the app
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cta-split { flex-direction: column !important; text-align: center; }
        }
      `}</style>
    </section>
  );
}
