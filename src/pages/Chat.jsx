import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRequestThread } from '../lib/useRequestThread';
import { CalendarIcon, CheckIcon, ChevronLeftIcon, HeartIcon, PhoneIcon, XIcon } from '../components/icons';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

function nextDays(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    out.push(d);
  }
  return out;
}

function dayLabel(d, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function parseTimeSlot(slot) {
  const [time, period] = slot.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return { hour, minute: parseInt(minuteStr, 10) };
}

// Web counterpart to uleeb mobile's app/chat/[id].tsx — same REST-polling
// thread (see lib/useRequestThread.js), same in-line scheduling modal
// ("scheduling" isn't a separate feature on mobile either — it's this
// modal, reached from an accepted request's chat).
export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { detail, messages, loading, error, sendMessage, scheduleInspection } = useRequestThread(id, token);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [scheduling, setScheduling] = useState(false);

  const days = nextDays(14);

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setDraft('');
    try {
      await sendMessage(body);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not send. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function openScheduler() {
    setSelectedDay(days[1]);
    setSelectedSlot(null);
    setSchedulerOpen(true);
  }

  async function confirmSchedule() {
    if (!selectedDay || !selectedSlot) return;
    const { hour, minute } = parseTimeSlot(selectedSlot);
    const combined = new Date(selectedDay);
    combined.setHours(hour, minute, 0, 0);

    setScheduling(true);
    try {
      await scheduleInspection(combined);
      setSchedulerOpen(false);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not schedule inspection. Please try again.');
    } finally {
      setScheduling(false);
    }
  }

  if (loading) {
    return <div style={{ ...styles.screen, ...styles.centered }}>Loading…</div>;
  }

  if (error || !detail) {
    return (
      <div style={{ ...styles.screen, ...styles.centered }}>
        <p style={styles.errorText}>{error ?? "This conversation couldn't be found."}</p>
        <button type="button" style={styles.backBtnWide} onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const hasPhone = !!detail.otherPartyPhone;
  const inspectionLabel = detail.inspectionAt
    ? new Date(detail.inspectionAt).toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      })
    : null;

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button type="button" onClick={() => navigate(-1)} style={styles.iconBtn}>
          <ChevronLeftIcon size={14} />
        </button>
        <div style={styles.headerAvatar}>
          <span style={styles.headerAvatarText}>{detail.otherPartyName.charAt(0)}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{detail.otherPartyName}</span>
            {detail.otherPartyVerified && <CheckIcon size={13} color="#2F8F55" />}
          </div>
          <p style={styles.status}>{detail.propertyTitle}</p>
        </div>
      </div>

      <div style={styles.quickActions}>
        <button
          type="button"
          style={{ ...styles.whatsapp, ...(!hasPhone ? styles.disabledBtn : null) }}
          disabled={!hasPhone}
          onClick={() => hasPhone && window.open(`https://wa.me/${detail.otherPartyPhone.replace(/[^0-9]/g, '')}`, '_blank')}
        >
          <HeartIcon size={15} color="#FFFFFF" /> WhatsApp
        </button>
        <a
          href={hasPhone ? `tel:${detail.otherPartyPhone}` : undefined}
          style={{ ...styles.call, ...(!hasPhone ? styles.disabledBtn : null), textDecoration: 'none' }}
          onClick={(e) => !hasPhone && e.preventDefault()}
        >
          <PhoneIcon size={14} /> Call
        </a>
      </div>

      <div style={styles.body}>
        {detail.chatEnabled ? (
          <div style={styles.messages}>
            {messages.length === 0 ? (
              <p style={styles.emptyText}>Say hello — you matched, now's a good time to ask a question.</p>
            ) : (
              messages.map((m) => <MessageBubble key={m.id} message={m} isMine={m.senderId === user?.id} />)
            )}
          </div>
        ) : (
          <div style={styles.chatLockedWrap}>
            <p style={styles.chatLockedTitle}>In-app chat needs a Pro plan</p>
            <p style={styles.chatLockedSub}>
              Use WhatsApp or Call above to reach {detail.otherPartyName.split(' ')[0]} for now, or upgrade for in-app messaging.
            </p>
            <button type="button" style={styles.chatLockedBtn} onClick={() => navigate('/plans')}>View plans</button>
          </div>
        )}

        {!detail.isLandlord && (
          <div style={styles.trustBanner}>
            <p style={styles.trustLabel}>Inspect before you pay</p>
            <p style={styles.trustText}>See the apartment in person before sending any money.</p>
          </div>
        )}

        {inspectionLabel && (
          <div style={styles.inspectionBanner}>
            <CalendarIcon size={14} color="#181614" />
            <span style={styles.inspectionText}>Inspection scheduled for {inspectionLabel}</span>
          </div>
        )}

        <div style={styles.footer}>
          <button type="button" style={styles.scheduleBtn} onClick={openScheduler}>
            {inspectionLabel ? 'Reschedule inspection' : 'Schedule inspection'}
          </button>
          {detail.chatEnabled && (
            <div style={styles.composer}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message"
                style={styles.composerInput}
                rows={1}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button type="button" onClick={handleSend} disabled={sending || !draft.trim()} style={styles.sendBtn}>
                {sending ? '…' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>

      {schedulerOpen && (
        <div style={styles.modalBackdrop} onClick={() => setSchedulerOpen(false)}>
          <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <p style={styles.modalTitle}>Schedule inspection</p>
              <button type="button" onClick={() => setSchedulerOpen(false)} style={styles.iconBtn}>
                <XIcon size={14} />
              </button>
            </div>

            <p style={styles.label}>Day</p>
            <div style={styles.dayScroll}>
              {days.map((d, i) => {
                const active = selectedDay?.getTime() === d.getTime();
                return (
                  <button key={d.toISOString()} type="button" onClick={() => setSelectedDay(d)} style={{ ...styles.chip, ...(active ? styles.chipActive : null) }}>
                    {dayLabel(d, i)}
                  </button>
                );
              })}
            </div>

            <p style={styles.label}>Time</p>
            <div style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => {
                const active = selectedSlot === slot;
                return (
                  <button key={slot} type="button" onClick={() => setSelectedSlot(slot)} style={{ ...styles.chip, ...(active ? styles.chipActive : null) }}>
                    {slot}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={confirmSchedule}
              disabled={!selectedDay || !selectedSlot || scheduling}
              style={{ ...styles.confirmBtn, ...((!selectedDay || !selectedSlot || scheduling) ? { opacity: 0.4 } : null) }}
            >
              {scheduling ? 'Scheduling...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, isMine }) {
  return (
    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <div style={{ ...styles.bubble, ...(isMine ? styles.bubbleMine : styles.bubbleTheirs) }}>
        <p style={{ ...styles.bubbleText, color: isMine ? '#FFFFFF' : '#181614' }}>{message.body}</p>
      </div>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 720, margin: '0 auto', height: 'calc(100dvh - 64px)', display: 'flex', flexDirection: 'column' },
  centered: { alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 14, color: '#5B5750' },
  backBtnWide: { height: 44, padding: '0 24px', borderRadius: 999, border: '1.5px solid #E6E3DB', background: '#FFFFFF', fontWeight: 600, cursor: 'pointer' },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid #EFEDE6' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 999, border: '1.5px solid #E6E3DB', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 999, background: '#131110', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headerAvatarText: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: '#FFFFFF' },
  nameRow: { display: 'flex', alignItems: 'center', gap: 5 },
  name: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: '#181614' },
  status: { fontSize: 12, color: '#9B968C', marginTop: 1 },
  quickActions: { display: 'flex', gap: 8, padding: '12px 24px', borderBottom: '1px solid #EFEDE6' },
  whatsapp: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 999,
    background: '#2F8F55', border: 'none', color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  call: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 999,
    border: '1.5px solid #E6E3DB', background: '#FFFFFF', color: '#181614', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  disabledBtn: { opacity: 0.4, pointerEvents: 'none' },
  body: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '0 24px' },
  messages: { flex: 1, overflowY: 'auto', paddingTop: 16 },
  emptyText: { fontSize: 13, color: '#9B968C', textAlign: 'center', marginTop: 40 },
  bubble: { maxWidth: '70%', borderRadius: 18, padding: '10px 14px' },
  bubbleMine: { background: '#131110', borderBottomRightRadius: 4 },
  bubbleTheirs: { background: '#F0EFE9', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: '19px' },
  chatLockedWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8, padding: '0 24px' },
  chatLockedTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: '#181614' },
  chatLockedSub: { fontSize: 13.5, color: '#5B5750', lineHeight: '20px', maxWidth: 360 },
  chatLockedBtn: { marginTop: 8, height: 44, padding: '0 24px', borderRadius: 999, background: '#131110', color: '#FFFFFF', border: 'none', fontWeight: 600, cursor: 'pointer' },
  trustBanner: { background: '#131110', borderRadius: 16, padding: 14, marginTop: 12 },
  trustLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  trustText: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: '18px' },
  inspectionBanner: { display: 'flex', alignItems: 'center', gap: 8, background: '#F0EFE9', borderRadius: 14, padding: '10px 14px', marginTop: 12 },
  inspectionText: { fontSize: 12.5, fontWeight: 600, color: '#181614' },
  footer: { padding: '14px 0 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  scheduleBtn: {
    height: 46, borderRadius: 999, border: '1.5px solid #E6E3DB', background: '#FFFFFF',
    fontSize: 13.5, fontWeight: 600, color: '#181614', cursor: 'pointer',
  },
  composer: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  composerInput: {
    flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 18, border: '1px solid #E6E3DB', background: '#FFFFFF',
    padding: '11px 16px', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none',
  },
  sendBtn: { height: 44, padding: '0 20px', borderRadius: 999, background: '#131110', color: '#FFFFFF', border: 'none', fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1200 },
  modalSheet: { background: '#F7F6F2', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 520, maxHeight: '80vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#181614' },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#9B968C', marginBottom: 10 },
  dayScroll: { display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 },
  timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  chip: {
    padding: '10px 14px', borderRadius: 999, border: '1px solid #E6E3DB', background: '#FFFFFF',
    fontSize: 12.5, fontWeight: 600, color: '#181614', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  chipActive: { background: '#131110', borderColor: '#131110', color: '#FFFFFF' },
  confirmBtn: { height: 50, borderRadius: 999, background: '#131110', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', marginTop: 24, width: '100%' },
};
