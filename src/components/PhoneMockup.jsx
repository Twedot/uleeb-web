// A real phone-frame mockup (not a floating card) — sized and treated
// the way twedot-site treats its real photography in StickyScroll/
// CTASection: big, confident, one per panel. No app screenshots exist
// yet, so this is built from plain markup instead, but at phone-frame
// scale rather than a small illustrative card.
function Frame({ children, tilt = 0 }) {
  return (
    <div style={{
      width: 280, borderRadius: 44, background: 'var(--ink)', padding: 10,
      boxShadow: '0 40px 90px rgba(19,17,16,0.28)',
      transform: tilt ? `rotate(${tilt}deg)` : 'none',
      flexShrink: 0,
    }}>
      <div style={{
        borderRadius: 34, background: 'var(--bg)', overflow: 'hidden',
        height: 'clamp(480px, 62vh, 600px)', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 90, height: 22, borderRadius: 12, background: 'var(--ink)', zIndex: 2,
        }} />
        {children}
      </div>
    </div>
  );
}

function SwipeScreen() {
  return (
    <div style={{ padding: '52px 16px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, textAlign: 'center' }}>
        Discover
      </div>
      <div style={{
        flex: 1, borderRadius: 24, background: 'linear-gradient(150deg,#EFEDE6,#E6E3DB)',
        position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)',
      }}>
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'var(--green-bg)', color: 'var(--green)', fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
          Verified
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.92)', padding: '16px 18px' }}>
          <div className="display" style={{ fontWeight: 700, fontSize: 15 }}>2-bed flat, Lekki</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>₦2,400,000 / yr</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 999, background: '#fff', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontWeight: 700 }}>✕</div>
        <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>♥</div>
      </div>
    </div>
  );
}

function ChatScreen() {
  const bubbles = [
    { me: false, text: "Hi! Is the flat still available?" },
    { me: true, text: 'Yes it is — want to schedule a viewing?' },
    { me: false, text: 'Saturday morning works for me' },
  ];
  return (
    <div style={{ padding: '52px 16px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, textAlign: 'center' }}>
        Chat
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end' }}>
        {bubbles.map((b, i) => (
          <div key={i} style={{
            alignSelf: b.me ? 'flex-end' : 'flex-start',
            background: b.me ? 'var(--ink)' : '#fff',
            color: b.me ? '#fff' : 'var(--text)',
            border: b.me ? 'none' : '1px solid var(--border)',
            borderRadius: 16,
            padding: '10px 14px',
            fontSize: 13,
            maxWidth: '78%',
            boxShadow: b.me ? 'none' : 'var(--shadow)',
          }}>
            {b.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, height: 40, borderRadius: 999, background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12, color: 'var(--text-faint)' }}>
        Message…
      </div>
    </div>
  );
}

function InboxScreen() {
  const rows = [
    { name: 'Ada Bello', sub: 'Interested · 2-bed, Lekki', tag: 'New' },
    { name: 'Chinedu O.', sub: 'Accepted · Studio, Yaba', tag: null },
    { name: 'Femi A.', sub: 'Interested · 3-bed, Ikoyi', tag: 'New' },
  ];
  return (
    <div style={{ padding: '52px 16px 16px', height: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, textAlign: 'center' }}>
        Requests
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => (
          <div key={r.name} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--bg-alt)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.sub}</div>
            </div>
            {r.tag && <div style={{ background: 'var(--green-bg)', color: 'var(--green)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>{r.tag}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREENS = { swipe: SwipeScreen, chat: ChatScreen, inbox: InboxScreen };

export default function PhoneMockup({ variant = 'swipe', tilt = 0 }) {
  const Screen = SCREENS[variant];
  return (
    <Frame tilt={tilt}>
      <Screen />
    </Frame>
  );
}
