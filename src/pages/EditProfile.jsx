import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PhoneInput, phoneInputFromStored, phoneInputToE164 } from '../components/PhoneInput';
import { ChevronLeftIcon } from '../components/icons';

// Web counterpart to uleeb mobile's app/edit-profile.tsx.
const TENANT_OCCUPATIONS = ['Employed', 'Self-employed', 'Student', 'Remote worker'];
const LANDLORD_TYPES = ['Individual landlord', 'Property agent', 'Property management company'];
const NIGERIAN_STATES = ['Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Ogun', 'Kano', 'Enugu', 'Kaduna'];

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const isLandlord = user?.role === 'landlord';

  const [name, setName] = useState(user?.name ?? '');
  const [occupation, setOccupation] = useState(user?.occupation ?? null);
  const [landlordType, setLandlordType] = useState(user?.landlordType ?? null);
  const [state, setState] = useState(user?.state ?? null);
  const [budget, setBudget] = useState(user?.budget ?? '');
  const [phone, setPhone] = useState(phoneInputFromStored(user?.phone));
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 1;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        occupation: !isLandlord ? occupation ?? undefined : undefined,
        landlordType: isLandlord ? landlordType ?? undefined : undefined,
        state: !isLandlord ? state ?? undefined : undefined,
        budget: !isLandlord ? budget || undefined : undefined,
        phone: phoneInputToE164(phone) || undefined,
        email: email.trim() || undefined,
      });
      navigate(-1);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not save your profile — please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.screen}>
      <button type="button" onClick={() => navigate(-1)} style={styles.backLink}>
        <ChevronLeftIcon size={14} color="#5B5750" /> Back
      </button>
      <h1 style={styles.title}>Edit profile</h1>

      <div style={styles.field}>
        <label style={styles.label}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={styles.input} />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Phone number</label>
        <PhoneInput value={phone} onChangeValue={setPhone} />
        <p style={styles.fieldHint}>
          Lets {isLandlord ? 'tenants' : 'the landlord'} reach you by WhatsApp or call once a request is accepted.
        </p>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          type="email"
          autoCapitalize="none"
          autoCorrect="off"
          style={styles.input}
        />
      </div>

      {isLandlord ? (
        <div style={styles.field}>
          <label style={styles.label}>How you list properties</label>
          <div style={styles.optionsWrap}>
            {LANDLORD_TYPES.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setLandlordType(o)}
                style={{ ...styles.option, ...(landlordType === o ? styles.optionActive : null) }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.field}>
          <label style={styles.label}>Occupation</label>
          <div style={styles.optionsWrap}>
            {TENANT_OCCUPATIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOccupation(o)}
                style={{ ...styles.option, ...(occupation === o ? styles.optionActive : null) }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isLandlord && (
        <div style={styles.field}>
          <label style={styles.label}>Budget (₦ per year)</label>
          <div style={styles.budgetInput}>
            <span style={styles.naira}>₦</span>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              placeholder="0"
              style={styles.budgetField}
            />
          </div>
        </div>
      )}

      {!isLandlord && (
        <div style={styles.field}>
          <label style={styles.label}>State</label>
          <div style={styles.optionsWrap}>
            {NIGERIAN_STATES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setState(s)}
                style={{ ...styles.option, ...(state === s ? styles.optionActive : null) }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <button type="button" onClick={handleSave} disabled={!canSave || saving} style={{ ...styles.saveBtn, ...((!canSave || saving) ? { opacity: 0.5 } : null) }}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}

const styles = {
  screen: { maxWidth: 560, margin: '0 auto', padding: '24px 24px 64px', display: 'flex', flexDirection: 'column', gap: 24 },
  backLink: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#5B5750',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: -8,
  },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: '#181614' },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#9B968C' },
  fieldHint: { fontSize: 11.5, color: '#9B968C', marginTop: 2, lineHeight: '15px' },
  input: {
    height: 50, borderRadius: 14, border: '1px solid #E6E3DB', background: '#FFFFFF',
    padding: '0 16px', fontSize: 14.5, color: '#181614', fontFamily: 'inherit',
  },
  budgetInput: {
    background: '#FFFFFF', border: '1px solid #E6E3DB', borderRadius: 14,
    padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
  },
  naira: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: '#181614' },
  budgetField: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: '#181614', flex: 1, border: 'none', outline: 'none' },
  optionsWrap: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  option: {
    padding: '11px 18px', borderRadius: 999, border: '1px solid #E6E3DB', background: '#FFFFFF',
    fontSize: 13.5, fontWeight: 600, color: '#181614', cursor: 'pointer',
  },
  optionActive: { background: '#131110', borderColor: '#131110', color: '#FFFFFF' },
  saveBtn: {
    height: 50, borderRadius: 999, background: '#131110', border: 'none',
    color: '#FFFFFF', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', marginTop: 8,
  },
};
