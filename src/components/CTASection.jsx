import { useState } from 'react';
import { useInView } from '../hooks/useInView';

function StoreBadge({ label, sub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.16)', borderRadius: 14, padding: '10px 18px',
      color: '#fff', opacity: 0.6, cursor: 'not-allowed',
    }}>
      <div>
        <div style={{ fontSize: 10, opacity: 0.7 }}>{sub}</div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

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
    <section id="cta" style={{ padding: '100px 0' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 48px' }}>
        <div ref={ref} style={{
          background: 'var(--ink)', borderRadius: 32, padding: '72px 48px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div className={`reveal ${inView ? 'visible' : ''}`}>
            <h2 className="display" style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#fff',
              marginBottom: 16, letterSpacing: '-0.02em',
            }}>
              uleeb is launching soon.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
              We're putting the finishing touches on the app. Leave your email and
              we'll let you know the moment it's live on iOS and Android.
            </p>

            {submitted ? (
              <div style={{
                maxWidth: 420, margin: '0 auto 32px', padding: '15px 20px', borderRadius: 999,
                background: 'rgba(47,143,85,0.16)', border: '1px solid rgba(47,143,85,0.4)',
                color: '#8FE0AC', fontSize: 14.5, fontWeight: 600,
              }}>
                Thanks — we'll let you know the moment we launch.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, maxWidth: 420, margin: '0 auto 32px' }}>
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
                <button type="submit" style={{
                  padding: '15px 28px', borderRadius: '0 999px 999px 0', background: '#fff',
                  color: 'var(--ink)', border: 'none', fontWeight: 700, fontSize: 14.5,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Notify me
                </button>
              </form>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <StoreBadge label="App Store" sub="Coming soon to the" />
              <StoreBadge label="Google Play" sub="Coming soon on" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
