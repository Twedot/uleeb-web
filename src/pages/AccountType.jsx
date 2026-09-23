import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, postAuthRoute, isRoleVerified } from '../context/AuthContext';
import { HomeIcon, KeyIcon } from '../components/icons';
import '../styles/auth.css';

const OPTIONS = [
  { role: 'tenant', title: 'Tenant', sub: 'Swipe on homes and request the ones you like' },
  { role: 'landlord', title: 'Landlord', sub: 'List a property and review interested tenants' },
];

// Mirrors uleeb mobile's app/account-type.tsx, including the free-plan
// gate on switching between tenant/landlord added alongside the
// backend fix — checked here, before setRole runs, so a free-plan
// user is told upfront instead of filling out the whole setup form.
export default function AccountType() {
  const { user, setRole } = useAuth();
  const navigate = useNavigate();
  const isSwitching = !!user?.role;
  const [selected, setSelected] = useState(user?.role ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleContinue() {
    if (!selected) return;
    setError(null);

    if (selected === user?.role) {
      navigate(-1);
      return;
    }

    if (isSwitching && (user?.plan ?? 'free') === 'free') {
      setError(`Your account is currently set up as a ${user?.role}. Switching to ${selected} is a Plus/Pro feature — upgrade to switch.`);
      return;
    }

    setSaving(true);
    try {
      const updated = await setRole(selected);
      if (isRoleVerified(updated, selected)) {
        navigate(postAuthRoute(updated), { replace: true });
      } else {
        navigate(selected === 'tenant' ? '/profile-setup' : '/landlord-setup', { replace: true });
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
          const active = selected === opt.role;
          const Icon = opt.role === 'tenant' ? HomeIcon : KeyIcon;
          return (
            <button
              key={opt.role}
              onClick={() => { setSelected(opt.role); setError(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 24,
                border: `1.5px solid ${active ? 'var(--ink)' : 'var(--border)'}`, background: '#fff',
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 999, flexShrink: 0,
                background: active ? 'var(--ink)' : 'var(--bg-alt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} color={active ? '#fff' : 'var(--text)'} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, color: 'var(--text)', marginBottom: 3, fontWeight: 700 }}>
                  {opt.title}
                </p>
                <p style={{ fontSize: 12.5, color: 'var(--text-faint)', lineHeight: 1.4 }}>{opt.sub}</p>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 999, border: `1.5px solid ${active ? 'var(--ink)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {active && <div style={{ width: 11, height: 11, borderRadius: 999, background: 'var(--ink)' }} />}
              </div>
            </button>
          );
        })}
        {error && <p className="auth-error">{error}</p>}
      </div>

      <div className="onb-footer">
        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          style={{
            height: 54, width: '100%', borderRadius: 999, border: 'none', background: 'var(--ink)', color: '#fff',
            fontSize: 15, fontWeight: 600, cursor: (!selected || saving) ? 'default' : 'pointer',
            opacity: (!selected || saving) ? 0.4 : 1,
          }}
        >
          {saving ? 'Saving...' : selected && selected !== user?.role ? 'Switch' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
