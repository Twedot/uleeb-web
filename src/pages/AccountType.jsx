import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { useAuth, postAuthRoute, isRoleVerified } from '../context/AuthContext';
import { HomeIcon, KeyIcon } from '../components/icons';
import '../styles/auth.css';

// key = internal selection identifier, role = backend role value
// 'agent' maps to 'landlord' — agents list and manage properties the same way
const OPTIONS = [
  { key: 'tenant',   role: 'tenant',   title: 'Tenant',   sub: 'Swipe on homes and request the ones you like', Icon: HomeIcon },
  { key: 'landlord', role: 'landlord', title: 'Landlord', sub: 'List a property and review interested tenants', Icon: KeyIcon },
  { key: 'agent',    role: 'landlord', title: 'Agent',    sub: 'List properties on behalf of owners and manage viewings', Icon: KeyIcon },
];

// Mirrors uleeb mobile's app/account-type.tsx, including the free-plan
// gate on switching between tenant/landlord added alongside the
// backend fix — checked here, before setRole runs, so a free-plan
// user is told upfront instead of filling out the whole setup form.
export default function AccountType() {
  const { user, setRole } = useAuth();
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const isSwitching = !!user?.role;
  const [selected, setSelected] = useState(user?.role ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const selectedOption = OPTIONS.find((o) => o.key === selected) ?? OPTIONS.find((o) => o.role === selected);

  async function handleContinue() {
    if (!selectedOption) return;
    setError(null);

    const targetRole = selectedOption.role;

    if (targetRole === user?.role) {
      goBack();
      return;
    }

    if (isSwitching && (user?.plan ?? 'free') === 'free') {
      setError(`Your account is currently set up as a ${user?.role}. Switching to ${targetRole} is a Plus/Pro feature — upgrade to switch.`);
      return;
    }

    setSaving(true);
    try {
      const updated = await setRole(targetRole);
      if (isRoleVerified(updated, targetRole)) {
        navigate(postAuthRoute(updated), { replace: true });
      } else {
        navigate(targetRole === 'tenant' ? '/profile-setup' : '/landlord-setup', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="onb-screen">
      <div className="onb-header" style={{ paddingTop: 40 }}>
        <h1 className="onb-q-title" style={{ marginBottom: 8 }}>
          {isSwitching ? 'Switch account type' : 'What are you joining as?'}
        </h1>
        <p className="onb-q-sub">
          {isSwitching
            ? "If you've set this up before, you'll go straight in — otherwise a quick one-time profile."
            : 'You can switch this later from your profile.'}
        </p>
      </div>

      <div className="onb-question" style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {OPTIONS.map((opt) => {
          const active = selected === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => { setSelected(opt.key); setError(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 24,
                border: `1.5px solid ${active ? '#0F172A' : 'var(--border)'}`, background: '#fff',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 999, flexShrink: 0,
                background: active ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' : 'var(--bg-alt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <opt.Icon size={22} color={active ? '#fff' : 'var(--text)'} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, color: 'var(--text)', marginBottom: 3, fontWeight: 700 }}>
                  {opt.title}
                </p>
                <p style={{ fontSize: 12.5, color: 'var(--text-faint)', lineHeight: 1.4 }}>{opt.sub}</p>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 999, border: `1.5px solid ${active ? '#0F172A' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {active && <div style={{ width: 11, height: 11, borderRadius: 999, background: '#0F172A' }} />}
              </div>
            </button>
          );
        })}
        {error && (
          <div>
            <p className="auth-error">{error}</p>
            {error.includes('Plus/Pro') && (
              <button
                type="button"
                onClick={() => navigate('/plans')}
                style={{ marginTop: 8, height: 44, width: '100%', borderRadius: 999, border: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                Upgrade to switch
              </button>
            )}
          </div>
        )}
      </div>

      <div className="onb-footer">
        <button
          onClick={handleContinue}
          disabled={!selectedOption || saving}
          style={{
            height: 54, width: '100%', borderRadius: 999, border: 'none',
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#fff',
            boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
            fontSize: 15, fontWeight: 600, cursor: (!selectedOption || saving) ? 'default' : 'pointer',
            opacity: (!selectedOption || saving) ? 0.4 : 1,
          }}
        >
          {saving ? 'Saving...' : selectedOption && selectedOption.role !== user?.role ? 'Switch' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
