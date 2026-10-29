import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';


const sk = {
  block: (h, radius = 16) => ({ height: h, borderRadius: radius, background: '#E2E8F0', animation: 'pulse 1.4s ease-in-out infinite' }),
  line: (w, h, radius = 8, mb = 0) => ({ width: w, height: h, borderRadius: radius, background: '#E2E8F0', animation: 'pulse 1.4s ease-in-out infinite', marginBottom: mb }),
};
import { useProperties } from '../context/PropertiesContext';
import { CheckIcon, ChevronLeftIcon, PinIcon, FileIcon } from '../components/icons';
import { PhotoCarousel } from '../components/PhotoCarousel';
import { Lightbox } from '../components/Lightbox';
import { VideoPlayer } from '../components/VideoPlayer';
import { MapView } from '../components/MapView';

// A landlord's own listing, viewed from the Properties tab. Deliberately
// separate from PropertyDetail.jsx: that page reads from ListingsContext
// (the tenant-facing browse feed, which won't include an unverified or
// under-review listing yet), so looking up an owner's own property there
// 404'd — this reads straight from PropertiesContext instead, which
// already has exactly what "your properties" shows.
export default function MyPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, loading, deleteProperty, rentProperty } = useProperties();

  const item = properties.find((p) => p.id === id);

  // Must be before any early return so hooks run in the same order every render.
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [renting, setRenting] = useState(false);

  async function handleRent() {
    if (!window.confirm('Mark this property as rented? It will no longer appear in the discovery feed.')) return;
    setRenting(true);
    try {
      await rentProperty(item?.id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not mark as rented.');
    } finally {
      setRenting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this property? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteProperty(item?.id);
      navigate('/properties', { replace: true });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete property.');
      setDeleting(false);
    }
  }

  if (loading && !item) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 24px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={sk.line(140, 14)} />
          <div style={sk.line(100, 14)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 40 }}>
          <div style={sk.block(400)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
            <div style={sk.line('70%', 28)} />
            <div style={sk.line('45%', 14)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={sk.line(60, 14)} />
              <div style={sk.line(60, 14)} />
              <div style={sk.line(60, 14)} />
            </div>
            <div style={sk.line('50%', 32, 0, 8)} />
            <div style={sk.block(120, 16)} />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={styles.notFound}>
        <p style={{ color: '#475569' }}>This property isn't available right now.</p>
        <button type="button" style={styles.backLink} onClick={() => navigate('/properties')}>Back to your properties</button>
      </div>
    );
  }

  const photos = item.photos ?? [];
  const statusMeta = {
    verified: { label: 'Verified', bg: '#E3F5EA', color: '#2F8F55' },
    under_review: { label: 'Under review', bg: '#FBF1DA', color: '#B8860B' },
    rented: { label: 'Rented', bg: '#F3E8FF', color: '#7C3AED' },
  }[item.verificationStatus];

  return (
    <>
    <div style={styles.screen}>
      <div style={styles.headerRow}>
        <button type="button" onClick={() => navigate('/properties')} style={styles.backLinkTop}>
          <ChevronLeftIcon size={14} color="#475569" /> Back to your properties
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          {item.verificationStatus !== 'verified' && item.verificationStatus !== 'rented' && (
            <button type="button" onClick={handleDelete} disabled={deleting} style={styles.deleteBtn}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          {item.verificationStatus === 'verified' && (
            <button type="button" onClick={handleRent} disabled={renting} style={styles.rentBtn}>
              {renting ? 'Marking…' : 'Mark as rented'}
            </button>
          )}
          {item.verificationStatus !== 'rented' && (
            <button type="button" onClick={() => navigate(`/my-properties/${item.id}/edit`)} style={styles.editBtn}>
              Edit property
            </button>
          )}
        </div>
      </div>

      <div className="uleeb-detail-layout" style={styles.layout}>
        <div className="uleeb-detail-photo-col" style={styles.photoCol}>
          <PhotoCarousel
            photos={photos}
            height={400}
            onPhotoClick={(i) => setLightboxIndex(i)}
            badge={
              statusMeta ? (
                <div style={{ ...styles.chip, background: statusMeta.bg, color: statusMeta.color }}>
                  {item.verificationStatus === 'verified' && <CheckIcon size={11} color={statusMeta.color} />} {statusMeta.label}
                </div>
              ) : (
                <div style={{ ...styles.chip, background: '#EEF6FF', color: '#94A3B8' }}>Unverified</div>
              )
            }
          />

          {item.videoUrl && (
            <>
              <p style={styles.label}>Walkthrough video</p>
              <VideoPlayer src={item.videoUrl} />
            </>
          )}

          <p style={styles.label}>Location</p>
          <MapView lat={item.lat} lng={item.lng} state={item.state} />
        </div>

        <div style={styles.body}>
          <p style={styles.title}>{item.title}</p>
          <div style={styles.locationRow}>
            <PinIcon size={13} color="#94A3B8" />
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
              <FileIcon size={15} color="#0F172A" /> View ownership document
            </a>
          )}

          <p style={styles.label}>Amenities</p>
          <div style={styles.amenitiesWrap}>
            {(item.amenities ?? []).length > 0 ? (
              item.amenities.map((a) => (
                <div key={a} style={styles.amenity}>
                  <CheckIcon size={13} color="#475569" strokeWidth={2.2} />
                  <span style={styles.amenityText}>{a}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: '#94A3B8' }}>No amenities listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>

    {lightboxIndex !== null && (
      <Lightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex((i) => Math.max(0, i - 1))}
        onNext={() => setLightboxIndex((i) => Math.min(photos.length - 1, i + 1))}
      />
    )}
    </>
  );
}

const styles = {
  screen: { maxWidth: 1000, margin: '0 auto', padding: '24px 24px 48px' },
  notFound: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 },
  backLink: { background: 'none', border: 'none', color: '#0F172A', fontWeight: 600, cursor: 'pointer' },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  backLinkTop: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#475569',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0',
  },
  editBtn: {
    height: 38, padding: '0 18px', borderRadius: 999, background: '#0F172A', color: '#FFFFFF',
    border: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  deleteBtn: {
    height: 38, padding: '0 18px', borderRadius: 999, background: '#FFFFFF', color: '#C8402A',
    border: '1.5px solid #FCA5A5', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  rentBtn: {
    height: 38, padding: '0 18px', borderRadius: 999, background: '#F3E8FF', color: '#7C3AED',
    border: '1.5px solid #DDD6FE', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 40 },
  photoCol: { position: 'sticky', top: 88, alignSelf: 'start' },
  chip: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, position: 'absolute', top: 16, right: 20 },
  body: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 26, color: '#0F172A', marginBottom: 6 },
  locationRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 },
  location: { fontSize: 13.5, color: '#94A3B8' },
  factsRow: { display: 'flex', gap: 6, marginBottom: 10 },
  fact: { fontSize: 14, color: '#475569', fontWeight: 500 },
  factDot: { fontSize: 14, color: '#94A3B8' },
  priceRow: { display: 'flex', alignItems: 'baseline', marginBottom: 16 },
  price: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 28, color: '#0F172A' },
  priceUnit: { fontSize: 13.5, color: '#94A3B8' },
  docLink: {
    display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: '#0F172A',
    textDecoration: 'none', border: '1px solid #DBEAFE', borderRadius: 12, padding: '10px 14px', marginBottom: 8, width: 'fit-content',
  },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: '#94A3B8', marginTop: 24, marginBottom: 10 },
  amenitiesWrap: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  amenity: {
    display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF',
    border: '1px solid #DBEAFE', borderRadius: 12, padding: '10px 12px',
  },
  amenityText: { fontSize: 12.5, color: '#0F172A', fontWeight: 500 },
};
