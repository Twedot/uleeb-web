import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';

// Web counterpart to uleeb mobile's components/SwipeDeck.tsx — same
// mechanics (drag threshold, rotation, spring-back, LIKE/NOPE stamps,
// stacked next-card preview), built on the Pointer Events API instead of
// react-native-gesture-handler/reanimated so it works with both mouse and
// touch from one code path, no extra dependency.
const SWIPE_THRESHOLD = 110;
const ROTATION_RANGE = 10;

export const SwipeDeck = forwardRef(function SwipeDeck({ data, renderCard, onSwipe, renderEmpty }, ref) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [exiting, setExiting] = useState(null); // 'left' | 'right' | null
  const startRef = useRef(null);

  const current = data[index];
  const next = data[index + 1];

  const advance = useCallback(
    (direction) => {
      const item = data[index];
      setExiting(null);
      setDrag({ x: 0, y: 0, dragging: false });
      setIndex((i) => i + 1);
      if (item) onSwipe?.(item, direction);
    },
    [index, data, onSwipe],
  );

  const commitSwipe = useCallback(
    (direction) => {
      setExiting(direction);
      window.setTimeout(() => advance(direction), 240);
    },
    [advance],
  );

  useImperativeHandle(ref, () => ({
    swipe: (direction) => commitSwipe(direction),
    getCurrent: () => data[index],
  }));

  function handlePointerDown(e) {
    if (exiting) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, dragging: true });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!startRef.current) return;
    setDrag({ x: e.clientX - startRef.current.x, y: (e.clientY - startRef.current.y) * 0.35, dragging: true });
  }

  function handlePointerUp() {
    if (!startRef.current) return;
    const { x } = drag;
    startRef.current = null;
    if (x > SWIPE_THRESHOLD) commitSwipe('right');
    else if (x < -SWIPE_THRESHOLD) commitSwipe('left');
    else setDrag({ x: 0, y: 0, dragging: false });
  }

  if (!current) {
    return <div style={styles.container}>{renderEmpty?.()}</div>;
  }

  const exitX = exiting === 'right' ? window.innerWidth * 1.4 : exiting === 'left' ? -window.innerWidth * 1.4 : 0;
  const x = exiting ? exitX : drag.x;
  const y = exiting ? 0 : drag.y;
  const rotate = clamp((x / 300) * ROTATION_RANGE, -ROTATION_RANGE, ROTATION_RANGE);
  const likeOpacity = clamp((x - 10) / (SWIPE_THRESHOLD - 10), 0, 1);
  const nopeOpacity = clamp((-x - 10) / (SWIPE_THRESHOLD - 10), 0, 1);

  return (
    <div style={styles.container}>
      {next && (
        <div style={{ ...styles.cardWrap, transform: 'scale(0.96)', top: 10 }}>{renderCard(next)}</div>
      )}
      <div
        style={{
          ...styles.cardWrap,
          transform: `translate(${x}px, ${y}px) rotate(${rotate}deg)`,
          transition: drag.dragging ? 'none' : 'transform 240ms ease',
          touchAction: 'none',
          cursor: drag.dragging ? 'grabbing' : 'grab',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {renderCard(current)}
        <div style={{ ...styles.stamp, ...styles.stampLike, opacity: likeOpacity }} />
        <div style={{ ...styles.stamp, ...styles.stampNope, opacity: nopeOpacity }} />
      </div>
    </div>
  );
});

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

const styles = {
  container: { position: 'relative', flex: 1, height: '100%' },
  cardWrap: { position: 'absolute', inset: 0 },
  stamp: { position: 'absolute', inset: 0, borderRadius: 28, pointerEvents: 'none' },
  stampLike: { border: '4px solid #2F8F55' },
  stampNope: { border: '4px solid #C8402A' },
};
