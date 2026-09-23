import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhoneIcon, ChevronLeftIcon } from '../components/icons';
import '../styles/auth.css';

// Mirrors uleeb mobile's app/login.tsx exactly, as of the "phone-only,
// no email delivery wired up yet" state — a single 'Continue with
// phone' entry point that handles both sign-up and sign-in.
export default function Login() {
  const { isSigningIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="auth-screen">
      <button className="auth-back-btn" onClick={() => navigate('/')} aria-label="Back">
        <ChevronLeftIcon size={15} />
      </button>

      <div className="auth-body">
        <div className="auth-mark"><span>U</span></div>
        <h1 className="auth-title">Welcome to ULEEB</h1>
      </div>

      <div className="auth-footer">
        <button
          className="onb-option"
          style={{
            height: 54, borderRadius: 999, background: 'var(--ink)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontSize: 15, fontWeight: 600, border: 'none', cursor: isSigningIn ? 'default' : 'pointer',
            opacity: isSigningIn ? 0.7 : 1,
          }}
          disabled={isSigningIn}
          onClick={() => navigate('/login-phone')}
        >
          <PhoneIcon size={16} color="#fff" />
          Continue with phone
        </button>

        <p className="auth-fineprint">
          By continuing you agree to ULEEB's Terms and acknowledge the Privacy Policy.
        </p>
        <p className="auth-poweredby">Powered by Twedot</p>
      </div>
    </div>
  );
}
