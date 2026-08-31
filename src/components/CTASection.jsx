import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import PhoneMockup from './PhoneMockup';

// Mirrors twedot-site's CTASection (Bolt's "Download our apps" section):
// full-bleed dark band, a tilted phone mockup on one side, headline +
// subtext + single button on the other.
export default function CTASection() {
  const [ref, inView] = useInView(0.2);
  const [submitted, setSubmitted] = useState(false);

  // No waitlist backend exists yet — this just acknowledges the
  // submission in the UI instead of silently doing nothing. Swap for a
  // real endpoint once one exists.
  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="cta" style={{ background: 'var(--ink)', padding: 'clamp(72px, 10vw, 120px) 24px' }}>
      <div ref={ref} className={`reveal ${inView ? 'visible' : ''} cta-split`} style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 64 }}>

        <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center' }}>
          <PhoneMockup variant="chat" tilt={-6} />
        </div>

        <div style={{ flex: '1 1 380px' }}>
          <div className="section-pill" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)', marginBottom: 22 }}>
            Coming soon
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 700, lineHeight: 1.1, color: '#fff', marginBottom: 18 }}>
            uleeb is launching soon.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
            We're putting the finishing touches on the app. Leave your email and
            we'll let you know the moment it's live on iOS and Android.
          </p>

          {submitted ? (
            <div style={{
              maxWidth: 400, padding: '15px 20px', borderRadius: 999,
              background: 'rgba(47,143,85,0.16)', border: '1px solid rgba(47,143,85,0.4)',
              color: '#8FE0AC', fontSize: 14.5, fontWeight: 600,
            }}>
              Thanks — we'll let you know the moment we launch.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, maxWidth: 400 }}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                style={{
                  flex: 1, minWidth: 0, padding: '15px 20px', borderRadius: '999px 0 0 999px',
                  border: '1px solid rgba(255,255,255,0.2)', borderRight: 'none',
                  background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 14.5,
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
              <button type="submit" className="btn-hero-white" style={{ borderRadius: '0 999px 999px 0', padding: '15px 28px', fontSize: 14.5, boxShadow: 'none' }}>
                Notify me
              </button>
            </form>
          )}
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
