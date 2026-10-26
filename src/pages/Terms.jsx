import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Using uleeb',
    body: `uleeb is a rental marketplace that connects tenants with landlords and property agents. By creating an account you agree to provide accurate information about yourself and to use the platform in good faith. You must be at least 18 years old to use uleeb.`,
  },
  {
    title: '2. Listings and content',
    body: `Landlords and agents are responsible for the accuracy of their listings — photos, prices, descriptions, and fees must reflect the actual property. uleeb may remove listings that are misleading, duplicated, or violate these terms. Tenants must not use uleeb to send spam, fake requests, or to harass other users.`,
  },
  {
    title: '3. Payments and fees',
    body: `Plan payments are processed via Paystack. Fees are charged in advance and are non-refundable unless otherwise stated. Any agency fees or extra charges shown on a listing are set by the landlord or agent — uleeb does not collect or guarantee these amounts. Always confirm fees directly with the property owner before making any payment outside the platform.`,
  },
  {
    title: '4. Privacy',
    body: `Your personal data is handled in accordance with our Privacy Policy. By using uleeb you consent to the collection and use of your data as described there. We do not sell your data to third parties.`,
  },
  {
    title: '5. Wallet and promotions',
    body: `The uleeb wallet is a promotional feature for landlords and agents. Credits are earned when a listed property is verified by the uleeb team. Promotional terms — including credit amounts and expiry dates — may change at any time. Wallet credits have no cash value and cannot be withdrawn.`,
  },
  {
    title: '6. Limitation of liability',
    body: `uleeb provides a platform to connect parties — we do not inspect properties, guarantee tenancy agreements, or mediate disputes between tenants and landlords. We are not liable for losses arising from transactions or agreements made between users on or off the platform.`,
  },
  {
    title: '7. Changes to these terms',
    body: `We are a growing platform and these terms will evolve. When we make material changes we will update the "Last updated" date at the top of this page. Continuing to use uleeb after changes are posted means you accept the updated terms. We encourage you to check back periodically.`,
  },
  {
    title: '8. Contact',
    body: `Questions about these terms? Email us at hello@uleeb.com — we read every message.`,
  },
];

export default function Terms() {
  return (
    <div style={styles.page}>
      <div style={styles.inner}>

        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadLink}>uleeb</Link>
          <span style={styles.breadSep}>/</span>
          <span style={styles.breadCurrent}>Terms of Service</span>
        </div>

        <div style={styles.hero}>
          <div style={styles.heroTag}>Legal</div>
          <h1 className="display" style={styles.heroTitle}>Terms of Service</h1>
          <p style={styles.heroSub}>
            Last updated: <strong>26 October 2026</strong>
          </p>
          <p style={styles.heroCopy}>
            These terms govern your use of uleeb. We have written them in plain language on purpose — legal jargon helps nobody. As uleeb grows, these terms will grow with it. We will always be upfront about what changes and when.
          </p>
        </div>

        <div style={styles.sections}>
          {SECTIONS.map((s) => (
            <div key={s.title} style={styles.section}>
              <h2 style={styles.sectionTitle}>{s.title}</h2>
              <p style={styles.sectionBody}>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <Link to="/privacy" style={styles.footLink}>Privacy Policy</Link>
          <span style={styles.breadSep}>·</span>
          <Link to="/" style={styles.footLink}>Back to uleeb</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100dvh', background: '#EEF6FF', padding: '48px 24px 80px' },
  inner: { maxWidth: 760, margin: '0 auto' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, fontSize: 13.5, fontWeight: 600 },
  breadLink: { color: '#2563EB', textDecoration: 'none' },
  breadSep: { color: '#CBD5E1' },
  breadCurrent: { color: '#94A3B8' },
  hero: { background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: 28, padding: '48px 40px', marginBottom: 40 },
  heroTag: { display: 'inline-block', background: '#F4C8DC', color: '#0F172A', fontSize: 11.5, fontWeight: 700, padding: '5px 14px', borderRadius: 999, letterSpacing: 0.4, marginBottom: 20 },
  heroTitle: { fontWeight: 700, fontSize: 'clamp(28px, 5vw, 42px)', color: '#FFFFFF', lineHeight: 1.1, marginBottom: 12 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 20 },
  heroCopy: { fontSize: 15.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, maxWidth: 580 },
  sections: { display: 'flex', flexDirection: 'column', gap: 4 },
  section: { background: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: 20, padding: '28px 28px' },
  sectionTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 12 },
  sectionBody: { fontSize: 14.5, color: '#475569', lineHeight: 1.8 },
  footer: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 36, justifyContent: 'center' },
  footLink: { color: '#2563EB', fontSize: 14, fontWeight: 600, textDecoration: 'none' },
};
