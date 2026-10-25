import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingsContext';
import { useSwipes } from '../context/SwipesContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useSentRequests } from '../context/SentRequestsContext';
import { useFilters } from '../context/FiltersContext';
import { SwipeDeck } from '../components/SwipeDeck';
import { PropertyCard } from '../components/PropertyCard';
import { BookmarkIcon, FilterIcon, HeartIcon, XIcon } from '../components/icons';
import { ApiError } from '../lib/api';

// Web counterpart to uleeb mobile's app/(tabs)/discover.tsx — same
// state-first-then-rest-of-country ordering, same swipe-limit/plan
// gating messages.
export default function Discover() {
  const { user } = useAuth();
  const { listings: properties } = useListings();
  const { recordSwipe } = useSwipes();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { refresh: refreshSentRequests } = useSentRequests();
  const { selectedStates, allNigeria } = useFilters();
  const navigate = useNavigate();
  const deckRef = useRef(null);
  const isPro = user?.plan === 'plus' || user?.plan === 'pro';

  const filterActive = !allNigeria && selectedStates.length > 0;

  const deck = useMemo(() => {
    if (filterActive) {
      return properties.filter((p) => selectedStates.includes(p.state));
    }
    if (!user?.state) return properties;
    const inState = properties.filter((p) => p.state === user.state);
    const elsewhere = properties.filter((p) => p.state !== user.state);
    return [...inState, ...elsewhere];
  }, [filterActive, selectedStates, user?.state, properties]);

  const subtitle = filterActive
    ? `Filtered: ${selectedStates.join(', ')}`
    : allNigeria
      ? 'Showing all of Nigeria'
      : user?.state
        ? `${user.state} first, then the rest of Nigeria`
        : 'Swipe to see homes near you';

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
      if (direction === 'right') refreshSentRequests();
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
            <BookmarkIcon size={16} color="#475569" />
          </button>
          <button type="button" style={styles.iconBtn} onClick={() => navigate('/filters')}>
            <FilterIcon size={16} color="#475569" />
            {(filterActive || allNigeria) && <span style={styles.filterDot} />}
          </button>
        </div>
      </div>
      <p style={styles.subtitle}>{subtitle}</p>

      <div style={styles.deckAreaOuter}><div style={styles.deckArea}>
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
      </div></div>

      <div style={styles.actions}>
        <button type="button" style={{ ...styles.actionBtn, ...styles.actionBig, ...styles.actionReject }} onClick={() => deckRef.current?.swipe('left')}>
          <XIcon size={22} color="#C8402A" strokeWidth={2.2} />
        </button>
        <button type="button" style={{ ...styles.actionBtn, ...styles.actionSmall }} onClick={handleSaveCurrent}>
          <BookmarkIcon size={16} color="#475569" />
        </button>
        <button type="button" style={styles.actionLike} onClick={() => deckRef.current?.swipe('right')}>
          <HeartIcon size={26} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}

// A swipe card only ever makes sense at a readable, phone-photo-ish width
// even on a huge monitor — real web apps with this pattern (dating-site
// desktop clients, etc.) center a fixed-width card in an open page rather
// than stretching it edge-to-edge. That's a deliberate width on the CARD
// COLUMN, not the whole page pretending to be a phone: the page itself,
// nav, and background are full width (see AppShell.jsx).
const CARD_COLUMN_WIDTH = 400;

const styles = {
  screen: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 48px', minHeight: 'calc(100dvh - 64px)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: CARD_COLUMN_WIDTH },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 26, color: '#0F172A' },
  headerIcons: { display: 'flex', gap: 10 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute', top: 6, right: 6, width: 7, height: 7,
    borderRadius: 999, background: '#2563EB', border: '1.5px solid #FFFFFF',
  },
  subtitle: { fontSize: 13, color: '#475569', width: '100%', maxWidth: CARD_COLUMN_WIDTH, marginTop: 4, marginBottom: 20 },
  deckAreaOuter: { width: '100%', maxWidth: CARD_COLUMN_WIDTH, flex: 1, display: 'flex' },
  deckArea: { position: 'relative', flex: 1, minHeight: 520 },
  emptyState: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: '#0F172A', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#475569' },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, paddingTop: 24 },
  actionBtn: {
    borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(59,130,246,0.10)',
  },
  actionBig: { width: 56, height: 56 },
  actionSmall: { width: 46, height: 46 },
  actionReject: { borderColor: 'rgba(200,64,42,0.3)', boxShadow: '0 2px 12px rgba(200,64,42,0.10)' },
  actionLike: {
    width: 64, height: 64, borderRadius: 999,
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    border: 'none', boxShadow: '0 4px 20px rgba(15,23,42,0.22)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
};
