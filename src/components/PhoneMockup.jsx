import { PHONE_SWIPE_IMG } from '../assets/houseImages';

function Frame({ children, tilt = 0 }) {
  return (
    <div style={{
      width: 280, borderRadius: 44, background: '#0F172A', padding: 10,
      boxShadow: '0 40px 90px rgba(15,23,42,0.32)',
      transform: tilt ? `rotate(${tilt}deg)` : 'none',
      flexShrink: 0,
    }}>
      <div style={{
        borderRadius: 34, background: '#EEF6FF', overflow: 'hidden',
        height: 'clamp(480px, 62vh, 600px)', position: 'relative',
      }}>
        {/* Dynamic island / notch */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 90, height: 22, borderRadius: 12, background: '#0F172A', zIndex: 4,
        }} />
        {children}
      </div>
    </div>
  );
}

function SwipeScreen() {
  return (
    <div style={{ padding: '52px 14px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, textAlign: 'center' }}>
        Discover
      </div>
      {/* Swipe card — real house photo or accent fallback */}
      <div style={{
        flex: 1, borderRadius: 22, background: '#F5CC38',
        position: 'relative', overflow: 'hidden', boxShadow: '0 8px 28px rgba(15,23,42,0.14)',
      }}>
        {PHONE_SWIPE_IMG && (
          <img
            src={PHONE_SWIPE_IMG}
            alt="property"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.72) 100%)',
          zIndex: 1,
        }} />
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: '#0F172A', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
          Verified
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '16px 16px' }}>
          <div className="display" style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>2-bed flat, Lekki Phase 1</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>Lagos · ₦2,400,000 / yr</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 999, background: '#fff', border: '1.5px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}>
          <span style={{ color: '#C8402A', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>✕</span>
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 999, background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(15,23,42,0.28)' }}>
          <span style={{ color: '#F5CC38', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>♥</span>
        </div>
      </div>
    </div>
  );
}

function ChatScreen() {
  const bubbles = [
    { me: false, text: "Hi! Is the flat still available?" },
    { me: true,  text: 'Yes it is — want to schedule a viewing?' },
    { me: false, text: 'Saturday morning works for me' },
  ];
  return (
    <div style={{ padding: '52px 14px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, textAlign: 'center' }}>
        Chat
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end' }}>
        {bubbles.map((b, i) => (
          <div key={i} style={{
            alignSelf: b.me ? 'flex-end' : 'flex-start',
            background: b.me ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' : '#fff',
            color: b.me ? '#fff' : '#0F172A',
            border: b.me ? 'none' : '1px solid #DBEAFE',
            borderRadius: b.me ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            padding: '10px 14px', fontSize: 13, maxWidth: '80%',
            boxShadow: b.me ? '0 4px 14px rgba(15,23,42,0.22)' : '0 2px 10px rgba(15,23,42,0.06)',
          }}>
            {b.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, height: 40, borderRadius: 999, background: '#fff', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12, color: '#94A3B8' }}>
        Message…
      </div>
    </div>
  );
}

function InboxScreen() {
  const rows = [
    { name: 'Kwame A.',     sub: 'Interested · 2-bed, Accra',   tag: 'New' },
    { name: 'Chinonso O.', sub: 'Accepted · Studio, Lagos',    tag: null  },
    { name: 'Amara K.',    sub: 'Interested · 3-bed, Nairobi', tag: 'New' },
  ];
  return (
    <div style={{ padding: '52px 14px 14px', height: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, textAlign: 'center' }}>
        Requests
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => (
          <div key={r.name} style={{ background: '#fff', border: '1px solid #DBEAFE', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 10px rgba(15,23,42,0.06)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: '#E3EFFD', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>{r.sub}</div>
            </div>
            {r.tag && <div style={{ background: '#0F172A', color: '#C8F23E', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>{r.tag}</div>}
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
