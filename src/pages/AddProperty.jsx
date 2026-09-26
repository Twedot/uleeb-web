import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import { ChevronLeftIcon, UploadIcon, FileIcon, XIcon } from '../components/icons';

const NIGERIAN_STATES = ['Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Ogun', 'Kano', 'Enugu', 'Kaduna'];
const AMENITIES = [
  'Kitchen', 'Wardrobe', 'Parking', 'Generator', 'Water supply', '24/7 security',
  'Furnished', 'Air conditioning', 'Wifi', 'Fenced compound', 'Balcony', 'Swimming pool',
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
  const [bathrooms, setBathrooms] = useState('');
  const [size, setSize] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [document, setDocument] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit =
    title.trim().length > 2 &&
    location.trim().length > 2 &&
    !!state &&
    price.length > 0 &&
    photos.length >= MIN_PHOTOS;

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
    if (!canSubmit) return;
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
        bathrooms: Number(bathrooms) || 0,
        sizeSqm: Number(size) || 0,
        amenities,
        photos,
        video,
        document,
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
          <ChevronLeftIcon size={14} color="#5B5750" /> Back
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
        <Field label="Property title">
          <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="2-bed flat, Lekki Phase 1" />
        </Field>

        <Field label="Address / area">
          <input style={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Off Admiralty Way" />
        </Field>

        <Field label="State">
          <div style={styles.optionsWrap}>
            {NIGERIAN_STATES.map((s) => (
              <button key={s} type="button" style={{ ...styles.option, ...(state === s ? styles.optionActive : null) }} onClick={() => setState(s)}>
                {s}
              </button>
            ))}
          </div>
        </Field>

        <div style={styles.row3}>
          <Field label="Price / yr (₦)">
            <input style={styles.input} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="2400000" />
          </Field>
          <Field label="Bedrooms">
            <input style={styles.input} value={bedrooms} onChange={(e) => setBedrooms(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="2" />
          </Field>
          <Field label="Bathrooms">
            <input style={styles.input} value={bathrooms} onChange={(e) => setBathrooms(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="2" />
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

        <Field label={`Photos (min. ${MIN_PHOTOS})`}>
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
              <UploadIcon size={18} color="#5B5750" />
              <span style={{ fontSize: 11, color: '#5B5750', marginTop: 4 }}>Add</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoPick} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={styles.hint}>{photos.length} of {MIN_PHOTOS} minimum photos added.</p>
        </Field>

        <Field label="Walkthrough video (optional)">
          {video ? (
            <div style={styles.fileRow}>
              <FileIcon size={16} color="#5B5750" />
              <span style={styles.fileName}>{video.name}</span>
              <button type="button" style={styles.fileRemove} onClick={() => setVideo(null)} aria-label="Remove video">
                <XIcon size={12} color="#5B5750" />
              </button>
            </div>
          ) : (
            <label style={styles.uploadRow}>
              <UploadIcon size={16} color="#5B5750" />
              <span style={{ fontSize: 13.5, color: '#5B5750', fontWeight: 600 }}>Upload a video</span>
              <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
            </label>
          )}
        </Field>

        <Field label="Ownership document (optional)">
          {document ? (
            <div style={styles.fileRow}>
              <FileIcon size={16} color="#5B5750" />
              <span style={styles.fileName}>{document.name}</span>
              <button type="button" style={styles.fileRemove} onClick={() => setDocument(null)} aria-label="Remove document">
                <XIcon size={12} color="#5B5750" />
              </button>
            </div>
          ) : (
            <label style={styles.uploadRow}>
              <UploadIcon size={16} color="#5B5750" />
              <span style={{ fontSize: 13.5, color: '#5B5750', fontWeight: 600 }}>Upload a document</span>
              <input type="file" accept="application/pdf,image/*" onChange={(e) => setDocument(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
            </label>
          )}
        </Field>

        {error && <p style={styles.error}>{error}</p>}

        <button type="button" style={{ ...styles.submitBtn, ...((!canSubmit || submitting) ? { opacity: 0.4, cursor: 'default' } : null) }} onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Listing…' : 'List this property'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <p style={styles.label}>{label}</p>
      {children}
    </div>
  );
}

const styles = {
  screen: { maxWidth: 640, margin: '0 auto', padding: '24px 24px 64px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backLink: {
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#5B5750',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0',
  },
  skipLink: { background: 'none', border: 'none', color: '#9B968C', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#181614', marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: '#5B5750', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: '#9B968C', marginBottom: 8 },
  input: {
    height: 50, borderRadius: 16, border: '1px solid #E6E3DB', background: '#FFFFFF',
    padding: '0 16px', fontSize: 14.5, color: '#181614', outline: 'none', fontFamily: 'inherit',
  },
  row3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  optionsWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  option: {
    padding: '9px 15px', borderRadius: 999, border: '1px solid #E6E3DB', background: '#FFFFFF',
    fontSize: 13, fontWeight: 600, color: '#181614', cursor: 'pointer',
  },
  optionActive: { background: '#131110', borderColor: '#131110', color: '#FFFFFF' },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 10 },
  photoThumb: { position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: '#F0EFE9' },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  photoRemove: {
    position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 999,
    background: 'rgba(19,17,16,0.75)', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  photoAdd: {
    aspectRatio: '1', borderRadius: 14, border: '1.5px dashed #D8D5CC', background: '#F7F6F2',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  hint: { fontSize: 11.5, color: '#9B968C', marginTop: 8 },
  uploadRow: {
    display: 'flex', alignItems: 'center', gap: 10, height: 50, borderRadius: 16,
    border: '1px dashed #D8D5CC', background: '#F7F6F2', padding: '0 16px', cursor: 'pointer',
  },
  fileRow: {
    display: 'flex', alignItems: 'center', gap: 10, height: 50, borderRadius: 16,
    border: '1px solid #E6E3DB', background: '#FFFFFF', padding: '0 16px',
  },
  fileName: { flex: 1, fontSize: 13.5, color: '#181614', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  fileRemove: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  error: { fontSize: 13, color: '#C8402A' },
  submitBtn: {
    height: 54, borderRadius: 999, border: 'none', background: '#131110', color: '#FFFFFF',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
};
