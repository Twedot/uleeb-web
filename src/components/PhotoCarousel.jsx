import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon } from './icons';

// Shared photo viewer for both property detail pages (tenant-facing and
// the landlord's own) — a real prev/next carousel with visible caret
// buttons, not just invisible tap zones either side of the image.
export function PhotoCarousel({ photos = [], height = 460, badge, borderRadius = 24 }) {
  const [index, setIndex] = useState(0);
  const hasPhotos = photos.length > 0;
  const hasMultiple = photos.length > 1;

  function prev(e) {
    e.stopPropagation();
    setIndex((i) => Math.max(0, i - 1));
  }
  function next(e) {
    e.stopPropagation();
    setIndex((i) => Math.min(photos.length - 1, i + 1));
  }

  return (
    <div style={{ ...styles.area, height, borderRadius }}>
      {hasPhotos ? (
        <img src={photos[index]} alt="" style={styles.image} />
      ) : (
        <HomeIcon size={44} color="#D8D5CC" />
      )}

      {hasMultiple && index > 0 && (
        <button type="button" onClick={prev} aria-label="Previous photo" style={{ ...styles.caret, left: 12 }}>
          <ChevronLeftIcon size={16} color="#181614" />
        </button>
      )}
      {hasMultiple && index < photos.length - 1 && (
        <button type="button" onClick={next} aria-label="Next photo" style={{ ...styles.caret, right: 12 }}>
          <ChevronRightIcon size={16} color="#181614" />
        </button>
      )}

      {hasMultiple && (
        <div style={styles.dots}>
          {photos.map((_, i) => (
            <div key={i} style={{ ...styles.dot, ...(i === index ? styles.dotActive : null) }} />
          ))}
        </div>
      )}

      {badge}
    </div>
  );
}

const styles = {
  area: {
    position: 'relative', background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  caret: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 999,
    background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  dots: { position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.5)' },
  dotActive: { background: '#FFFFFF' },
};
