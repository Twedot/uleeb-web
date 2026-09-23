import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, postAuthRoute } from '../context/AuthContext';
import { PhoneInput, isPhoneInputValid, phoneInputToE164 } from '../components/PhoneInput';
import { ChevronLeftIcon } from '../components/icons';
import { Chip, Label } from '../components/ui';
import '../styles/auth.css';

const OCCUPATIONS = ['Employed', 'Self-employed', 'Student', 'Remote worker'];
const NIGERIAN_STATES = ['Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Ogun', 'Kano', 'Enugu', 'Kaduna'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors uleeb mobile's app/profile-setup.tsx — same step sequence
// (name -> phone/email if missing -> occupation -> budget -> state),
// same "only ask for whichever contact info you don't already have"
// logic. Location auto-detect is mobile-only (no browser geocoding
// wired up here) — the manual state picker covers it.
export default function ProfileSetup() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const STEPS = ['name', ...(user?.phone ? [] : ['phone']), ...(user?.email ? [] : ['email']), 'occupation', 'budget', 'state'];

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name && user.name !== 'You' ? user.name : '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState(null);
  const [budget, setBudget] = useState('2400000');
  const [period, setPeriod] = useState('year');
  const [state, setState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentStep = STEPS[step];
  const canContinue =
    (currentStep === 'name' && name.trim().length > 1) ||
    (currentStep === 'phone' && isPhoneInputValid(phone)) ||
    (currentStep === 'email' && EMAIL_RE.test(email.trim())) ||
    (currentStep === 'occupation' && !!occupation) ||
    (currentStep === 'budget' && budget.length > 0) ||
    (currentStep === 'state' && !!state);

  const firstName = (name.trim().split(' ')[0] || user?.name?.split(' ')[0]) ?? 'You';
  const initials = firstName.charAt(0).toUpperCase();
  const budgetLabel = budget ? `₦${Number(budget).toLocaleString()}` : 'Budget —';

  async function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim() || user?.name || 'You',
        phone: !user?.phone ? phoneInputToE164(phone) || undefined : undefined,
        email: !user?.email ? email.trim() || undefined : undefined,
        occupation: occupation ?? undefined,
        budget: budget || undefined,
        state: state ?? undefined,
        country: 'Nigeria',
      });
      navigate(postAuthRoute(user), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
    else navigate(-1);
  }

  return (
    <div className="onb-screen">
      <div className="onb-header">
        <div className="onb-header-top">
          <button className="auth-back-btn" style={{ margin: 0 }} onClick={back} aria-label="Back">
            <ChevronLeftIcon size={16} />
          </button>
          <Label>Step {step + 1} of {STEPS.length}</Label>
          <button className="onb-skip" onClick={() => navigate(postAuthRoute(user), { replace: true })}>Skip</button>
        </div>
        <div className="onb-progress-row">
          {STEPS.map((s, i) => (
            <div key={s} className={`onb-progress-bar ${i <= step ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      <div className="onb-preview">
        <Label style={{ marginBottom: 10, display: 'block' }}>Your profile so far</Label>
        <div className="onb-preview-card">
          <div className="onb-avatar"><span>{initials}</span></div>
          <div style={{ flex: 1 }}>
            <p className="onb-preview-name">{firstName}</p>
            <div className="onb-preview-chips">
              <Chip>{occupation ?? 'Occupation —'}</Chip>
              <Chip>{step >= STEPS.indexOf('budget') ? budgetLabel : 'Budget —'}</Chip>
              <Chip>{state ?? 'State —'}</Chip>
            </div>
          </div>
        </div>
      </div>

      <div className="onb-question">
        {currentStep === 'name' && (
          <>
            <h2 className="onb-q-title">What's your name?</h2>
            <p className="onb-q-sub">This is how landlords will see you on a request.</p>
            <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoFocus />
          </>
        )}

        {currentStep === 'phone' && (
          <>
            <h2 className="onb-q-title">What's your phone number?</h2>
            <p className="onb-q-sub">Lets a landlord reach you by WhatsApp or call once they accept your request.</p>
            <PhoneInput value={phone} onChangeValue={setPhone} autoFocus />
          </>
        )}

        {currentStep === 'email' && (
          <>
            <h2 className="onb-q-title">What's your email?</h2>
            <p className="onb-q-sub">Used for payment receipts and account recovery.</p>
            <input className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoFocus />
          </>
        )}

        {currentStep === 'occupation' && (
          <>
            <h2 className="onb-q-title">What do you do?</h2>
            <p className="onb-q-sub">Helps landlords understand who's asking.</p>
            <div className="onb-options-wrap">
              {OCCUPATIONS.map((o) => (
                <button key={o} className={`onb-option ${occupation === o ? 'active' : ''}`} onClick={() => setOccupation(o)}>{o}</button>
              ))}
            </div>
          </>
        )}

        {currentStep === 'budget' && (
          <>
            <h2 className="onb-q-title">How much home do you want?</h2>
            <p className="onb-q-sub">We'll only show you homes that fit. You can change this anytime.</p>
            <div className="onb-budget-input">
              <span>₦</span>
              <input value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="0" />
            </div>
            <div className="onb-toggle-row">
              <button className={`onb-toggle ${period === 'year' ? 'active' : ''}`} onClick={() => setPeriod('year')}>Per year</button>
              <button className={`onb-toggle ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>Per month</button>
            </div>
          </>
        )}

        {currentStep === 'state' && (
          <>
            <h2 className="onb-q-title">Where do you want to look?</h2>
            <p className="onb-q-sub">You can change this anytime — even if you're browsing from somewhere else.</p>
            <div className="onb-options-wrap">
              {NIGERIAN_STATES.map((s) => (
                <button key={s} className={`onb-option ${state === s ? 'active' : ''}`} onClick={() => setState(s)}>{s}</button>
              ))}
            </div>
          </>
        )}
        {error && <p className="auth-error" style={{ marginTop: 16 }}>{error}</p>}
      </div>

      <div className="onb-footer">
        <button
          onClick={next}
          disabled={!canContinue || saving}
          style={{
            height: 54, width: '100%', borderRadius: 999, border: 'none', background: 'var(--ink)', color: '#fff',
            fontSize: 15, fontWeight: 600, cursor: (!canContinue || saving) ? 'default' : 'pointer',
            opacity: (!canContinue || saving) ? 0.4 : 1,
          }}
        >
          {saving ? 'Saving...' : step === STEPS.length - 1 ? 'Start swiping' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
