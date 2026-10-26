import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeftIcon, CheckIcon } from '../components/icons';

const PRICE_NAIRA = { plus: 2500, pro: 3300 };

const BILLING_OPTIONS = [
  { label: '1 month', months: 1 },
  { label: '3 months', months: 3 },
  { label: '6 months', months: 6 },
  { label: '12 months', months: 12 },
];

const TENANT_TIERS = [
  {
    plan: 'free', title: 'Free',
    tag: 'Free for every user.',
    features: [
      '15 swipes per day',
      'Filter by one state at a time',
      'No bookmarking',
      'Call or WhatsApp only',
      'Profile lock: 15-day cooldown',
    ],
    ctaLabel: 'Get Started Free',
    bg: '#F4C8DC',
  },
  {
    plan: 'plus', title: 'Plus',
    tag: 'Ideal for active home hunters.',
    features: [
      'Unlimited swipes',
      'Multi-state filtering',
      'Bookmark properties',
      'In-country search',
      'Change profile anytime',
    ],
    ctaLabel: 'Get Plus',
    bg: '#C8F23E',
  },
  {
    plan: 'pro', title: 'Pro',
    tag: 'For power users — zero limits.',
    features: [
      'Everything in Plus',
      'Search any country',
      'Full in-app chat with landlords',
    ],
    ctaLabel: 'Get Pro',
    bg: '#F5CC38',
  },
];

const LANDLORD_TIERS = [
  {
    plan: 'free', title: 'Free',
    tag: 'Free for every landlord.',
    features: ['List 1 property', 'Profile lock: 15-day cooldown'],
    ctaLabel: 'Get Started Free',
    bg: '#F4C8DC',
  },
  {
    plan: 'plus', title: 'Plus',
    tag: 'For growing landlords.',
    features: ['List up to 5 properties', 'Change profile anytime'],
    ctaLabel: 'Get Plus',
    bg: '#C8F23E',
  },
  {
    plan: 'pro', title: 'Pro',
    tag: 'No ceilings, no limits.',
    features: ['Unlimited property listings', 'Change profile anytime', 'Priority visibility'],
    ctaLabel: 'Get Pro',
    bg: '#F5CC38',
  },
];

export default function Plans() {
  const { user, initiateUpgrade, verifyUpgrade } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [working, setWorking] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [billingMonths, setBillingMonths] = useState(1);
  const currentPlan = user?.plan ?? 'free';
  const tiers = user?.role === 'landlord' ? LANDLORD_TIERS : TENANT_TIERS;

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
      await initiateUpgrade(plan, billingMonths);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not start checkout — please try again.');
      setWorking(null);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <button type="button" onClick={() => navigate(-1)} style={s.backBtn}>
          <ChevronLeftIcon size={14} color="#94A3B8" />
          <span>Back</span>
        </button>

        <h1 style={s.heading}>Plans</h1>
        <p style={s.sub}>Upgrade anytime — takes effect once payment is confirmed.</p>

        {verifying && <p style={s.verifying}>Confirming your payment…</p>}

        <div style={s.billingRow}>
          {BILLING_OPTIONS.map((opt) => (
            <button
              key={opt.months}
              type="button"
              onClick={() => setBillingMonths(opt.months)}
              style={{ ...s.billingChip, ...(billingMonths === opt.months ? s.billingChipActive : null) }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={s.grid}>
          {tiers.map((tier) => {
            const isCurrent = tier.plan === currentPlan;
            const isFree = tier.plan === 'free';
            const monthlyPrice = PRICE_NAIRA[tier.plan] ?? 0;
            const total = monthlyPrice * billingMonths;

            return (
              <div key={tier.plan} style={{ ...s.card, background: tier.bg }}>
                <p style={s.cardLabel}>{tier.title}</p>

                <p style={s.cardPrice}>
                  {isFree
                    ? 'Free'
                    : `₦${(billingMonths === 1 ? monthlyPrice : total).toLocaleString()}`}
                  {!isFree && (
                    <span style={s.cardPricePer}>
                      {billingMonths === 1 ? '/month' : `/ ${billingMonths} months`}
                    </span>
                  )}
                </p>
                {!isFree && billingMonths > 1 && (
                  <p style={s.cardMonthlyNote}>₦{monthlyPrice.toLocaleString()} / month</p>
                )}

                <p style={s.cardTag}>{tier.tag}</p>

                <div style={s.features}>
                  {tier.features.map((f) => (
                    <div key={f} style={s.featureRow}>
                      <span style={s.checkCircle}>
                        <CheckIcon size={10} color="#FFFFFF" strokeWidth={3} />
                      </span>
                      <span style={s.featureText}>{f}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <div style={s.currentBadge}>Current plan</div>
                ) : isFree ? (
                  <p style={s.freeNote}>Your starting point — always here.</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelect(tier.plan)}
                    disabled={working !== null}
                    style={{ ...s.ctaBtn, ...(working !== null ? { opacity: 0.55, cursor: 'default' } : null) }}
                  >
                    {working === tier.plan
                      ? 'Redirecting…'
                      : `${tier.ctaLabel} · ₦${total.toLocaleString()}`}
                  </button>
                )}

                {isCurrent && !isFree && user?.planExpiresAt && (
                  <p style={s.expiryNote}>
                    Renews or lapses to Free on{' '}
                    {new Date(user.planExpiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}.
                    Paying again extends it further.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p style={s.fineprint}>Paid plans billed via Paystack. Cancel anytime.</p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: 'calc(100dvh - 64px)', padding: '0 0 64px',
  },
  inner: { maxWidth: 960, margin: '0 auto', padding: '36px 24px 0' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
    color: '#475569', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: 32,
  },
  heading: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 40, color: '#0F172A',
    textAlign: 'center', marginBottom: 10, lineHeight: 1.1,
  },
  sub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 28, lineHeight: '20px' },
  verifying: { fontSize: 13, color: '#0F172A', fontWeight: 600, textAlign: 'center', marginBottom: 16 },
  billingRow: {
    display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 40,
  },
  billingChip: {
    padding: '9px 20px', borderRadius: 999, border: '1px solid #BFDBFE',
    background: '#FFFFFF', color: '#64748B', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  billingChipActive: {
    background: '#0F172A', borderColor: '#0F172A', color: '#FFFFFF',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16,
    alignItems: 'start',
  },
  card: {
    borderRadius: 24, padding: '28px 24px 24px', display: 'flex', flexDirection: 'column',
  },
  cardLabel: {
    fontSize: 14, fontWeight: 700, color: '#0F0F0F', marginBottom: 12, letterSpacing: 0.2,
  },
  cardPrice: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 48, color: '#0F0F0F',
    lineHeight: 1, marginBottom: 10, display: 'flex', alignItems: 'baseline', gap: 6,
  },
  cardPricePer: { fontSize: 14, fontWeight: 500, color: '#333333' },
  cardMonthlyNote: { fontSize: 12, color: '#555555', marginBottom: 4, marginTop: -4 },
  cardTag: { fontSize: 13, color: '#333333', marginBottom: 20, lineHeight: '18px' },
  features: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 },
  featureRow: { display: 'flex', alignItems: 'center', gap: 10 },
  checkCircle: {
    width: 20, height: 20, borderRadius: '50%', background: '#0F0F0F',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureText: { fontSize: 13, color: '#1a1a1a', lineHeight: '18px' },
  ctaBtn: {
    width: '100%', height: 48, borderRadius: 999, border: 'none',
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 'auto',
    boxShadow: '0 4px 14px rgba(15,23,42,0.20)',
  },
  currentBadge: {
    width: '100%', height: 48, borderRadius: 999, background: 'rgba(0,0,0,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: '#0F0F0F', marginTop: 'auto',
  },
  freeNote: { fontSize: 12, color: '#555555', textAlign: 'center', marginTop: 'auto', lineHeight: '17px' },
  expiryNote: { fontSize: 11.5, color: '#444444', textAlign: 'center', marginTop: 10, lineHeight: '16px' },
  fineprint: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 36 },
};
