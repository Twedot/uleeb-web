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
      <div style={{ ...styles.photoArea, height: 380 }}>
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
        <button type="button" onClick={() => navigate(-1)} style={styles.backBtn} aria-label="Back">
          <ChevronLeftIcon size={15} color="#181614" />
        </button>
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

        {item.videoUrl && (
          <>
            <p style={styles.label}>Walkthrough video</p>
            <video src={item.videoUrl} controls style={styles.video} />
          </>
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

      {user?.role !== 'landlord' && (
        <div style={styles.footer}>
          <button type="button" style={styles.saveBtn} onClick={handleBookmark}>
            {isBookmarked(item.id) ? 'Saved' : 'Save'}
          </button>
          <button type="button" style={styles.requestBtn} onClick={handleRequest} disabled={requested}>
            {requested ? 'Request sent' : 'Request to view'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' },
  notFound: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 },
  backLink: { background: 'none', border: 'none', color: '#131110', fontWeight: 600, cursor: 'pointer' },
  photoArea: { position: 'relative', background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover' },
  tapLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', background: 'none', border: 'none', cursor: 'pointer' },
  tapRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%', background: 'none', border: 'none', cursor: 'pointer' },
  dots: { position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.5)' },
  dotActive: { background: '#FFFFFF' },
  backBtn: {
    position: 'absolute', top: 16, left: 20, width: 36, height: 36, borderRadius: 999, background: '#FFFFFF',
    border: '1.5px solid #E6E3DB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  chip: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, position: 'absolute' },
  verifiedBadge: { top: 16, right: 20 },
  matchBadge: { bottom: 14, left: 16 },
  body: { padding: 24, display: 'flex', flexDirection: 'column', gap: 4 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: '#181614', marginBottom: 6 },
  locationRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 },
  location: { fontSize: 13.5, color: '#9B968C' },
  factsRow: { display: 'flex', gap: 6, marginBottom: 10 },
  fact: { fontSize: 14, color: '#5B5750', fontWeight: 500 },
  factDot: { fontSize: 14, color: '#9B968C' },
  priceRow: { display: 'flex', alignItems: 'baseline', marginBottom: 12 },
  price: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#181614' },
  priceUnit: { fontSize: 13.5, color: '#9B968C' },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: '#9B968C', marginTop: 20, marginBottom: 10 },
  video: { width: '100%', height: 200, borderRadius: 16, background: '#131110', objectFit: 'cover' },
  amenitiesWrap: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  amenity: {
    display: 'flex', alignItems: 'center', gap: 8, width: '47%', background: '#FFFFFF',
    border: '1px solid #EFEDE6', borderRadius: 12, padding: '10px 12px',
  },
  amenityText: { fontSize: 12.5, color: '#181614', fontWeight: 500 },
  footer: { display: 'flex', gap: 10, padding: '12px 24px 24px', flexShrink: 0 },
  saveBtn: {
    flex: 1, height: 52, borderRadius: 999, background: '#FFFFFF', border: '1.5px solid #E6E3DB',
    fontSize: 14.5, fontWeight: 600, color: '#181614', cursor: 'pointer',
  },
  requestBtn: {
    flex: 2, height: 52, borderRadius: 999, background: '#131110', border: 'none',
    fontSize: 14.5, fontWeight: 600, color: '#FFFFFF', cursor: 'pointer',
  },
};
