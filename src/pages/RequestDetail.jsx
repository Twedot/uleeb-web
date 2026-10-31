import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequests } from '../context/RequestsContext';
import { CheckIcon, ChevronLeftIcon } from '../components/icons';
import { useGoBack } from '../hooks/useGoBack';

// Web counterpart to uleeb mobile's app/(tabs)/requests/[id].tsx — the
// landlord's side of a request: applicant fact sheet, accept/decline,
// and (once accepted) a link into the chat/scheduling thread.
export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack('/requests');
  const { getRequest, acceptRequest, declineRequest } = useRequests();
  const item = getRequest(id);
  const [working, setWorking] = useState(false);

  if (!item) return null;
  const name = item.tenantName || 'Tenant';

  async function handleAccept() {
    setWorking(true);
    try {
      await acceptRequest(item.id);
      navigate(`/chat/${item.id}`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not accept this request. Please try again.');
    } finally {
      setWorking(false);
    }
  }

  async function handleDecline() {
    setWorking(true);
    try {
      await declineRequest(item.id);
      goBack();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not decline this request. Please try again.');
      setWorking(false);
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button type="button" onClick={goBack} style={styles.backBtn}>
          <ChevronLeftIcon size={15} />
        </button>
        <h1 style={styles.title}>Request</h1>
      </div>
      <p style={styles.subtitle}>Interested in {item.propertyTitle ?? 'your listing'}</p>

      <div style={styles.body}>
        <div style={styles.identity}>
          <div style={styles.avatar}>
            <span style={styles.avatarText}>{name.charAt(0)}</span>
          </div>
          <div>
            <div style={styles.nameRow}>
              <span style={styles.name}>{name}</span>
              {item.tenantVerified && <CheckIcon size={12} color="#2F8F55" />}
            </div>
            {item.occupation && <p style={styles.role}>{item.occupation}</p>}
          </div>
        </div>

        <div style={styles.badgeRow}>
          <span style={{ ...styles.chip, ...styles.chipDark }}>
            <CheckIcon size={11} color="#FFFFFF" /> Sent a request
          </span>
          {item.tenantVerified && (
            <span style={styles.chip}>
              <CheckIcon size={11} color="#2F8F55" /> Verified tenant
            </span>
          )}
        </div>

        <div style={styles.factSheet}>
          <FactRow label="Budget" value={item.budget ? `₦${item.budget.toLocaleString()} / yr` : 'Not set'} />
          <FactRow label="State" value={item.state ?? 'Not set'} last={!item.email && !item.phone} />
          {item.email && <FactRow label="Email" value={item.email} last={!item.phone} />}
          {item.phone && <FactRow label="Phone" value={item.phone} last />}
        </div>

        {item.status !== 'accepted' && (
          <div style={styles.introBox}>
            <p style={styles.introLabel}>Contact</p>
            <p style={styles.introText}>Revealed once you accept this request.</p>
          </div>
        )}
      </div>

      {item.status === 'new' ? (
        <div style={styles.decision}>
          <button type="button" style={{ ...styles.btn, ...styles.btnSecondary, flex: 1 }} onClick={handleDecline} disabled={working}>
            Decline
          </button>
          <button type="button" style={{ ...styles.btn, ...styles.btnPrimary, flex: 2 }} onClick={handleAccept} disabled={working}>
            Accept request
          </button>
        </div>
      ) : item.status === 'accepted' ? (
        <div style={styles.decision}>
          <button type="button" style={{ ...styles.btn, ...styles.btnPrimary, flex: 1 }} onClick={() => navigate(`/chat/${item.id}`)}>
            Message tenant
          </button>
        </div>
      ) : (
        <div style={styles.decision}>
          <p style={styles.resolvedText}>You declined this request.</p>
        </div>
      )}
    </div>
  );
}

function FactRow({ label, value, last }) {
  return (
    <div style={{ ...styles.factRow, ...(last ? { borderBottom: 'none' } : null) }}>
      <span style={styles.factLabel}>{label}</span>
      <span style={styles.factValue}>{value}</span>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 64px)' },
  header: { display: 'flex', alignItems: 'center', gap: 14, padding: '24px 24px 0' },
  backBtn: {
    width: 36, height: 36, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 21, color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#475569', padding: '10px 24px 20px' },
  body: { flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  identity: { display: 'flex', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 999, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontFamily: "'Poppins', sans-serif", fontSize: 24, color: '#FFFFFF' },
  nameRow: { display: 'flex', alignItems: 'center', gap: 6 },
  name: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 19, color: '#0F172A' },
  role: { fontSize: 13, color: '#94A3B8', marginTop: 3 },
  badgeRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#0F172A',
    padding: '6px 12px', borderRadius: 999, background: '#FFFFFF', border: '1px solid #BFDBFE',
  },
  chipDark: { background: '#2563EB', color: '#FFFFFF', border: 'none' },
  factSheet: { background: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: 20, padding: '0 16px' },
  factRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #DBEAFE' },
  factLabel: { fontSize: 13, color: '#94A3B8' },
  factValue: { fontSize: 13.5, fontWeight: 600, color: '#0F172A' },
  introBox: { background: '#EEF6FF', borderRadius: 16, padding: 16 },
  introLabel: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 },
  introText: { fontSize: 13.5, color: '#475569', lineHeight: '20px' },
  decision: { display: 'flex', gap: 10, padding: '16px 24px 24px' },
  btn: { height: 50, borderRadius: 999, border: 'none', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' },
  btnPrimary: { background: '#0F172A', color: '#FFFFFF' },
  btnSecondary: { background: '#FFFFFF', color: '#0F172A', border: '1.5px solid #BFDBFE' },
  resolvedText: { fontSize: 13.5, color: '#94A3B8', textAlign: 'center', flex: 1, padding: '14px 0' },
};
