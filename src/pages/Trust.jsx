import { useNavigate } from 'react-router-dom';
import { CheckIcon, ChevronLeftIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/trust.tsx — static content, no
// backend calls, same three sections and copy verbatim.
const SECTIONS = [
  {
    title: 'Verified landlord',
    points: ['Government ID confirmed', 'Phone number verified', 'Track record on ULEEB'],
  },
  {
    title: 'Verified property',
    points: ['Exact location confirmed', 'Listing checked within 14 days', 'Total cost shown upfront'],
  },
  {
    title: 'Verified tenant',
    points: ['Government ID confirmed', 'Employer or income confirmed', 'Referenced by a former landlord'],
  },
];

export default function Trust() {
  const navigate = useNavigate();

  return (
    <div style={styles.screen}>
      <button type="button" onClick={() => navigate(-1)} style={styles.backLink}>
        <ChevronLeftIcon size={14} color="#5B5750" /> Back
      </button>
      <h1 style={styles.title}>Verification</h1>
      <p style={styles.subtitle}>What a verified badge actually means on ULEEB.</p>

      <div style={styles.grid}>
        {SECTIONS.map((section) => (
          <div key={section.title} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.badge}>
                <CheckIcon size={15} color="#FFFFFF" />
              </div>
              <span style={styles.cardTitle}>{section.title}</span>
            </div>
            {section.points.map((point) => (
              <div key={point} style={styles.point}>
                <CheckIcon size={13} color="#5B5750" strokeWidth={2.2} />
                <span style={styles.pointText}>{point}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 900, margin: '0 auto', padding: '24px 24px 48px' },
  backLink: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#5B5750',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: 16,
  },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#181614' },
  subtitle: { fontSize: 13.5, color: '#5B5750', marginTop: 6, marginBottom: 24, lineHeight: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 },
  card: { background: '#FFFFFF', border: '1px solid #EFEDE6', borderRadius: 20, padding: 18 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  badge: {
    width: 34, height: 34, borderRadius: 999, background: '#131110',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontWeight: 700, fontSize: 15.5, color: '#181614' },
  point: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  pointText: { fontSize: 13, color: '#5B5750' },
};
