import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, postAuthRoute } from '../context/AuthContext';
import { PhoneInput, isPhoneInputValid, phoneInputToE164 } from '../components/PhoneInput';
import { ChevronLeftIcon } from '../components/icons';
import '../styles/auth.css';

const RESEND_COOLDOWN = 60;

// Mirrors uleeb mobile's app/login-phone.tsx — same two-step flow
// (enter phone -> enter code), same OTP resend cooldown, same
// create-account-if-new backend behavior.
export default function LoginPhone() {
  const { isSigningIn, pendingPhone, requestPhoneCode, verifyPhoneCode, cancelPhoneVerification } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  const step = pendingPhone ? 'code' : 'phone';
  const phoneValid = isPhoneInputValid(phone);

  useEffect(() => {
    if (step !== 'code') return;
    setCooldown(RESEND_COOLDOWN);
  }, [step]);

  useEffect(() => {
    if (step !== 'code' || cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [step, cooldown]);

  async function handleSendCode() {
    if (!phoneValid) return;
    setError(null);
    try {
      await requestPhoneCode(phoneInputToE164(phone));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send a code. Please try again.');
    }
  }

  async function handleResend() {
    if (cooldown > 0 || isSigningIn || !pendingPhone) return;
    setCode('');
    setError(null);
    try {
      await requestPhoneCode(pendingPhone);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code. Please try again.');
    }
  }

  async function handleVerify() {
    setError(null);
    const authUser = await verifyPhoneCode(code.trim());
    if (authUser) {
      navigate(postAuthRoute(authUser), { replace: true });
    } else {
      setError("That code didn't work. Try again.");
    }
  }

  function back() {
    if (step === 'code') {
      cancelPhoneVerification();
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="auth-screen">
      <button className="auth-back-btn" onClick={back} aria-label="Back">
        <ChevronLeftIcon size={15} />
      </button>

      {step === 'phone' ? (
        <div className="auth-body" style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
          <h1 className="auth-title" style={{ marginBottom: 10, textAlign: 'left', width: '100%' }}>Continue with phone</h1>
          <p className="auth-subtitle">We'll text you a code to verify your number.</p>

          <div className="auth-field">
            <label className="auth-label">Phone number</label>
            <PhoneInput value={phone} onChangeValue={(v) => { setPhone(v); setError(null); }} autoFocus />
          </div>
          {error && <p className="auth-error">{error}</p>}
        </div>
      ) : (
        <div className="auth-body" style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
          <h1 className="auth-title" style={{ marginBottom: 10, textAlign: 'left', width: '100%' }}>Enter the code</h1>
          <p className="auth-subtitle">We sent a code to {pendingPhone}.</p>

          <div className="auth-field">
            <label className="auth-label">Verification code</label>
            <input
              className="auth-input auth-code-input"
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(null); }}
              placeholder="0000"
              inputMode="numeric"
              maxLength={6}
              autoFocus
            />
          </div>
          {error && <p className="auth-error">{error}</p>}

          <div className="auth-resend" style={{ width: '100%' }}>
            {cooldown > 0 ? (
              <span className="auth-resend-muted">Resend code in {cooldown}s</span>
            ) : (
              <button className="auth-resend-link" onClick={handleResend} disabled={isSigningIn}>
                Resend code
              </button>
            )}
          </div>
        </div>
      )}

      <div className="auth-footer">
        {step === 'phone' ? (
          <button
            onClick={handleSendCode}
            disabled={!phoneValid || isSigningIn}
            style={{
              height: 54, borderRadius: 999, background: 'var(--ink)', color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 600, cursor: (!phoneValid || isSigningIn) ? 'default' : 'pointer',
              opacity: (!phoneValid || isSigningIn) ? 0.4 : 1,
            }}
          >
            {isSigningIn ? 'Sending…' : 'Send code'}
          </button>
        ) : (
          <button
            onClick={handleVerify}
            disabled={code.length < 4 || isSigningIn}
            style={{
              height: 54, borderRadius: 999, background: 'var(--ink)', color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 600, cursor: (code.length < 4 || isSigningIn) ? 'default' : 'pointer',
              opacity: (code.length < 4 || isSigningIn) ? 0.4 : 1,
            }}
          >
            {isSigningIn ? 'Verifying…' : 'Verify'}
          </button>
        )}
      </div>
    </div>
  );
}
