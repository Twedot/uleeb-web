import { useInView } from '../hooks/useInView';
import PhoneMockup from './PhoneMockup';

// Mirrors twedot-site's StickyScroll (Bolt's "Earn money with Bolt" page):
// left-aligned section intro, then stacked panels alternating which side
// the (phone-mockup) visual sits on — eyebrow, bold sub-headline, one
// paragraph, single CTA, big visual alongside.
const PANELS = [
  {
    id: 'tenant',
    eyebrow: 'For tenants',
    title: 'Swipe to discover, chat once accepted',
    desc: "Browse verified rentals near you and swipe right on the ones you like. Once a landlord accepts your interest, message them directly in-app — no phone number handed out before then.",
    cta: 'Start looking',
    href: '#cta',
    variant: 'swipe',
    imgSide: 'right',
  },
  {
    id: 'landlord',
    eyebrow: 'For landlords',
    title: 'Review interest before you say yes',
    desc: 'See who wants your property — their occupation, budget, and verification status — before you ever accept anyone or hand out a phone number.',
    cta: 'List a property',
    href: '#cta',
    variant: 'inbox',
    imgSide: 'left',
  },
];

function Panel({ p, i }) {
  const [ref, inView] = useInView(0.2);
  const text = (
    <div style={{ flex: '1 1 380px', maxWidth: 460, alignSelf: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14 }}>{p.eyebrow}</div>
      <h3 className="display" style={{ fontSize: 'clamp(26px, 3.4vw, 38px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: 16 }}>
        {p.title}
      </h3>
      <p style={{ fontSize: 15.5, color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 28, maxWidth: 440 }}>{p.desc}</p>
      <a href={p.href} className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '14px 32px', fontSize: 15 }}>
        {p.cta}
      </a>
    </div>
  );
  const visual = (
    <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
      <PhoneMockup variant={p.variant} tilt={p.imgSide === 'right' ? -4 : 4} />
    </div>
  );

  return (
    <div
      ref={ref}
      className={`reveal delay-${Math.min(i, 3)} ${inView ? 'visible' : ''} sticky-split`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(40px, 6vw, 80px)', flexWrap: 'wrap',
        marginBottom: i < PANELS.length - 1 ? 'clamp(80px, 10vw, 130px)' : 0,
        paddingBottom: i < PANELS.length - 1 ? 'clamp(80px, 10vw, 130px)' : 0,
        borderBottom: i < PANELS.length - 1 ? '1px solid var(--border-sub)' : 'none',
      }}
    >
      {p.imgSide === 'left' ? <>{visual}{text}</> : <>{text}{visual}</>}
    </div>
  );
}

export default function StickyScroll() {
  const [headerRef, headerInView] = useInView(0.2);

  return (
    <section id="how-it-works" style={{ background: 'var(--bg)', padding: 'clamp(96px, 12vw, 150px) 0' }}>
      <div ref={headerRef} className="section-header-pad" style={{ maxWidth: 1100, margin: '0 auto clamp(64px, 9vw, 100px)', padding: '0 64px' }}>
        <div className={`reveal ${headerInView ? 'visible' : ''}`}>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
            How uleeb works
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 10, maxWidth: 480 }}>
            Built for both sides of the deal — tenants and landlords each get exactly what they need, nothing they don't.
          </p>
        </div>
      </div>

      <div className="sticky-col" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 64px' }}>
        {PANELS.map((p, i) => <Panel key={p.id} p={p} i={i} />)}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sticky-split { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
