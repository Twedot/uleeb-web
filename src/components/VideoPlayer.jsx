import { useRef, useState } from 'react';

// Styled video player — wraps the native <video> with a custom play
// overlay so the first frame isn't just a grey rectangle. Once the user
// starts playing, native controls take over for the usual UI (scrub,
// volume, fullscreen).
export function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  function handlePlay() {
    videoRef.current?.play();
    setStarted(true);
  }

  return (
    <div style={s.wrap}>
      <video
        ref={videoRef}
        src={src}
        controls={started}
        style={s.video}
        onPlay={() => setStarted(true)}
        onEnded={() => setStarted(false)}
        playsInline
        preload="metadata"
      />
      {!started && (
        <button type="button" style={s.overlay} onClick={handlePlay} aria-label="Play video">
          <div style={s.playBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 3.5l14 8.5-14 8.5V3.5z" fill="#FFFFFF" />
            </svg>
          </div>
          <span style={s.playLabel}>Play walkthrough</span>
        </button>
      )}
    </div>
  );
}

const s = {
  wrap: { position: 'relative', width: '100%', borderRadius: 18, overflow: 'hidden', background: '#0F172A', marginTop: 12 },
  video: { width: '100%', height: 'auto', maxHeight: 600, display: 'block', objectFit: 'contain' },
  overlay: {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    background: 'linear-gradient(135deg, rgba(19,17,16,0.7) 0%, rgba(19,17,16,0.4) 100%)',
    border: 'none', cursor: 'pointer',
  },
  playBtn: {
    width: 60, height: 60, borderRadius: 999,
    background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  playLabel: {
    fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.3,
  },
};
