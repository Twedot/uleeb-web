import { useInView } from '../hooks/useInView';

const TENANT_STEPS = [
  { n: '01', title: 'Set your search', body: 'Tell us your state, budget, and what you\'re looking for.' },
  { n: '02', title: 'Swipe to discover', body: 'Right on the ones you like, left to pass. It\'s that simple.' },
  { n: '03', title: 'Get accepted', body: 'The landlord reviews your interest and accepts the ones they want to talk to.' },
  { n: '04', title: 'Chat & inspect', body: 'Message directly, agree a time, and schedule the inspection.' },
];

const LANDLORD_STEPS = [
  { n: '01', title: 'List your property', body: 'Photos, a walkthrough video, and the details tenants actually ask about.' },
  { n: '02', title: 'Review interest', body: 'See who\'s interested, their occupation and budget, before you accept anyone.' },
  { n: '03', title: 'Accept & chat', body: 'Accept the tenants you want, then message them directly in-app.' },
  { n: '04', title: 'Schedule & close', body: 'Lock in an inspection time and take it from there.' },
];

function StepColumn({ label, steps, accent }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} style={{ flex: 1 }}>
      <div className={`reveal ${inView ? 'visible' : ''}`} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
        background: accent === 'green' ? 'var(--green-bg)' : 'var(--bg-alt)',
        color: accent === 'green' ? 'var(--green)' : 'var(--text)',
        borderRadius: 20, padding: '6px 16px', fontSize: 12.5, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s.n} className={`reveal ${inView ? 'visible' : ''} delay-${Math.min(i + 1, 3)}`} style={{
            display: 'flex', gap: 18, padding: '20px 0',
            borderTop: i === 0 ? 'none' : '1px solid var(--border-sub)',
          }}>
            <span className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-faint)', flexShrink: 0, width: 28 }}>{s.n}</span>
            <div>
              <div className="display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const [headRef, headInView] = useInView(0.4);
  return (
    <section id="how-it-works" style={{ padding: '96px 0' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 48px' }}>
        <div ref={headRef} style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className={`section-pill reveal ${headInView ? 'visible' : ''}`}>How it works</span>
          <h2 className={`display reveal delay-1 ${headInView ? 'visible' : ''}`} style={{
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, marginTop: 18, letterSpacing: '-0.02em',
          }}>
            Built for both sides of the deal.
          </h2>
        </div>

        <div className="how-row" style={{ display: 'flex', gap: 64 }} id="landlords">
          <StepColumn label="For tenants" steps={TENANT_STEPS} accent="green" />
          <StepColumn label="For landlords" steps={LANDLORD_STEPS} accent="neutral" />
        </div>
      </div>
    </section>
  );
}
