import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, postAuthRoute } from '../context/AuthContext';
import { PhoneInput, isPhoneInputValid, phoneInputToE164 } from '../components/PhoneInput';
import { ChevronLeftIcon, PinIcon } from '../components/icons';
import { Chip, Label } from '../components/ui';
import { StateSelect } from '../components/StateSelect';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { normalizeState } from '../lib/nigeria';
import { detectLocation } from '../lib/geocode';
import '../styles/auth.css';

const OCCUPATIONS = ['Employed', 'Self-employed', 'Student', 'Remote worker'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROFILE_SETUP_KEY = 'uleeb:profile_setup';
function readProfileSaved() {
  try { return JSON.parse(sessionStorage.getItem(PROFILE_SETUP_KEY) || '{}'); } catch { return {}; }
}

// Mirrors uleeb mobile's app/profile-setup.tsx — same step sequence
// (name -> phone/email if missing -> occupation -> budget -> state),
// same "only ask for whichever contact info you don't already have"
// logic. Location auto-detect is mobile-only (no browser geocoding
// wired up here) — the manual state picker covers it.
export default function ProfileSetup() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Frozen at mount — user.phone being set mid-flow must not collapse the array
  const STEPS = useRef(
    ['name', ...(user?.phone ? [] : ['phone']), ...(user?.email ? [] : ['email']), 'occupation', 'budget', 'state']
  ).current;

  const saved = useRef(readProfileSaved());
  const [step, setStep] = useState(saved.current.step ?? 0);
  const [name, setName] = useState(saved.current.name ?? (user?.name && user.name !== 'You' ? user.name : ''));
  const [phone, setPhone] = useState(saved.current.phone ?? '');
  const [email, setEmail] = useState(saved.current.email ?? '');
  const [emailTaken, setEmailTaken] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [occupation, setOccupation] = useState(saved.current.occupation ?? null);
  const [budget, setBudget] = useState(saved.current.budget ?? '2400000');
  const [period, setPeriod] = useState(saved.current.period ?? 'year');
  const [state, setState] = useState(saved.current.state ?? null);
  const [locationAddress, setLocationAddress] = useState(saved.current.locationAddress ?? '');
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try { sessionStorage.setItem(PROFILE_SETUP_KEY, JSON.stringify({ step, name, phone, email, occupation, budget, period, state, locationAddress })); } catch {}
  }, [step, name, phone, email, occupation, budget, period, state, locationAddress]);

  async function handleDetectLocation() {
    setDetecting(true);
    setDetectError(null);
    try {
      const result = await detectLocation();
      setLocationAddress(result.address);
      if (result.rawState) {
        const normalized = normalizeState(result.rawState);
        if (normalized) setState(normalized);
      }
    } catch (e) {
      setDetectError(e.message);
    } finally {
      setDetecting(false);
    }
  }

  const currentStep = STEPS[step];
  const canContinue =
    (currentStep === 'name' && name.trim().length > 1) ||
    (currentStep === 'phone' && isPhoneInputValid(phone)) ||
    (currentStep === 'email' && EMAIL_RE.test(email.trim()) && !emailTaken && !emailChecking) ||
    (currentStep === 'occupation' && !!occupation) ||
    (currentStep === 'budget' && budget.length > 0) ||
    (currentStep === 'state' && !!state);

  const firstName = (name.trim().split(' ')[0] || user?.name?.split(' ')[0]) ?? 'You';
  const initials = firstName.charAt(0).toUpperCase();
  const budgetLabel = budget ? `₦${Number(budget).toLocaleString()}` : 'Budget —';

  async function next() {
    if (!canContinue || saving) return;

    // Save phone eagerly on the phone step — error shows here, not on the final step.
    if (currentStep === 'phone' && !user?.phone) {
      setSaving(true);
      setError(null);
      try {
        await updateProfile({ phone: phoneInputToE164(phone) });
        setStep(step + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Please try again.');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (currentStep === 'email' && !user?.email) {
      setEmailChecking(true);
      try {
        const res = await fetch(`https://uleebapi.twedot.com/auth/check-email?email=${encodeURIComponent(email.trim())}`);
        const data = await res.json().catch(() => ({}));
        if (data.available === false) {
          setEmailTaken(true);
          return;
        }
      } catch {
        // network issue — allow proceeding, backend will catch it on submit
      } finally {
        setEmailChecking(false);
      }
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Phone already saved on the phone step — skip it here.
      await updateProfile({
        name: name.trim() || user?.name || 'You',
        email: !user?.email ? email.trim() || undefined : undefined,
        occupation: occupation ?? undefined,
        budget: budget || undefined,
        state: state ?? undefined,
        country: 'Nigeria',
      });
      try { sessionStorage.removeItem(PROFILE_SETUP_KEY); } catch {}
      navigate(postAuthRoute(user), { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Please try again.';
      if (msg.toLowerCase().includes('email')) {
        const emailStep = STEPS.indexOf('email');
        if (emailStep !== -1) { setStep(emailStep); setEmailTaken(true); }
      } else {
        setError(msg);
      }
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
            <PhoneInput value={phone} onChangeValue={(v) => { setPhone(v); setError(null); }} autoFocus />
          </>
        )}

        {currentStep === 'email' && (
          <>
            <h2 className="onb-q-title">What's your email?</h2>
            <p className="onb-q-sub">Used for payment receipts and account recovery.</p>
            <input className="auth-input" value={email} onChange={(e) => { setEmail(e.target.value); setEmailTaken(false); }} placeholder="you@example.com" type="email" autoFocus />
            {emailChecking && <p style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 6 }}>Checking…</p>}
            {emailTaken && <p style={{ fontSize: 12.5, color: '#C8402A', marginTop: 6 }}>This email is already linked to another account.</p>}
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
            <p className="onb-q-sub">We'll show you homes in your area first. You can change this anytime.</p>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detecting}
              style={detectBtnStyle}
            >
              <PinIcon size={15} color={detecting ? '#94A3B8' : '#0F172A'} />
              <span>{detecting ? 'Detecting your location…' : 'Use my current location'}</span>
            </button>

            {detectError && (
              <p style={{ fontSize: 12.5, color: '#C8402A', marginTop: 6, lineHeight: '17px' }}>{detectError}</p>
            )}

            {state && (
              <div style={detectedStateStyle}>
                <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 700 }}>📍 {state} detected</span>
                <button type="button" style={changeStateBtn} onClick={() => { setState(null); setLocationAddress(''); }}>
                  Change
                </button>
              </div>
            )}

            <div style={{ margin: '16px 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#94A3B8' }}>
              Or search by area / city
            </div>
            <LocationAutocomplete
              value={locationAddress}
              placeholder="e.g. Lekki, Victoria Island…"
              onChange={({ address, rawState }) => {
                setLocationAddress(address);
                if (rawState) {
                  const normalized = normalizeState(rawState);
                  if (normalized) setState(normalized);
                }
              }}
            />

            <div style={{ margin: '16px 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#94A3B8' }}>
              Or pick your state
            </div>
            <StateSelect value={state} onChange={setState} />
          </>
        )}
        {error && <p className="auth-error" style={{ marginTop: 16 }}>{error}</p>}
      </div>

      <div className="onb-footer">
        <button
          onClick={next}
          disabled={!canContinue || saving}
          style={{
            height: 54, width: '100%', borderRadius: 999, border: 'none',
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff',
            boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
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

const detectBtnStyle = {
  width: '100%', height: 50, borderRadius: 16, border: '1.5px solid #BFDBFE',
  background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#0F172A',
  fontFamily: 'inherit', transition: 'background 0.15s',
};

const detectedStateStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: '#EEF6FF', border: '1px solid #BFDBFE', borderRadius: 14,
  padding: '10px 14px', marginTop: 8,
};

const changeStateBtn = {
  background: 'none', border: 'none', fontSize: 12.5, fontWeight: 700,
  color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit',
};
