import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, postAuthRoute } from '../context/AuthContext';
import { ChevronLeftIcon } from '../components/icons';
import '../styles/auth.css';

const RESEND_COOLDOWN = 60;

export default function LoginPhone() {
  const { isSigningIn, pendingEmail, requestEmailCode, verifyEmailCode, cancelEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const step = pendingEmail ? 'code' : 'email';
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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
    if (!emailValid) return;
    setError(null);
    try {
      await requestEmailCode(email.trim().toLowerCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send a code. Please try again.');
    }
  }

  async function handleResend() {
    if (cooldown > 0 || isSigningIn || !pendingEmail) return;
    setCode('');
    setError(null);
    try {
      await requestEmailCode(pendingEmail);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code. Please try again.');
    }
  }

  async function handleVerify() {
    setError(null);
    const authUser = await verifyEmailCode(code.trim());
    if (authUser) {
      navigate(postAuthRoute(authUser), { replace: true });
    } else {
      setError("That code didn't work. Try again.");
    }
  }

  function back() {
    if (step === 'code') {
      cancelEmailVerification();
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="auth-screen">
      <button className="auth-back-btn" onClick={back} aria-label="Back">
        <ChevronLeftIcon size={15} />
      </button>

      {step === 'email' ? (
        <div className="auth-body" style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
          <h1 className="auth-title" style={{ marginBottom: 10, textAlign: 'left', width: '100%' }}>Continue with email</h1>
          <p className="auth-subtitle">We'll send you a code to verify your email.</p>

          <div className="auth-field">
            <label className="auth-label">Email address</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="you@example.com"
              inputMode="email"
              autoCapitalize="none"
              autoFocus
            />
          </div>
          {error && <p className="auth-error">{error}</p>}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 8 }}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: '#0F172A', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
              I agree to uleeb's{' '}
              <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#0F172A', fontWeight: 700, textDecoration: 'underline' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#0F172A', fontWeight: 700, textDecoration: 'underline' }}>Privacy Policy</Link>
            </span>
          </label>
        </div>
      ) : (
        <div className="auth-body" style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
          <h1 className="auth-title" style={{ marginBottom: 10, textAlign: 'left', width: '100%' }}>Enter the code</h1>
          <p className="auth-subtitle">We sent a 6-digit code to <strong>{pendingEmail}</strong>.</p>

          <div className="auth-field">
            <label className="auth-label">Verification code</label>
            <input
              className="auth-input auth-code-input"
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(null); }}
              placeholder="000000"
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
        {step === 'email' ? (
          <button
            onClick={handleSendCode}
            disabled={!emailValid || !termsAccepted || isSigningIn}
            style={{
              height: 54, borderRadius: 999,
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 600, cursor: (!emailValid || !termsAccepted || isSigningIn) ? 'default' : 'pointer',
              opacity: (!emailValid || !termsAccepted || isSigningIn) ? 0.4 : 1,
              boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
            }}
          >
            {isSigningIn ? 'Sending…' : 'Send code'}
          </button>
        ) : (
          <button
            onClick={handleVerify}
            disabled={code.length < 6 || isSigningIn}
            style={{
              height: 54, borderRadius: 999,
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 600, cursor: (code.length < 6 || isSigningIn) ? 'default' : 'pointer',
              opacity: (code.length < 6 || isSigningIn) ? 0.4 : 1,
              boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
            }}
          >
            {isSigningIn ? 'Verifying…' : 'Verify'}
          </button>
        )}
      </div>
    </div>
  );
}
