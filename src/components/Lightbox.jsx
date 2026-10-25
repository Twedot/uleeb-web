import { useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from './icons';

// Full-screen photo viewer — opened when the user clicks any photo in
// the carousel. Traps focus/scroll; pressing Esc or clicking the backdrop
// closes it; arrow keys and buttons navigate between photos.
export function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div style={s.backdrop} onClick={onClose}>
      <button type="button" style={s.close} onClick={onClose} aria-label="Close">
        <XIcon size={18} color="#FFFFFF" strokeWidth={2} />
      </button>

      <div style={s.counter}>{index + 1} / {photos.length}</div>

      <div style={s.imgWrap} onClick={(e) => e.stopPropagation()}>
        <img src={photos[index]} alt="" style={s.img} draggable={false} />
      </div>

      {photos.length > 1 && index > 0 && (
        <button type="button" style={{ ...s.nav, left: 16 }} onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous">
          <ChevronLeftIcon size={20} color="#0F172A" />
        </button>
      )}
      {photos.length > 1 && index < photos.length - 1 && (
        <button type="button" style={{ ...s.nav, right: 16 }} onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next">
          <ChevronRightIcon size={20} color="#0F172A" />
        </button>
      )}
    </div>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  close: {
    position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 999,
    background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  counter: {
    position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
    color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
  },
  imgWrap: {
    maxWidth: '90vw', maxHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  img: {
    maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12,
    userSelect: 'none',
  },
  nav: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 48, height: 48, borderRadius: 999, background: 'rgba(255,255,255,0.9)',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
};
