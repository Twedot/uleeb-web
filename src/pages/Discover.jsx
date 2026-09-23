import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingsContext';
import { useSwipes } from '../context/SwipesContext';
import { useBookmarks } from '../context/BookmarksContext';
import { SwipeDeck } from '../components/SwipeDeck';
import { PropertyCard } from '../components/PropertyCard';
import { BookmarkIcon, HeartIcon, XIcon } from '../components/icons';
import { ApiError } from '../lib/api';

// Web counterpart to uleeb mobile's app/(tabs)/discover.tsx — same
// state-first-then-rest-of-country ordering, same swipe-limit/plan
// gating messages.
export default function Discover() {
  const { user } = useAuth();
  const { listings: properties } = useListings();
  const { recordSwipe } = useSwipes();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const navigate = useNavigate();
  const deckRef = useRef(null);
  const isPro = user?.plan === 'plus' || user?.plan === 'pro';

  const deck = useMemo(() => {
    if (!user?.state) return properties;
    const inState = properties.filter((p) => p.state === user.state);
    const elsewhere = properties.filter((p) => p.state !== user.state);
    return [...inState, ...elsewhere];
  }, [user?.state, properties]);

  const subtitle = user?.state ? `${user.state} first, then the rest of Nigeria` : 'Swipe to see homes near you';

  function requireProPlan(feature) {
    if (window.confirm(`${feature} is a Plus feature. Upgrade to Plus or Pro to use this — view plans?`)) {
      navigate('/plans');
    }
  }

  async function handleBookmarkPress() {
    if (!isPro) return requireProPlan('Saving homes');
    navigate('/saved-homes');
  }

  async function handleSaveCurrent() {
    if (!isPro) return requireProPlan('Saving homes');
    const current = deckRef.current?.getCurrent();
    if (!current) return;
    try {
      await toggleBookmark(current.id);
    } catch {
      window.alert('Could not save this home — please try again.');
    }
  }

  async function handleSwipe(item, direction) {
    try {
      await recordSwipe(item.id, direction);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        if (window.confirm(`You've hit your swipe limit. ${err.message} — view plans?`)) navigate('/plans');
      }
      // Other failures (network blip, etc.) fail silently — the card
      // already animated away and there's nothing useful to undo here.
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <h1 style={styles.title}>Find your place</h1>
        <div style={styles.headerIcons}>
          <button type="button" style={styles.iconBtn} onClick={handleBookmarkPress}>
            <BookmarkIcon size={16} color="#181614" />
          </button>
        </div>
      </div>
      <p style={styles.subtitle}>{subtitle}</p>

      <div style={styles.deckArea}>
        <SwipeDeck
          ref={deckRef}
          data={deck}
          renderCard={(item) => <PropertyCard item={item} bookmarked={isBookmarked(item.id)} />}
          onSwipe={handleSwipe}
          renderEmpty={() => (
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>You're all caught up</p>
              <p style={styles.emptySub}>
                {user?.plan === 'free'
                  ? "Nothing new for now — you may be at today's swipe limit (resets in 24 hours), or everything's been seen recently. Upgrade for unlimited swiping."
                  : "Check back soon for new verified listings in your area."}
              </p>
            </div>
          )}
        />
      </div>

      <div style={styles.actions}>
        <button type="button" style={{ ...styles.actionBtn, ...styles.actionBig, ...styles.actionReject }} onClick={() => deckRef.current?.swipe('left')}>
          <XIcon size={22} color="#C8402A" strokeWidth={2.2} />
        </button>
        <button type="button" style={{ ...styles.actionBtn, ...styles.actionSmall }} onClick={handleSaveCurrent}>
          <BookmarkIcon size={16} color="#181614" />
        </button>
        <button type="button" style={styles.actionLike} onClick={() => deckRef.current?.swipe('right')}>
          <HeartIcon size={26} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 0' },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: '#181614' },
  headerIcons: { display: 'flex', gap: 10 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 999, border: '1.5px solid #E6E3DB', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  subtitle: { fontSize: 13, color: '#5B5750', padding: '4px 24px 16px' },
  deckArea: { flex: 1, minHeight: 0, padding: '0 20px' },
  emptyState: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: '#181614', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#5B5750' },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '24px 0' },
  actionBtn: {
    borderRadius: 999, border: '1.5px solid #E6E3DB', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  actionBig: { width: 56, height: 56 },
  actionSmall: { width: 46, height: 46 },
  actionReject: { borderColor: 'rgba(200,64,42,0.35)' },
  actionLike: {
    width: 64, height: 64, borderRadius: 999, background: '#131110', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
};
