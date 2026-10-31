import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { BellIcon, ChevronLeftIcon, CheckIcon, HomeIcon, XIcon } from '../components/icons';

function groupByDate(items) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

  const today = [], thisWeek = [], earlier = [];
  for (const n of items) {
    const t = new Date(n.createdAt).getTime();
    if (t >= todayStart) today.push(n);
    else if (t >= weekStart) thisWeek.push(n);
    else earlier.push(n);
  }
  return [
    { label: 'Today', items: today },
    { label: 'This week', items: thisWeek },
    { label: 'Earlier', items: earlier },
  ].filter((g) => g.items.length > 0);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_CONFIG = {
  request:          { icon: HomeIcon,  iconColor: '#93C5FD', bg: '#0F172A' },
  request_accepted: { icon: CheckIcon, iconColor: '#4ADE80', bg: '#0F172A' },
  request_declined: { icon: XIcon,     iconColor: '#F87171', bg: '#0F172A' },
};

function NotifIcon({ type }) {
  const cfg = TYPE_CONFIG[type] ?? { icon: BellIcon, iconColor: '#CBD5E1', bg: '#0F172A' };
  const Icon = cfg.icon;
  return (
    <div style={{
      width: 52, height: 52, borderRadius: 16, background: cfg.bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={22} color={cfg.iconColor} strokeWidth={2} />
    </div>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const { user } = useAuth();
  const { notifications, loading, markRead, markAllRead } = useNotifications();

  function handleClick(n) {
    if (!n.read) markRead(n.id);
    const reqId = n.data?.requestId;
    if (!reqId) return;
    if (n.type === 'request') {
      navigate(`/requests/${reqId}`);
    } else if (n.type === 'request_accepted') {
      navigate(`/chat/${reqId}`);
    } else {
      navigate('/requests');
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groups = groupByDate(notifications);

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button type="button" style={styles.backBtn} onClick={() => goBack()}>
          <ChevronLeftIcon size={15} />
        </button>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Notifications</h1>
          {unreadCount > 0 && (
            <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 ? (
          <button type="button" style={styles.readAllBtn} onClick={markAllRead}>
            Mark all read
          </button>
        ) : (
          <div style={{ width: 80 }} />
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>Loading…</p>
        </div>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}><BellIcon size={26} color="#94A3B8" /></div>
          <p style={styles.emptyTitle}>No notifications yet</p>
          <p style={styles.emptySub}>You'll be notified here when someone requests a property or responds to yours.</p>
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.label}>
              <p style={styles.groupLabel}>{group.label}</p>
              <div style={styles.groupBlock}>
                {group.items.map((n, i) => (
                  <button
                    key={n.id}
                    type="button"
                    style={{
                      ...styles.item,
                      ...(i < group.items.length - 1 ? styles.itemBorder : null),
                    }}
                    onClick={() => handleClick(n)}
                  >
                    <NotifIcon type={n.type} />
                    <div style={styles.itemBody}>
                      <p style={styles.itemText}>{n.title}</p>
                      {n.body ? <p style={styles.itemSub}>{n.body}</p> : null}
                    </div>
                    {!n.read && <span style={styles.dot} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  screen: { maxWidth: 560, margin: '0 auto', padding: '0 0 48px' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '24px 20px 20px',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 999, border: '1.5px solid #BFDBFE', background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: '#0F172A' },
  badge: {
    minWidth: 22, height: 22, borderRadius: 999, background: '#EF4444', color: '#FFFFFF',
    fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 5px',
  },
  readAllBtn: {
    background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600,
    color: '#475569', cursor: 'pointer', padding: 0,
  },
  groupLabel: {
    fontSize: 12.5, fontWeight: 700, color: '#94A3B8', padding: '8px 20px 6px',
    textTransform: 'capitalize',
  },
  groupBlock: {
    background: '#FFFFFF', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9',
    marginBottom: 16,
  },
  item: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
    background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
  },
  itemBorder: { borderBottom: '1px solid #F1F5F9' },
  itemBody: { flex: 1, minWidth: 0 },
  itemText: { fontSize: 13.5, fontWeight: 500, color: '#0F172A', lineHeight: '19px' },
  itemSub: { fontSize: 12, color: '#94A3B8', marginTop: 2, lineHeight: '17px' },
  dot: {
    width: 10, height: 10, borderRadius: 999, background: '#EF4444', flexShrink: 0,
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 32px', textAlign: 'center', gap: 12,
  },
  emptyIcon: {
    width: 56, height: 56, borderRadius: 18, background: '#F1F5F9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, color: '#0F172A' },
  emptySub: { fontSize: 13.5, color: '#475569', lineHeight: '20px', maxWidth: 280 },
};
