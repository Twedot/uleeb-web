import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useListings } from '../context/ListingsContext';
import { useSwipes } from '../context/SwipesContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useAuth } from '../context/AuthContext';
import { CheckIcon, ChevronLeftIcon, HomeIcon, PinIcon } from '../components/icons';
import { ApiError } from '../lib/api';

// Web counterpart to uleeb mobile's app/property/[id].tsx. The status
// banner ("your request is with the owner" / accepted / declined) needs
// the sentRequests store, which is part of the Requests/Chat build this
// pass doesn't include — "Request to view" here just records the same
// right-swipe the Discover deck does.
export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings } = useListings();
  const { recordSwipe } = useSwipes();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { user } = useAuth();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [requested, setRequested] = useState(false);
  const isPro = user?.plan === 'plus' || user?.plan === 'pro';

  const item = listings.find((p) => p.id === id);
  if (!item) {
    return (
      <div style={styles.notFound}>
        <p style={{ color: '#5B5750' }}>This listing isn't available right now.</p>
        <button type="button" style={styles.backLink} onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const photos = item.photos ?? [];
  const hasReal = photos.length > 0;

  async function handleRequest() {
    try {
      await recordSwipe(item.id, 'right');
      setRequested(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        if (window.confirm(`You've hit your swipe limit. ${err.message} — view plans?`)) navigate('/plans');
      } else {
        window.alert('Could not send that request — please try again.');
      }
    }
  }

  async function handleBookmark() {
    if (!isPro) {
      if (window.confirm('Saving homes is a Plus feature. Upgrade to Plus or Pro to use this — view plans?')) navigate('/plans');
      return;
    }
    try {
      await toggleBookmark(item.id);
    } catch {
      window.alert('Could not save this home — please try again.');
    }
  }

  return (
    <div style={styles.screen}>
      <button type="button" onClick={() => navigate(-1)} style={styles.backLinkTop}>
        <ChevronLeftIcon size={14} color="#5B5750" /> Back
      </button>

      <div className="uleeb-detail-layout" style={styles.layout}>
        {/* Left column: photo, sticky on wide screens like any real web
            listing page (Airbnb/Zillow-style two-column detail), not a
            stacked mobile scroll. */}
        <div className="uleeb-detail-photo-col" style={styles.photoCol}>
          <div style={styles.photoArea}>
            {hasReal ? (
              <img src={photos[photoIndex]} alt="" style={styles.mainImage} />
            ) : (
              <HomeIcon size={44} color="#D8D5CC" />
            )}
            {photos.length > 1 && (
              <>
                <button type="button" style={styles.tapLeft} onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))} aria-label="Previous photo" />
                <button type="button" style={styles.tapRight} onClick={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))} aria-label="Next photo" />
              </>
            )}
            {photos.length > 1 && (
              <div style={styles.dots}>
                {photos.map((_, i) => (
                  <div key={i} style={{ ...styles.dot, ...(i === photoIndex ? styles.dotActive : null) }} />
                ))}
              </div>
            )}
            {item.verificationStatus === 'verified' && (
              <div style={{ ...styles.chip, ...styles.verifiedBadge, background: '#E3F5EA', color: '#2F8F55' }}>
                <CheckIcon size={11} color="#2F8F55" /> Verified
              </div>
            )}
            {item.verificationStatus === 'under_review' && (
              <div style={{ ...styles.chip, ...styles.verifiedBadge, background: '#FBF1DA', color: '#B8860B' }}>Under review</div>
            )}
            <div style={{ ...styles.chip, ...styles.matchBadge, background: '#131110', color: '#FFFFFF' }}>{item.matchScore}% match</div>
          </div>

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

          {user?.role !== 'landlord' && (
            <div style={styles.actions}>
              <button type="button" style={styles.saveBtn} onClick={handleBookmark}>
                {isBookmarked(item.id) ? 'Saved' : 'Save'}
              </button>
              <button type="button" style={styles.requestBtn} onClick={handleRequest} disabled={requested}>
                {requested ? 'Request sent' : 'Request to view'}
              </button>
            </div>
          )}

          <p style={styles.label}>Amenities</p>
          <div style={styles.amenitiesWrap}>
            {(item.amenities ?? []).map((a) => (
              <div key={a} style={styles.amenity}>
                <CheckIcon size={13} color="#5B5750" strokeWidth={2.2} />
                <span style={styles.amenityText}>{a}</span>
              </div>
            ))}
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
  backLinkTop: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#5B5750',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: 16,
  },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 40 },
  photoCol: { position: 'sticky', top: 88, alignSelf: 'start' },
  photoArea: {
    position: 'relative', background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: 460, borderRadius: 24, overflow: 'hidden',
  },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover' },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', background: 'none', border: 'none', cursor: 'pointer' },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%', background: 'none', border: 'none', cursor: 'pointer' },
  dots: { position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.5)' },
  dotActive: { background: '#FFFFFF' },
  chip: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, position: 'absolute' },
  verifiedBadge: { top: 16, right: 20 },
  matchBadge: { bottom: 14, left: 16 },
  body: { display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#181614', marginBottom: 6 },
  locationRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 },
  location: { fontSize: 13.5, color: '#9B968C' },
  factsRow: { display: 'flex', gap: 6, marginBottom: 10 },
  fact: { fontSize: 14, color: '#5B5750', fontWeight: 500 },
  factDot: { fontSize: 14, color: '#9B968C' },
  priceRow: { display: 'flex', alignItems: 'baseline', marginBottom: 20 },
  price: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#181614' },
  priceUnit: { fontSize: 13.5, color: '#9B968C' },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: '#9B968C', marginTop: 24, marginBottom: 10 },
  video: { width: '100%', height: 220, borderRadius: 16, background: '#131110', objectFit: 'cover', marginTop: 12 },
  amenitiesWrap: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  amenity: {
    display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF',
    border: '1px solid #EFEDE6', borderRadius: 12, padding: '10px 12px',
  },
  amenityText: { fontSize: 12.5, color: '#181614', fontWeight: 500 },
  actions: { display: 'flex', gap: 10, marginBottom: 8 },
  saveBtn: {
    flex: 1, height: 50, borderRadius: 999, background: '#FFFFFF', border: '1.5px solid #E6E3DB',
    fontSize: 14, fontWeight: 600, color: '#181614', cursor: 'pointer',
  },
  requestBtn: {
    flex: 2, height: 50, borderRadius: 999, background: '#131110', border: 'none',
    fontSize: 14, fontWeight: 600, color: '#FFFFFF', cursor: 'pointer',
  },
};
