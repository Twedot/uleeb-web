import { useNavigate } from 'react-router-dom';
import { BookmarkIcon, CheckIcon, ChevronRightIcon, HomeIcon, PinIcon } from './icons';

// Web counterpart to uleeb mobile's components/PropertyCard.tsx — same
// layout/badges. Mobile shows the real first photo when one's been
// uploaded, falling back to the placeholder icon only when photos is
// empty (see data/mock.ts's Property type comment there) — this was
// showing the placeholder unconditionally regardless of real photos.
export function PropertyCard({ item, bookmarked }) {
  const navigate = useNavigate();
  const cover = item.photos?.[0];

  return (
    <div style={styles.card}>
      <div style={styles.photo}>
        {cover ? <img src={cover} alt="" style={styles.photoImg} /> : <HomeIcon size={40} color="#D8D5CC" />}
        <div style={styles.dots}>
          {Array.from({ length: Math.min(item.photos?.length ?? 0, 6) }).map((_, i) => (
            <div key={i} style={{ ...styles.dot, ...(i === 0 ? styles.dotActive : null) }} />
          ))}
        </div>
        <div style={styles.badgeLeft}>{item.matchScore}% match</div>
        <div style={styles.badgeRightStack}>
          {bookmarked && (
            <div style={styles.bookmarkedBadge}>
              <BookmarkIcon size={12} color="#FFFFFF" />
            </div>
          )}
          {item.verificationStatus === 'verified' && (
            <div style={{ ...styles.chip, ...styles.badgeVerified }}>
              <CheckIcon size={11} color="#2F8F55" /> Verified
            </div>
          )}
          {item.verificationStatus === 'under_review' && (
            <div style={{ ...styles.chip, ...styles.badgeUnderReview }}>Under review</div>
          )}
        </div>
      </div>

      <div style={styles.details}>
        <p style={styles.title}>{item.title}</p>
        <div style={styles.locationRow}>
          <PinIcon size={12} color="#9B968C" />
          <span style={styles.location}>
            {item.location}, {item.state}, {item.country}
          </span>
        </div>

        <div style={styles.factsRow}>
          <span style={styles.fact}>{item.bedrooms} beds</span>
          <span style={styles.factDot}>·</span>
          <span style={styles.fact}>{item.bathrooms} baths</span>
          <span style={styles.factDot}>·</span>
          <span style={styles.fact}>{item.sizeSqm}m²</span>
        </div>

        <div style={styles.footerRow}>
          <div style={styles.priceRow}>
            <span style={styles.price}>₦{Number(item.price ?? 0).toLocaleString()}</span>
            <span style={styles.priceUnit}> / year</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/property/${item.id}`);
            }}
            style={styles.detailsBtn}
          >
            Details <ChevronRightIcon size={12} color="#5B5750" />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex', flexDirection: 'column', height: '100%',
    background: '#FFFFFF', borderRadius: 28, border: '1px solid #EFEDE6', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', userSelect: 'none',
  },
  photo: { position: 'relative', flex: '1.35', background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  dots: { position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', gap: 4 },
  dot: { flex: 1, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.35)' },
  dotActive: { background: '#FFFFFF' },
  badgeLeft: {
    position: 'absolute', top: 28, left: 16, background: '#131110', color: '#FFFFFF',
    fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999,
  },
  badgeRightStack: { position: 'absolute', top: 28, right: 16, display: 'flex', alignItems: 'center', gap: 6 },
  chip: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999 },
  badgeVerified: { background: '#E3F5EA', color: '#2F8F55' },
  badgeUnderReview: { background: '#FBF1DA', color: '#B8860B' },
  bookmarkedBadge: {
    width: 24, height: 24, borderRadius: 999, background: '#131110',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  details: { padding: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: '#181614', lineHeight: '24px' },
  locationRow: { display: 'flex', alignItems: 'center', gap: 4 },
  location: { fontSize: 13, color: '#9B968C' },
  factsRow: { display: 'flex', gap: 6 },
  fact: { fontSize: 13, color: '#5B5750', fontWeight: 500 },
  factDot: { fontSize: 13, color: '#9B968C' },
  footerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 },
  priceRow: { display: 'flex', alignItems: 'baseline' },
  price: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: '#181614' },
  priceUnit: { fontSize: 13, color: '#9B968C' },
  detailsBtn: {
    display: 'flex', alignItems: 'center', gap: 3, fontSize: 12.5, fontWeight: 600, color: '#5B5750',
    padding: '8px 12px', borderRadius: 999, background: '#F0EFE9', border: 'none', cursor: 'pointer',
  },
};
