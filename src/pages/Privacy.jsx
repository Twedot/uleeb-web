import { Link } from 'react-router-dom';

const CARDS = [
  {
    accent: '#F4C8DC',
    icon: '🗂️',
    tag: 'What we collect',
    title: 'Data you give us',
    points: [
      'Your phone number or email address when you sign up',
      'Your name, occupation, budget, and state (from your profile)',
      'Property details you list as a landlord or agent',
      'Messages you send within the platform',
      'Payment reference numbers (not your card details — those go to Paystack)',
    ],
  },
  {
    accent: '#C8F23E',
    icon: '⚙️',
    tag: 'How we use it',
    title: 'Running the platform',
    points: [
      'To create and manage your account',
      'To match tenants with relevant listings',
      'To send OTP codes and in-app notifications',
      'To process plan subscriptions via Paystack',
      'To keep the platform safe and prevent abuse',
    ],
  },
  {
    accent: '#F5CC38',
    icon: '🤝',
    tag: 'Third parties',
    title: 'Who we share with',
    points: [
      'Paystack — to process payments (see paystack.com/privacy)',
      'Twedot — uleeb\'s parent company, for platform operations',
      'We do not sell your personal data to any third party',
      'We do not share your data with advertisers',
    ],
  },
];

const SECTIONS = [
  {
    title: 'Your rights',
    body: `You can request a copy of the data we hold about you, ask us to correct inaccurate data, or ask us to delete your account and associated data. To make any of these requests, email hello@uleeb.com. We will respond within 30 days.`,
  },
  {
    title: 'Data retention',
    body: `We keep your data for as long as your account is active. If you delete your account, we remove your personal data within 30 days, except where we are required by law to retain certain records (e.g. payment records for tax purposes).`,
  },
  {
    title: 'Security',
    body: `We use industry-standard practices to protect your data — encrypted connections (HTTPS), hashed passwords, and access controls on our servers. No system is perfect; if you believe your account has been compromised, contact us immediately.`,
  },
  {
    title: 'Children',
    body: `uleeb is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, please contact us and we will remove it promptly.`,
  },
  {
    title: 'Changes to this policy',
    body: `Like our Terms of Service, this Privacy Policy will evolve as uleeb grows. We will update the "Last updated" date when we make changes. We encourage you to review this page periodically. Continued use of uleeb after changes means you accept the updated policy.`,
  },
  {
    title: 'Contact',
    body: `Questions about your privacy? Email us at hello@uleeb.com.`,
  },
];

function PrivacyCard({ card }) {
  return (
    <div style={{
      flex: '1 1 260px', borderRadius: 28, background: '#fff',
      boxShadow: '0 8px 36px rgba(15,23,42,0.09)', overflow: 'hidden',
    }}>
      <div style={{
        height: 156, background: card.accent,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        justifyContent: 'space-between', padding: '20px 24px',
      }}>
        <span style={{
          background: 'rgba(15,23,42,0.10)', color: '#0F172A',
          fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
        }}>{card.tag}</span>
        <span style={{ fontSize: 44, lineHeight: 1 }}>{card.icon}</span>
      </div>
      <div style={{ padding: '22px 24px 28px' }}>
        <h3 className="display" style={{ fontWeight: 700, fontSize: 18, color: '#0F172A', marginBottom: 16, lineHeight: 1.2 }}>
          {card.title}
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {card.points.map((p) => (
            <li key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>
              <span style={{ flexShrink: 0, marginTop: 2, width: 6, height: 6, borderRadius: 999, background: '#0F172A', display: 'inline-block' }} />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Privacy() {
  return (
    <div style={styles.page}>
      <div style={styles.inner}>

        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadLink}>uleeb</Link>
          <span style={styles.breadSep}>/</span>
          <span style={styles.breadCurrent}>Privacy Policy</span>
        </div>

        {/* Hero header */}
        <div style={styles.hero}>
          <div style={styles.heroTag}>Privacy</div>
          <h1 className="display" style={styles.heroTitle}>Privacy Policy</h1>
          <p style={styles.heroSub}>Last updated: <strong>26 October 2026</strong></p>
          <p style={styles.heroCopy}>
            We built uleeb to help people find homes — not to harvest data. This policy explains what we collect, why, and what you can do about it. As the platform grows this policy will be updated; we will always be transparent about what changes.
          </p>
        </div>

        {/* 3 colored overview cards */}
        <div style={styles.cards}>
          {CARDS.map((c) => <PrivacyCard key={c.tag} card={c} />)}
        </div>

        {/* Detail sections */}
        <div style={styles.sections}>
          {SECTIONS.map((s) => (
            <div key={s.title} style={styles.section}>
              <h2 style={styles.sectionTitle}>{s.title}</h2>
              <p style={styles.sectionBody}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <Link to="/terms" style={styles.footLink}>Terms of Service</Link>
          <span style={styles.breadSep}>·</span>
          <Link to="/" style={styles.footLink}>Back to uleeb</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100dvh', background: '#EEF6FF', padding: '48px 24px 80px' },
  inner: { maxWidth: 1100, margin: '0 auto' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, fontSize: 13.5, fontWeight: 600 },
  breadLink: { color: '#2563EB', textDecoration: 'none' },
  breadSep: { color: '#CBD5E1' },
  breadCurrent: { color: '#94A3B8' },
  hero: { background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: 28, padding: '48px 40px', marginBottom: 40, maxWidth: 760 },
  heroTag: { display: 'inline-block', background: '#C8F23E', color: '#0F172A', fontSize: 11.5, fontWeight: 700, padding: '5px 14px', borderRadius: 999, letterSpacing: 0.4, marginBottom: 20 },
  heroTitle: { fontWeight: 700, fontSize: 'clamp(28px, 5vw, 42px)', color: '#FFFFFF', lineHeight: 1.1, marginBottom: 12 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 20 },
  heroCopy: { fontSize: 15.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 },
  cards: { display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 },
  sections: { display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 760 },
  section: { background: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: 20, padding: '28px 28px' },
  sectionTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 12 },
  sectionBody: { fontSize: 14.5, color: '#475569', lineHeight: 1.8 },
  footer: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 36, justifyContent: 'center' },
  footLink: { color: '#2563EB', fontSize: 14, fontWeight: 600, textDecoration: 'none' },
};
