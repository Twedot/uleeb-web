import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { useAuth } from '../context/AuthContext';
import { PhoneInput, phoneInputFromStored, phoneInputToE164 } from '../components/PhoneInput';
import { ChevronLeftIcon, PinIcon } from '../components/icons';
import { StateSelect } from '../components/StateSelect';
import { normalizeState } from '../lib/nigeria';
import { detectLocation } from '../lib/geocode';

// Web counterpart to uleeb mobile's app/edit-profile.tsx.
const TENANT_OCCUPATIONS = ['Employed', 'Self-employed', 'Student', 'Remote worker'];
const LANDLORD_TYPES = ['Individual landlord', 'Property agent', 'Property management company'];

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const isLandlord = user?.role === 'landlord';

  const [name, setName] = useState(user?.name ?? '');
  const [occupation, setOccupation] = useState(user?.occupation ?? null);
  const [landlordType, setLandlordType] = useState(user?.landlordType ?? null);
  const [state, setState] = useState(user?.state ?? null);
  const [budget, setBudget] = useState(user?.budget ?? '');
  const [phone, setPhone] = useState(phoneInputFromStored(user?.phone));
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState(null);

  const canSave = name.trim().length > 1;

  async function handleDetectLocation() {
    setDetecting(true);
    setDetectError(null);
    try {
      const result = await detectLocation();
      if (result.rawState) {
        const normalized = normalizeState(result.rawState);
        if (normalized) setState(normalized);
        else setDetectError('Could not identify your state — please pick it manually.');
      } else {
        setDetectError('Location detected but state could not be determined — please pick manually.');
      }
    } catch (e) {
      setDetectError(e.message);
    } finally {
      setDetecting(false);
    }
  }

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
      goBack();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not save your profile — please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.screen}>
      <button type="button" onClick={() => goBack()} style={styles.backLink}>
        <ChevronLeftIcon size={14} color="#475569" /> Back
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
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detecting}
            style={styles.detectBtn}
          >
            <PinIcon size={14} color={detecting ? '#94A3B8' : '#0F172A'} />
            <span>{detecting ? 'Detecting…' : 'Use my current location'}</span>
          </button>
          {detectError && <p style={styles.detectError}>{detectError}</p>}
          <StateSelect value={state} onChange={setState} />
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
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#475569',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0', marginBottom: -8,
  },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 28, color: '#0F172A' },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#94A3B8' },
  fieldHint: { fontSize: 11.5, color: '#94A3B8', marginTop: 2, lineHeight: '15px' },
  input: {
    height: 50, borderRadius: 14, border: '1px solid #BFDBFE', background: '#FFFFFF',
    padding: '0 16px', fontSize: 14.5, color: '#0F172A', fontFamily: 'inherit',
  },
  budgetInput: {
    background: '#FFFFFF', border: '1px solid #BFDBFE', borderRadius: 14,
    padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
  },
  naira: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: '#0F172A' },
  budgetField: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: '#0F172A', flex: 1, border: 'none', outline: 'none' },
  optionsWrap: { display: 'flex', flexWrap: 'wrap', gap: 10 },
  option: {
    padding: '11px 18px', borderRadius: 999, border: '1px solid #BFDBFE', background: '#FFFFFF',
    fontSize: 13.5, fontWeight: 600, color: '#0F172A', cursor: 'pointer',
  },
  optionActive: { background: '#2563EB', borderColor: '#2563EB', color: '#FFFFFF' },
  saveBtn: {
    height: 50, borderRadius: 999,
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: 'none',
    color: '#FFFFFF', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', marginTop: 8,
    boxShadow: '0 4px 14px rgba(15,23,42,0.20)',
  },
  detectBtn: {
    height: 44, borderRadius: 14, border: '1.5px solid #BFDBFE', background: '#F8FAFC',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#0F172A', fontFamily: 'inherit',
    width: '100%',
  },
  detectError: { fontSize: 12.5, color: '#C8402A', lineHeight: '17px', marginTop: 4 },
};
