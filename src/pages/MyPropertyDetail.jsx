import { useNavigate, useParams } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import { CheckIcon, ChevronLeftIcon, PinIcon, FileIcon } from '../components/icons';
import { PhotoCarousel } from '../components/PhotoCarousel';

// A landlord's own listing, viewed from the Properties tab. Deliberately
// separate from PropertyDetail.jsx: that page reads from ListingsContext
// (the tenant-facing browse feed, which won't include an unverified or
// under-review listing yet), so looking up an owner's own property there
// 404'd — this reads straight from PropertiesContext instead, which
// already has exactly what "your properties" shows.
export default function MyPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties } = useProperties();

  const item = properties.find((p) => p.id === id);
  if (!item) {
    return (
      <div style={styles.notFound}>
        <p style={{ color: '#5B5750' }}>This property isn't available right now.</p>
        <button type="button" style={styles.backLink} onClick={() => navigate('/properties')}>Back to your properties</button>
      </div>
    );
  }

  const photos = item.photos ?? [];
  const statusMeta = {
    verified: { label: 'Verified', bg: '#E3F5EA', color: '#2F8F55' },
    under_review: { label: 'Under review', bg: '#FBF1DA', color: '#B8860B' },
  }[item.verificationStatus];

  return (
    <div style={styles.screen}>
      <div style={styles.headerRow}>
        <button type="button" onClick={() => navigate('/properties')} style={styles.backLinkTop}>
          <ChevronLeftIcon size={14} color="#5B5750" /> Back to your properties
        </button>
        <button type="button" onClick={() => navigate(`/my-properties/${item.id}/edit`)} style={styles.editBtn}>
          Edit property
        </button>
      </div>

      <div className="uleeb-detail-layout" style={styles.layout}>
        <div className="uleeb-detail-photo-col" style={styles.photoCol}>
          <PhotoCarousel
            photos={photos}
            height={400}
            badge={
              statusMeta ? (
                <div style={{ ...styles.chip, background: statusMeta.bg, color: statusMeta.color }}>
                  {item.verificationStatus === 'verified' && <CheckIcon size={11} color={statusMeta.color} />} {statusMeta.label}
                </div>
              ) : (
                <div style={{ ...styles.chip, background: '#F0EFE9', color: '#9B968C' }}>Unverified</div>
              )
            }
          />

          {item.videoUrl && (
            <>
              <p style={styles.label}>Walkthrough video</p>
              <video src={item.videoUrl} controls style={styles.video} />
            </>
          )}
        </div>

        <div style={styles.body}>
          <p style={styles.title}>{item.title}</p>
          <div style={styles.locationRow}>
            <PinIcon size={13} color="#9B968C" />
            <span style={styles.location}>{item.location}, {item.state}, {item.country}</span>
          </div>

          <div style={styles.factsRow}>
            <span style={styles.fact}>{item.bedrooms} beds</span>
            <span style={styles.factDot}>·</span>
            <span style={styles.fact}>{item.bathrooms} baths</span>
            <span style={styles.factDot}>·</span>
            <span style={styles.fact}>{item.sizeSqm}m²</span>
          </div>

          <div style={styles.priceRow}>
            <span style={styles.price}>₦{Number(item.price ?? 0).toLocaleString()}</span>
            <span style={styles.priceUnit}> / year</span>
          </div>

          {item.documentUrl && (
            <a href={item.documentUrl} target="_blank" rel="noreferrer" style={styles.docLink}>
              <FileIcon size={15} color="#181614" /> View ownership document
            </a>
          )}

          <p style={styles.label}>Amenities</p>
          <div style={styles.amenitiesWrap}>
            {(item.amenities ?? []).length > 0 ? (
              item.amenities.map((a) => (
                <div key={a} style={styles.amenity}>
                  <CheckIcon size={13} color="#5B5750" strokeWidth={2.2} />
                  <span style={styles.amenityText}>{a}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: '#9B968C' }}>No amenities listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 1000, margin: '0 auto', padding: '24px 24px 48px' },
  notFound: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 },
  backLink: { background: 'none', border: 'none', color: '#131110', fontWeight: 600, cursor: 'pointer' },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  backLinkTop: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#5B5750',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0',
  },
  editBtn: {
    height: 38, padding: '0 18px', borderRadius: 999, background: '#131110', color: '#FFFFFF',
    border: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 40 },
  photoCol: { position: 'sticky', top: 88, alignSelf: 'start' },
  chip: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, position: 'absolute', top: 16, right: 20 },
  body: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#181614', marginBottom: 6 },
  locationRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 },
  location: { fontSize: 13.5, color: '#9B968C' },
  factsRow: { display: 'flex', gap: 6, marginBottom: 10 },
  fact: { fontSize: 14, color: '#5B5750', fontWeight: 500 },
  factDot: { fontSize: 14, color: '#9B968C' },
  priceRow: { display: 'flex', alignItems: 'baseline', marginBottom: 16 },
  price: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#181614' },
  priceUnit: { fontSize: 13.5, color: '#9B968C' },
  docLink: {
    display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: '#181614',
    textDecoration: 'none', border: '1px solid #EFEDE6', borderRadius: 12, padding: '10px 14px', marginBottom: 8, width: 'fit-content',
  },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: '#9B968C', marginTop: 24, marginBottom: 10 },
  video: { width: '100%', height: 220, borderRadius: 16, background: '#131110', objectFit: 'cover', marginTop: 12 },
  amenitiesWrap: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  amenity: {
    display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF',
    border: '1px solid #EFEDE6', borderRadius: 12, padding: '10px 12px',
  },
  amenityText: { fontSize: 12.5, color: '#181614', fontWeight: 500 },
};
