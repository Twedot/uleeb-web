import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { useAuth, postAuthRoute } from '../context/AuthContext';
import { PhoneInput, isPhoneInputValid, phoneInputToE164 } from '../components/PhoneInput';
import { ChevronLeftIcon } from '../components/icons';
import { Chip, Label } from '../components/ui';
import '../styles/auth.css';

const LANDLORD_TYPES = ['Individual landlord', 'Property agent', 'Property management company'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LANDLORD_SETUP_KEY = 'uleeb:landlord_setup';
function readLandlordSaved() {
  try { return JSON.parse(sessionStorage.getItem(LANDLORD_SETUP_KEY) || '{}'); } catch { return {}; }
}

// Mirrors uleeb mobile's app/landlord-setup.tsx.
export default function LandlordSetup() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const goBack = useGoBack('/');

  // Frozen at mount — user.phone being set mid-flow must not collapse the array
  const STEPS = useRef(
    ['name', ...(user?.phone ? [] : ['phone']), ...(user?.email ? [] : ['email']), 'occupation']
  ).current;

  const saved = useRef(readLandlordSaved());
  const [step, setStep] = useState(saved.current.step ?? 0);
  const [name, setName] = useState(saved.current.name ?? (user?.name && user.name !== 'You' ? user.name : ''));
  const [phone, setPhone] = useState(saved.current.phone ?? '');
  const [email, setEmail] = useState(saved.current.email ?? '');
  const [emailTaken, setEmailTaken] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [landlordType, setLandlordType] = useState(saved.current.landlordType ?? user?.landlordType ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try { sessionStorage.setItem(LANDLORD_SETUP_KEY, JSON.stringify({ step, name, phone, email, landlordType })); } catch {}
  }, [step, name, phone, email, landlordType]);

  const currentStep = STEPS[step];
  const canContinue =
    (currentStep === 'name' && name.trim().length > 1) ||
    (currentStep === 'phone' && isPhoneInputValid(phone)) ||
    (currentStep === 'email' && EMAIL_RE.test(email.trim()) && !emailTaken && !emailChecking) ||
    (currentStep === 'occupation' && !!landlordType);

  const firstName = (name.trim().split(' ')[0] || user?.name?.split(' ')[0]) ?? 'You';
  const initials = firstName.charAt(0).toUpperCase();

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

    // Final step — phone already saved above, skip it here.
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim() || user?.name || 'You',
        email: !user?.email ? email.trim() || undefined : undefined,
        landlordType: landlordType ?? undefined,
      });
      try { sessionStorage.removeItem(LANDLORD_SETUP_KEY); } catch {}
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
    else goBack();
  }

  return (
    <div className="onb-screen">
      <div className="onb-header">
        <div className="onb-header-top">
          <button className="auth-back-btn" style={{ margin: 0 }} onClick={back} aria-label="Back">
            <ChevronLeftIcon size={16} />
          </button>
          <Label>Step {step + 1} of {STEPS.length}</Label>
          <div style={{ width: 36 }} />
        </div>
        <div className="onb-progress-row">
          {STEPS.map((s, i) => (
            <div key={s} className={`onb-progress-bar ${i <= step ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      <div className="onb-preview">
        <Label style={{ marginBottom: 10, display: 'block' }}>Your landlord profile</Label>
        <div className="onb-preview-card">
          <div className="onb-avatar"><span>{initials}</span></div>
          <div style={{ flex: 1 }}>
            <p className="onb-preview-name">{firstName}</p>
            <div className="onb-preview-chips">
              <Chip>{landlordType ?? 'Type —'}</Chip>
            </div>
          </div>
        </div>
      </div>

      <div className="onb-question">
        {currentStep === 'name' && (
          <>
            <h2 className="onb-q-title">What's your name?</h2>
            <p className="onb-q-sub">This is how tenants will see you once you accept a request.</p>
            <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoFocus />
          </>
        )}

        {currentStep === 'phone' && (
          <>
            <h2 className="onb-q-title">What's your phone number?</h2>
            <p className="onb-q-sub">Lets a tenant reach you by WhatsApp or call once you accept their request.</p>
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
            <h2 className="onb-q-title">How do you list properties?</h2>
            <p className="onb-q-sub">Helps tenants know who they're dealing with.</p>
            <div className="onb-options-wrap">
              {LANDLORD_TYPES.map((o) => (
                <button key={o} className={`onb-option ${landlordType === o ? 'active' : ''}`} onClick={() => setLandlordType(o)}>{o}</button>
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
            height: 54, width: '100%', borderRadius: 999, border: 'none',
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff',
            boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
            fontSize: 15, fontWeight: 600, cursor: (!canContinue || saving) ? 'default' : 'pointer',
            opacity: (!canContinue || saving) ? 0.4 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
