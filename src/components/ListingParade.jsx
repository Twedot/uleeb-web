import { useInView } from '../hooks/useInView';

const LISTINGS = [
  { title: '2-bed flat', area: 'Lekki Phase 1, Lagos', price: '₦2,400,000/yr', c1: '#EFEDE6', c2: '#E6E3DB' },
  { title: 'Studio apartment', area: 'Yaba, Lagos', price: '₦900,000/yr', c1: '#E3F5EA', c2: '#EFEDE6' },
  { title: '3-bed duplex', area: 'Ikoyi, Lagos', price: '₦5,100,000/yr', c1: '#E6E3DB', c2: '#F0EFE9' },
  { title: '1-bed apartment', area: 'Wuse 2, Abuja', price: '₦1,600,000/yr', c1: '#EFEDE6', c2: '#E3F5EA' },
  { title: '4-bed terrace', area: 'GRA, Port Harcourt', price: '₦3,800,000/yr', c1: '#E6E3DB', c2: '#EFEDE6' },
  { title: '2-bed flat', area: 'Bodija, Ibadan', price: '₦1,100,000/yr', c1: '#F0EFE9', c2: '#E6E3DB' },
  { title: 'Self-contain', area: 'Gwarinpa, Abuja', price: '₦650,000/yr', c1: '#EFEDE6', c2: '#F0EFE9' },
  { title: '3-bed flat', area: 'Magodo, Lagos', price: '₦2,900,000/yr', c1: '#E3F5EA', c2: '#E6E3DB' },
];

function ListingCard({ l }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 20,
      width: 240, flexShrink: 0, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: 'var(--shadow)',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
    >
      <div style={{ height: 130, background: `linear-gradient(135deg, ${l.c1}, ${l.c2})`, position: 'relative' }}>
        <span style={{
          position: 'absolute', top: 12, right: 12, background: 'var(--green-bg)', color: 'var(--green)',
          fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
        }}>Verified</span>
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div className="display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{l.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>{l.area}</div>
        <div className="display" style={{ fontWeight: 700, fontSize: 15 }}>{l.price}</div>
      </div>
    </div>
  );
}

export default function ListingParade() {
  const [headerRef, headerInView] = useInView(0.2);
  const doubled = [...LISTINGS, ...LISTINGS];

  return (
    <section id="features" style={{ background: 'var(--bg-alt)', padding: 'clamp(64px, 9vw, 110px) 0', overflow: 'hidden' }}>
      <div ref={headerRef} className="vendor-header" style={{ textAlign: 'center', padding: '0 64px', marginBottom: 56 }}>
        <div className={`reveal ${headerInView ? 'visible' : ''}`}>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text)' }}>
            Verified listings, every city.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 12 }}>
            From Lagos to Abuja to Port Harcourt — real landlords, real photos, real prices.
          </p>
        </div>
      </div>

      <div className="marquee-wrap">
        <div className="marquee-track" style={{ paddingLeft: 32 }}>
          {doubled.map((l, i) => <ListingCard key={i} l={l} />)}
        </div>
      </div>
    </section>
  );
}
