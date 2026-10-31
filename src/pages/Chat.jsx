import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { useAuth } from '../context/AuthContext';
import { useRequestThread } from '../lib/useRequestThread';
import { ratings as ratingsApi, requestsApi } from '../lib/api';
import { CalendarIcon, CheckIcon, ChevronLeftIcon, PhoneIcon, WhatsAppIcon, XIcon } from '../components/icons';

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
  const goBack = useGoBack('/requests');
  const { user, token } = useAuth();
  const { detail, messages, loading, error, sendMessage, scheduleInspection, refresh } = useRequestThread(id, token);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [scheduling, setScheduling] = useState(false);

  // Rating state — tenant can rate the landlord once per accepted or closed request
  const [myRating, setMyRating] = useState(null);   // null=loading, 0=not rated, 1-5=rated
  const [hoverStar, setHoverStar] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Close request modal state
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const days = nextDays(14);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load existing rating once we know the request is accepted/closed and user is tenant
  useEffect(() => {
    if (!detail || detail.isLandlord) return;
    if (detail.status !== 'accepted' && detail.status !== 'closed') return;
    ratingsApi.myRating(id, token)
      .then((r) => setMyRating(r?.score ?? 0))
      .catch(() => setMyRating(0)); // 404 = not yet rated
  }, [detail, id, token]);

  async function submitRating(score) {
    setSubmittingRating(true);
    try {
      await ratingsApi.rate(id, score, token);
      setMyRating(score);
    } catch (e) {
      if (e.status === 409) setMyRating(score); // already rated
      else window.alert(e.message);
    } finally {
      setSubmittingRating(false);
    }
  }

  async function closeRequest(outcome) {
    setClosing(true);
    try {
      await requestsApi.close(id, outcome, token);
      setCloseModalOpen(false);
      await refresh();
    } catch (e) {
      window.alert(e.message);
    } finally {
      setClosing(false);
    }
  }

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
        <button type="button" style={styles.backBtnWide} onClick={() => goBack()}>Go back</button>
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
        <button type="button" onClick={() => goBack()} style={styles.iconBtn}>
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

      {/* Rating section — shown to tenant on accepted or closed request */}
      {detail && !detail.isLandlord && (detail.status === 'accepted' || detail.status === 'closed') && (
        <div style={styles.ratingSection}>
          {myRating === null ? (
            <p style={styles.ratingNote}>Loading…</p>
          ) : myRating === 0 ? (
            <>
              <p style={styles.ratingPrompt}>Rate {detail.otherPartyName.split(' ')[0]}'s service</p>
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={submittingRating}
                    style={styles.starBtn}
                    onMouseEnter={() => setHoverStar(n)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => submitRating(n)}
                  >
                    <span style={{ fontSize: 28, color: hoverStar >= n ? '#F59E0B' : '#CBD5E1' }}>★</span>
                  </button>
                ))}
              </div>
              {submittingRating && <p style={styles.ratingNote}>Saving…</p>}
            </>
          ) : (
            <div style={styles.ratingDone}>
              <p style={styles.ratingDoneLabel}>Your rating</p>
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} style={{ fontSize: 24, color: myRating >= n ? '#F59E0B' : '#CBD5E1' }}>★</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={styles.quickActions}>
        <button
          type="button"
          style={{ ...styles.whatsapp, ...(!hasPhone ? styles.disabledBtn : null) }}
          disabled={!hasPhone}
          onClick={() => hasPhone && window.open(`https://wa.me/${detail.otherPartyPhone.replace(/[^0-9]/g, '')}`, '_blank')}
        >
          <WhatsAppIcon size={15} color="#FFFFFF" /> WhatsApp
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
            <div ref={messagesEndRef} />
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
            <CalendarIcon size={14} color="#0F172A" />
            <span style={styles.inspectionText}>Inspection scheduled for {inspectionLabel}</span>
          </div>
        )}

        {detail.status === 'closed' && (
          <div style={styles.closedBanner}>
            <span style={styles.closedIcon}>🔒</span>
            <span style={styles.closedText}>This request is closed. No further messages can be sent.</span>
          </div>
        )}

        <div style={styles.footer}>
          {detail.status === 'accepted' && (
            <button type="button" style={styles.closeRequestBtn} onClick={() => setCloseModalOpen(true)}>
              Close request
            </button>
          )}
          {detail.status !== 'closed' && (
            <button type="button" style={styles.scheduleBtn} onClick={openScheduler}>
              {inspectionLabel ? 'Reschedule inspection' : 'Schedule inspection'}
            </button>
          )}
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

      {closeModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => !closing && setCloseModalOpen(false)}>
          <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <p style={styles.modalTitle}>Close this request</p>
              <button type="button" onClick={() => setCloseModalOpen(false)} style={styles.iconBtn} disabled={closing}>
                <XIcon size={14} />
              </button>
            </div>
            <p style={styles.closeModalSub}>What happened with <strong>{detail.propertyTitle}</strong>?</p>
            <div style={styles.closeOptions}>
              <button
                type="button"
                disabled={closing}
                style={styles.closeOptionRented}
                onClick={() => closeRequest('rented')}
              >
                <span style={{ fontSize: 28 }}>🏠</span>
                <span style={styles.closeOptionLabel}>Rented</span>
                <span style={styles.closeOptionDesc}>Deal done — this property was successfully rented</span>
              </button>
              <button
                type="button"
                disabled={closing}
                style={styles.closeOptionPassed}
                onClick={() => closeRequest('passed')}
              >
                <span style={{ fontSize: 28 }}>👋</span>
                <span style={styles.closeOptionLabel}>Passed</span>
                <span style={styles.closeOptionDesc}>Not going through — closing without a deal</span>
              </button>
            </div>
            {closing && <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 12 }}>Closing…</p>}
          </div>
        </div>
      )}

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
        <p style={{ ...styles.bubbleText, color: isMine ? '#FFFFFF' : '#0F172A' }}>{message.body}</p>
      </div>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 720, margin: '0 auto', height: 'calc(100dvh - 64px)', display: 'flex', flexDirection: 'column' },
  centered: { alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 14, color: '#475569' },
  backBtnWide: { height: 44, padding: '0 24px', borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF', fontWeight: 600, cursor: 'pointer' },
  header: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderBottom: '1px solid #DBEAFE' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 999, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headerAvatarText: { fontFamily: "'Poppins', sans-serif", fontSize: 15, color: '#FFFFFF' },
  nameRow: { display: 'flex', alignItems: 'center', gap: 5 },
  name: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, color: '#0F172A' },
  status: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  quickActions: { display: 'flex', gap: 8, padding: '12px 24px', borderBottom: '1px solid #DBEAFE' },
  whatsapp: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 999,
    background: '#2F8F55', border: 'none', color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  call: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 999,
    border: '1.5px solid #BFDBFE', background: '#FFFFFF', color: '#0F172A', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  disabledBtn: { opacity: 0.4, pointerEvents: 'none' },
  body: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '0 24px' },
  messages: { flex: 1, overflowY: 'auto', paddingTop: 16 },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 40 },
  bubble: { maxWidth: '70%', borderRadius: 18, padding: '10px 14px' },
  bubbleMine: { background: '#2563EB', borderBottomRightRadius: 4 },
  bubbleTheirs: { background: '#EEF6FF', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: '19px' },
  chatLockedWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8, padding: '0 24px' },
  chatLockedTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 17, color: '#0F172A' },
  chatLockedSub: { fontSize: 13.5, color: '#475569', lineHeight: '20px', maxWidth: 360 },
  chatLockedBtn: { marginTop: 8, height: 44, padding: '0 24px', borderRadius: 999, background: '#0F172A', color: '#FFFFFF', border: 'none', fontWeight: 600, cursor: 'pointer' },
  trustBanner: { background: '#0F172A', borderRadius: 16, padding: 14, marginTop: 12 },
  trustLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  trustText: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: '18px' },
  inspectionBanner: { display: 'flex', alignItems: 'center', gap: 8, background: '#DBEAFE', borderRadius: 14, padding: '10px 14px', marginTop: 12 },
  inspectionText: { fontSize: 12.5, fontWeight: 600, color: '#0F172A' },
  footer: { padding: '14px 0 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  scheduleBtn: {
    height: 46, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    fontSize: 13.5, fontWeight: 600, color: '#0F172A', cursor: 'pointer',
  },
  composer: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  composerInput: {
    flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 18, border: '1px solid #BFDBFE', background: '#FFFFFF',
    padding: '11px 16px', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none',
  },
  sendBtn: { height: 44, padding: '0 20px', borderRadius: 999, background: '#0F172A', color: '#FFFFFF', border: 'none', fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1200 },
  modalSheet: { background: '#EEF6FF', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 520, maxHeight: '80vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A' },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#94A3B8', marginBottom: 10 },
  dayScroll: { display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 },
  timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  chip: {
    padding: '10px 14px', borderRadius: 999, border: '1px solid #BFDBFE', background: '#FFFFFF',
    fontSize: 12.5, fontWeight: 600, color: '#0F172A', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  chipActive: { background: '#2563EB', borderColor: '#2563EB', color: '#FFFFFF' },
  confirmBtn: { height: 50, borderRadius: 999, background: '#0F172A', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 14.5, cursor: 'pointer', marginTop: 24, width: '100%' },
  // Closed banner
  closedBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#F1F5F9', borderRadius: 14, padding: '10px 14px', margin: '0 0 4px',
    borderLeft: '3px solid #94A3B8',
  },
  closedIcon: { fontSize: 16, flexShrink: 0 },
  closedText: { fontSize: 12.5, color: '#64748B', lineHeight: '18px' },
  // Close request button
  closeRequestBtn: {
    height: 46, borderRadius: 999, border: '1.5px solid #FCA5A5', background: '#FEF2F2',
    fontSize: 13.5, fontWeight: 600, color: '#DC2626', cursor: 'pointer',
  },
  // Close modal options
  closeModalSub: { fontSize: 13.5, color: '#475569', marginBottom: 20, lineHeight: '20px' },
  closeOptions: { display: 'flex', gap: 10 },
  closeOptionRented: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '20px 12px', borderRadius: 18, border: '2px solid #DBEAFE',
    background: '#F0FFF4', cursor: 'pointer',
  },
  closeOptionPassed: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '20px 12px', borderRadius: 18, border: '2px solid #DBEAFE',
    background: '#FAFCFF', cursor: 'pointer',
  },
  closeOptionLabel: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, color: '#0F172A' },
  closeOptionDesc: { fontSize: 11.5, color: '#64748B', textAlign: 'center', lineHeight: '16px' },
  // Rating section
  ratingSection: {
    padding: '12px 24px', borderBottom: '1px solid #DBEAFE', background: '#FEFCE8',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  ratingPrompt: { fontSize: 13, fontWeight: 600, color: '#78350F' },
  ratingNote: { fontSize: 12, color: '#92400E' },
  starsRow: { display: 'flex', gap: 4 },
  starBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 2 },
  ratingDone: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  ratingDoneLabel: { fontSize: 12, fontWeight: 600, color: '#92400E' },
};
