import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { useBookmarks } from '../context/BookmarksContext';
import { ChevronLeftIcon, HomeIcon, XIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/saved-homes.tsx.
export default function SavedHomes() {
  const { bookmarks, loading, toggleBookmark } = useBookmarks();
  const navigate = useNavigate();
  const goBack = useGoBack('/');

  async function handleRemove(id) {
    try {
      await toggleBookmark(id);
    } catch {
      window.alert('Could not remove this bookmark — please try again.');
    }
  }

  return (
    <div style={styles.screen}>
      <button type="button" onClick={() => goBack()} style={styles.backLink}>
        <ChevronLeftIcon size={14} color="#475569" /> Back
      </button>
      <h1 style={styles.title}>Saved homes</h1>

      {!loading && bookmarks.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>Nothing saved yet</p>
          <p style={styles.emptySub}>Tap the bookmark icon on a home in Discover to save it here.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {bookmarks.map((item) => (
            <SavedRow key={item.id} item={item} onOpen={() => navigate(`/property/${item.id}`)} onRemove={() => handleRemove(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedRow({ item, onOpen, onRemove }) {
  return (
    <div style={styles.row}>
      <button type="button" onClick={onOpen} style={styles.rowMain}>
        <div style={styles.thumb}>
          {item.photos?.[0] ? <img src={item.photos[0]} alt="" style={styles.thumbImg} /> : <HomeIcon size={20} color="#94A3B8" />}
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <p style={styles.rowTitle}>{item.title}</p>
          <p style={styles.rowSub}>{item.location}, {item.state} · ₦{Number(item.price ?? 0).toLocaleString()}/yr</p>
        </div>
      </button>
      <button type="button" onClick={onRemove} style={styles.removeBtn} aria-label="Remove">
        <XIcon size={12} color="#94A3B8" strokeWidth={2.2} />
      </button>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 720, margin: '0 auto', padding: '24px 24px 48px' },
  backLink: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#475569',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: 16,
  },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 28, color: '#0F172A', marginBottom: 24 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A', marginBottom: 8 },
  emptySub: { fontSize: 13.5, color: '#475569', lineHeight: '20px' },
  grid: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: {
    background: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: 20, padding: 14,
    display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px rgba(59,130,246,0.06)',
  },
  rowMain: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' },
  thumb: {
    width: 44, height: 44, borderRadius: 14, background: '#E3EFFD', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  rowTitle: { fontWeight: 700, fontSize: 14.5, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  removeBtn: {
    width: 28, height: 28, borderRadius: 999, background: '#EEF6FF', border: 'none', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
};
