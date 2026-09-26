import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon, CheckIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/plans.tsx — same tiers/copy/
// pricing, same role-branched feature lists. Paystack checkout is a full-
// page redirect here instead of an in-app browser sheet; verifyUpgrade
// runs automatically on return (see the ?reference= handling below).
const PRICE_NAIRA = { plus: 3500, pro: 4300 };
const MONTH_OPTIONS = [1, 3, 6, 12];

const TENANT_TIERS = [
  {
    plan: 'free', title: 'Free', price: '₦0',
    features: [
      '15 swipes per day', 'Filter by one state at a time', 'No bookmarking',
      'Call or WhatsApp only — no in-app chat', 'Schedule or reschedule inspections',
      'Profile can be changed once every 15 days',
    ],
  },
  {
    plan: 'plus', title: 'Plus', price: '₦3,500/mo',
    features: [
      'Unlimited swipes', 'Filter by multiple states', 'Revisit and bookmark properties',
      'Search your own country only', 'Call or WhatsApp only — no in-app chat', 'Change your profile anytime',
    ],
  },
  {
    plan: 'pro', title: 'Pro', price: '₦4,300/mo',
    features: ['Everything in Plus', 'Search any country', 'Full in-app chat with the other party'],
  },
];

const LANDLORD_TIERS = [
  { plan: 'free', title: 'Free', price: '₦0', features: ['List 1 property', 'Profile can be changed once every 15 days'] },
  { plan: 'plus', title: 'Plus', price: '₦3,500/mo', features: ['Unlimited property listings', 'Change your profile anytime'] },
  { plan: 'pro', title: 'Pro', price: '₦4,300/mo', features: ['List up to 5 properties', 'Change your profile anytime'] },
];

export default function Plans() {
  const { user, initiateUpgrade, verifyUpgrade } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [working, setWorking] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [months, setMonths] = useState({});
  const currentPlan = user?.plan ?? 'free';
  const tiers = user?.role === 'landlord' ? LANDLORD_TIERS : TENANT_TIERS;

  // Paystack redirected back here — finish the upgrade and clean the URL.
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) return;
    setVerifying(true);
    verifyUpgrade(reference)
      .catch(() => window.alert('Could not confirm your payment — if you were charged, contact support.'))
      .finally(() => {
        setVerifying(false);
        setSearchParams({}, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(plan) {
    if (plan === currentPlan) return;
    setWorking(plan);
    try {
      await initiateUpgrade(plan, months[plan] ?? 1);
      // Page navigates away to Paystack on success — nothing else to do here.
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not start checkout — please try again.');
      setWorking(null);
    }
  }

  return (
    <div style={styles.screen}>
      <button type="button" onClick={() => navigate(-1)} style={styles.backLink}>
        <ChevronLeftIcon size={14} color="#5B5750" /> Back
      </button>
      <h1 style={styles.title}>Plans</h1>
      <p style={styles.subtitle}>Upgrade anytime — takes effect as soon as payment is confirmed.</p>

      {verifying && <p style={styles.verifyingNote}>Confirming your payment…</p>}

      <div style={styles.grid}>
        {tiers.map((tier) => {
          const isCurrent = tier.plan === currentPlan;
          const isFree = tier.plan === 'free';
          const selectedMonths = months[tier.plan] ?? 1;
          const price = PRICE_NAIRA[tier.plan];
          const total = price ? price * selectedMonths : 0;

          return (
            <div key={tier.plan} style={{ ...styles.card, ...(isCurrent ? styles.cardActive : null) }}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>{tier.title}</span>
                <span style={styles.cardPrice}>{tier.price}</span>
              </div>
              {tier.features.map((f) => (
                <div key={f} style={styles.featureRow}>
                  <CheckIcon size={13} color="#5B5750" strokeWidth={2.2} />
                  <span style={styles.featureText}>{f}</span>
                </div>
              ))}
              {isCurrent ? (
                <>
                  <div style={{ ...styles.selectBtn, ...styles.selectBtnCurrent }}>Current plan</div>
                  {!isFree && user?.planExpiresAt && (
                    <p style={styles.expiryNote}>
                      Renews or lapses to Free on{' '}
                      {new Date(user.planExpiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' — paying again here extends it further.'}
                    </p>
                  )}
                </>
              ) : isFree ? (
                <p style={styles.freeNote}>Your account starts here — no switching back once upgraded.</p>
              ) : (
                <>
                  <div style={styles.monthsRow}>
                    {MONTH_OPTIONS.map((m) => {
                      const active = selectedMonths === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMonths((prev) => ({ ...prev, [tier.plan]: m }))}
                          style={{ ...styles.monthChip, ...(active ? styles.monthChipActive : null) }}
                        >
                          {m === 1 ? '1 month' : `${m} months`}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelect(tier.plan)}
                    disabled={working !== null}
                    style={{ ...styles.selectBtn, ...(working !== null ? { opacity: 0.5 } : null) }}
                  >
                    {working === tier.plan ? 'Redirecting…' : `Pay ₦${total.toLocaleString()} & switch to ${tier.title}`}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p style={styles.fineprint}>Paid plans are billed via Paystack.</p>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 900, margin: '0 auto', padding: '24px 24px 48px' },
  backLink: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#5B5750',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: 16,
  },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#181614' },
  subtitle: { fontSize: 13.5, color: '#5B5750', marginTop: 6, marginBottom: 24, lineHeight: '20px' },
  verifyingNote: { fontSize: 13, color: '#2F8F55', fontWeight: 600, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 },
  card: { background: '#FFFFFF', border: '1.5px solid #EFEDE6', borderRadius: 24, padding: 18 },
  cardActive: { borderColor: '#131110' },
  cardHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: '#181614' },
  cardPrice: { fontSize: 13.5, fontWeight: 600, color: '#9B968C' },
  featureRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  featureText: { fontSize: 13, color: '#5B5750' },
  monthsRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 },
  monthChip: {
    padding: '9px 4px', borderRadius: 999, border: '1px solid #E6E3DB',
    background: '#F0EFE9', fontSize: 12.5, fontWeight: 600, color: '#181614', cursor: 'pointer',
  },
  monthChipActive: { background: '#131110', borderColor: '#131110', color: '#FFFFFF' },
  selectBtn: {
    width: '100%', height: 46, borderRadius: 999, background: '#131110', border: 'none',
    color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 10,
  },
  selectBtnCurrent: { background: '#F0EFE9', color: '#9B968C' },
  freeNote: { fontSize: 12, color: '#9B968C', textAlign: 'center', marginTop: 10, lineHeight: '17px' },
  expiryNote: { fontSize: 11.5, color: '#9B968C', textAlign: 'center', marginTop: 8, lineHeight: '16px' },
  fineprint: { fontSize: 11.5, color: '#9B968C', textAlign: 'center', marginTop: 24 },
};
