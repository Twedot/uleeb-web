import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import { ChevronLeftIcon, UploadIcon, FileIcon, XIcon } from '../components/icons';
import { MapPicker } from '../components/MapPicker';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { StateSelect } from '../components/StateSelect';
import { normalizeState } from '../lib/nigeria';

const AMENITIES = [
  'Kitchen', 'Wardrobe', 'Parking', 'Generator', 'Inverter', 'Solar panels',
  'Water supply', 'Borehole', 'Prepaid meter', '24/7 security', 'CCTV', 'Gateman',
  'Furnished', 'Air conditioning', 'Wifi', 'Fenced compound', 'Boys quarter',
  'Balcony', 'Swimming pool', 'Gym', 'Elevator', 'Garden', 'Rooftop terrace', 'Intercom',
];
const MIN_PHOTOS = 5;

// Web counterpart to uleeb mobile's app/add-property.tsx — same fields,
// same 5-photo minimum, same two-step create-then-upload-media call
// (see PropertiesContext.addProperty). Real <input type="file"> instead
// of expo-image-picker/document-picker.
export default function AddProperty() {
  const { properties: myProperties, addProperty } = useProperties();
  const navigate = useNavigate();
  const isFirstProperty = myProperties.length === 0;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState(null);
  const [country] = useState('Nigeria');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [size, setSize] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [agencyFeeOn, setAgencyFeeOn] = useState(false);
  const [agencyFee, setAgencyFee] = useState('');
  const [extraCharges, setExtraCharges] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [document, setDocument] = useState(null);
  const [pinLat, setPinLat] = useState(null);
  const [pinLng, setPinLng] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [attempted, setAttempted] = useState(false);

  const canSubmit =
    title.trim().length > 2 &&
    location.trim().length > 2 &&
    !!state &&
    price.length > 0 &&
    photos.length >= MIN_PHOTOS;

  function addCharge() { setExtraCharges((p) => [...p, { name: '', amount: '' }]); }
  function updateCharge(i, field, val) { setExtraCharges((p) => p.map((c, idx) => idx === i ? { ...c, [field]: val } : c)); }
  function removeCharge(i) { setExtraCharges((p) => p.filter((_, idx) => idx !== i)); }

  function toggleAmenity(a) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function handlePhotoPick(e) {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files]);
    e.target.value = '';
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!canSubmit) { setAttempted(true); return; }
    setSubmitting(true);
    setError(null);
    try {
      await addProperty({
        title: title.trim(),
        location: location.trim(),
        state,
        country: country.trim(),
        price: Number(price) || 0,
        bedrooms: Number(bedrooms) || 0,
        sizeSqm: Number(size) || 0,
        amenities,
        agencyFee: agencyFeeOn ? (Number(agencyFee) || 0) : null,
        extraCharges: extraCharges.filter((c) => c.name.trim()).map((c) => ({ name: c.name.trim(), amount: Number(c.amount) || 0 })),
        photos,
        video,
        document,
        lat: pinLat ?? undefined,
        lng: pinLng ?? undefined,
      });
      navigate('/properties', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not list this property. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button type="button" style={styles.backLink} onClick={() => navigate(-1)}>
          <ChevronLeftIcon size={14} color="#475569" /> Back
        </button>
        {isFirstProperty && (
          <button type="button" style={styles.skipLink} onClick={() => navigate('/properties')}>
            Skip for now
          </button>
        )}
      </div>

      <h1 style={styles.title}>{isFirstProperty ? 'List your first property' : 'List a new property'}</h1>
      <p style={styles.subtitle}>Add the details tenants need to decide.</p>

      <div style={styles.form}>
        <Field label="Property title" hasError={attempted && title.trim().length <= 2}>
          <input style={{ ...styles.input, ...(attempted && title.trim().length <= 2 ? { borderColor: '#C8402A' } : {}) }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="2-bed flat, Lekki Phase 1" />
        </Field>

        <Field label="Address / area" hasError={attempted && location.trim().length <= 2}>
          <LocationAutocomplete
            value={location}
            placeholder="Start typing an address or area…"
            onChange={({ address, rawState, lat, lng }) => {
              setLocation(address);
              if (rawState) {
                const normalized = normalizeState(rawState);
                if (normalized) setState(normalized);
              }
              if (lat && lng) { setPinLat(lat); setPinLng(lng); }
            }}
          />
        </Field>

        <Field label="State" hasError={attempted && !state}>
          <StateSelect value={state} onChange={setState} />
        </Field>

        <Field label="Pin exact location (optional)">
          <MapPicker
            state={state}
            lat={pinLat}
            lng={pinLng}
            onChange={({ lat, lng }) => { setPinLat(lat); setPinLng(lng); }}
          />
        </Field>

        <div style={styles.row2}>
          <Field label="Price / yr (₦)" hasError={attempted && price.length === 0}>
            <input style={{ ...styles.input, ...(attempted && price.length === 0 ? { borderColor: '#C8402A' } : {}) }} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="2400000" />
          </Field>
          <Field label="Bedrooms">
            <input style={styles.input} value={bedrooms} onChange={(e) => setBedrooms(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="2" />
          </Field>
        </div>

        <Field label="Size (m²)">
          <input style={styles.input} value={size} onChange={(e) => setSize(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="85" />
        </Field>

        <Field label="Amenities">
          <div style={styles.optionsWrap}>
            {AMENITIES.map((a) => (
              <button key={a} type="button" style={{ ...styles.option, ...(amenities.includes(a) ? styles.optionActive : null) }} onClick={() => toggleAmenity(a)}>
                {a}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Agency fee">
          <div style={styles.toggleRow}>
            <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>Agency fee applies</span>
            <button type="button" style={{ ...styles.toggle, ...(agencyFeeOn ? styles.toggleOn : null) }} onClick={() => setAgencyFeeOn((p) => !p)} aria-pressed={agencyFeeOn}>
              <span style={{ ...styles.toggleThumb, ...(agencyFeeOn ? styles.toggleThumbOn : null) }} />
            </button>
          </div>
          {agencyFeeOn && (
            <input style={{ ...styles.input, marginTop: 10 }} value={agencyFee} onChange={(e) => setAgencyFee(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="Agency fee in ₦ (e.g. 150000)" />
          )}
        </Field>

        <Field label="Other charges">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {extraCharges.map((c, i) => (
              <div key={i} style={styles.chargeRow}>
                <input style={{ ...styles.input, flex: 1, height: 44 }} value={c.name} onChange={(e) => updateCharge(i, 'name', e.target.value)} placeholder="e.g. Security deposit" />
                <input style={{ ...styles.input, width: 110, height: 44 }} value={c.amount} onChange={(e) => updateCharge(i, 'amount', e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="₦ amount" />
                <button type="button" style={styles.removeCharge} onClick={() => removeCharge(i)} aria-label="Remove">
                  <XIcon size={13} color="#475569" />
                </button>
              </div>
            ))}
            <button type="button" style={styles.addChargeBtn} onClick={addCharge}>+ Add charge</button>
          </div>
          <p style={styles.hint}>Security deposit, service charge, electricity fee, etc.</p>
        </Field>

        <Field label={`Photos (min. ${MIN_PHOTOS})`} hasError={attempted && photos.length < MIN_PHOTOS}>
          <div style={styles.photoGrid}>
            {photos.map((file, i) => (
              <div key={i} style={styles.photoThumb}>
                <img src={URL.createObjectURL(file)} alt="" style={styles.photoImg} />
                <button type="button" style={styles.photoRemove} onClick={() => removePhoto(i)} aria-label="Remove photo">
                  <XIcon size={11} color="#fff" strokeWidth={2.5} />
                </button>
              </div>
            ))}
            <label style={styles.photoAdd}>
              <UploadIcon size={18} color="#475569" />
              <span style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Add</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoPick} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={styles.hint}>{photos.length} of {MIN_PHOTOS} minimum photos added.</p>
        </Field>

        <Field label="Walkthrough video (optional)">
          {video ? (
            <div style={styles.fileRow}>
              <FileIcon size={16} color="#475569" />
              <span style={styles.fileName}>{video.name}</span>
              <button type="button" style={styles.fileRemove} onClick={() => setVideo(null)} aria-label="Remove video">
                <XIcon size={12} color="#475569" />
              </button>
            </div>
          ) : (
            <label style={styles.uploadRow}>
              <UploadIcon size={16} color="#475569" />
              <span style={{ fontSize: 13.5, color: '#475569', fontWeight: 600 }}>Upload a video</span>
              <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
            </label>
          )}
        </Field>

        <Field label="Ownership document (optional)">
          {document ? (
            <div style={styles.fileRow}>
              <FileIcon size={16} color="#475569" />
              <span style={styles.fileName}>{document.name}</span>
              <button type="button" style={styles.fileRemove} onClick={() => setDocument(null)} aria-label="Remove document">
                <XIcon size={12} color="#475569" />
              </button>
            </div>
          ) : (
            <label style={styles.uploadRow}>
              <UploadIcon size={16} color="#475569" />
              <span style={{ fontSize: 13.5, color: '#475569', fontWeight: 600 }}>Upload a document</span>
              <input type="file" accept="application/pdf,image/*" onChange={(e) => setDocument(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
            </label>
          )}
        </Field>

        {error && <p style={styles.error}>{error}</p>}

        <button type="button" style={{ ...styles.submitBtn, ...((submitting) ? { opacity: 0.4, cursor: 'default' } : null) }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Listing…' : 'List this property'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, hasError }) {
  return (
    <div style={{ ...styles.field, ...(hasError ? { paddingLeft: 8, borderLeft: '2px solid #C8402A' } : {}) }}>
      <p style={{ ...styles.label, ...(hasError ? { color: '#C8402A' } : {}) }}>{label}</p>
      {children}
      {hasError && <p style={{ fontSize: 11.5, color: '#C8402A', marginTop: 4 }}>This field is required</p>}
    </div>
  );
}

const styles = {
  screen: { maxWidth: 640, margin: '0 auto', padding: '24px 24px 64px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backLink: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#475569',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0',
  },
  skipLink: { background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  title: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 26, color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: '#475569', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#94A3B8', marginBottom: 8 },
  input: {
    height: 50, borderRadius: 16, border: '1px solid #BFDBFE', background: '#FFFFFF',
    padding: '0 16px', fontSize: 14.5, color: '#0F172A', outline: 'none', fontFamily: 'inherit',
  },
  row2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  optionsWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  option: {
    padding: '9px 15px', borderRadius: 999, border: '1px solid #BFDBFE', background: '#FFFFFF',
    fontSize: 13, fontWeight: 600, color: '#0F172A', cursor: 'pointer',
  },
  optionActive: { background: '#2563EB', borderColor: '#2563EB', color: '#FFFFFF' },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 10 },
  photoThumb: { position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: '#E3EFFD' },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  photoRemove: {
    position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 999,
    background: 'rgba(37,99,235,0.85)', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  photoAdd: {
    aspectRatio: '1', borderRadius: 14, border: '1.5px dashed #BFDBFE', background: '#EEF6FF',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  hint: { fontSize: 11.5, color: '#94A3B8', marginTop: 8 },
  toggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 50, border: '1px solid #BFDBFE', borderRadius: 16, padding: '0 16px', background: '#FFFFFF' },
  toggle: { width: 44, height: 24, borderRadius: 999, background: '#CBD5E1', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' },
  toggleOn: { background: '#2563EB' },
  toggleThumb: { position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: 999, background: '#FFFFFF', transition: 'left 0.2s', display: 'block' },
  toggleThumbOn: { left: 23 },
  chargeRow: { display: 'flex', gap: 8, alignItems: 'center' },
  removeCharge: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 },
  addChargeBtn: { alignSelf: 'flex-start', background: 'none', border: '1px dashed #BFDBFE', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#2563EB', cursor: 'pointer' },
  uploadRow: {
    display: 'flex', alignItems: 'center', gap: 10, height: 50, borderRadius: 16,
    border: '1px dashed #BFDBFE', background: '#EEF6FF', padding: '0 16px', cursor: 'pointer',
  },
  fileRow: {
    display: 'flex', alignItems: 'center', gap: 10, height: 50, borderRadius: 16,
    border: '1px solid #BFDBFE', background: '#FFFFFF', padding: '0 16px',
  },
  fileName: { flex: 1, fontSize: 13.5, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  fileRemove: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  error: { fontSize: 13, color: '#C8402A' },
  submitBtn: {
    height: 54, borderRadius: 999, border: 'none',
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
    boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
  },
};
