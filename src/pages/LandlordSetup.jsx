import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, postAuthRoute } from '../context/AuthContext';
import { PhoneInput, isPhoneInputValid, phoneInputToE164 } from '../components/PhoneInput';
import { ChevronLeftIcon } from '../components/icons';
import { Chip, Label } from '../components/ui';
import '../styles/auth.css';

const LANDLORD_TYPES = ['Individual landlord', 'Property agent', 'Property management company'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors uleeb mobile's app/landlord-setup.tsx.
export default function LandlordSetup() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const STEPS = ['name', ...(user?.phone ? [] : ['phone']), ...(user?.email ? [] : ['email']), 'occupation'];

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name && user.name !== 'You' ? user.name : '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [landlordType, setLandlordType] = useState(user?.landlordType ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentStep = STEPS[step];
  const canContinue =
    (currentStep === 'name' && name.trim().length > 1) ||
    (currentStep === 'phone' && isPhoneInputValid(phone)) ||
    (currentStep === 'email' && EMAIL_RE.test(email.trim())) ||
    (currentStep === 'occupation' && !!landlordType);

  const firstName = (name.trim().split(' ')[0] || user?.name?.split(' ')[0]) ?? 'You';
  const initials = firstName.charAt(0).toUpperCase();

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
        landlordType: landlordType ?? undefined,
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
            height: 54, width: '100%', borderRadius: 999, border: 'none', background: 'var(--ink)', color: '#fff',
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
