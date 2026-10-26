import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

// Edits an existing listing — same fields/layout as AddProperty.jsx,
// pre-filled from the property, backed by uleeb-api's new PATCH
// /properties/:id (core fields) and PATCH /properties/:id/photos
// (removing an existing photo — the multipart /media endpoint only
// ever appends new files, so removal needs the separate replace call).
export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, updateProperty, addPropertyMedia, setPropertyPhotos } = useProperties();
  const original = properties.find((p) => p.id === id);

  const [title, setTitle] = useState(original?.title ?? '');
  const [location, setLocation] = useState(original?.location ?? '');
  const [state, setState] = useState(original?.state ?? null);
  const [country] = useState(original?.country ?? 'Nigeria');
  const [price, setPrice] = useState(String(original?.price ?? ''));
  const [bedrooms, setBedrooms] = useState(String(original?.bedrooms ?? ''));
  const [size, setSize] = useState(String(original?.sizeSqm ?? ''));
  const [amenities, setAmenities] = useState(original?.amenities ?? []);
  const [existingPhotos, setExistingPhotos] = useState(original?.photos ?? []);
  const [newPhotos, setNewPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [document, setDocument] = useState(null);
  const [pinLat, setPinLat] = useState(original?.lat ?? null);
  const [pinLng, setPinLng] = useState(original?.lng ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!original) {
    return (
      <div style={styles.screen}>
        <p style={{ color: '#475569' }}>This property isn't available right now.</p>
        <button type="button" style={styles.backLink} onClick={() => navigate('/properties')}>Back to your properties</button>
      </div>
    );
  }

  const totalPhotos = existingPhotos.length + newPhotos.length;
  const canSave =
    title.trim().length > 2 &&
    location.trim().length > 2 &&
    !!state &&
    price.length > 0 &&
    totalPhotos >= MIN_PHOTOS &&
    (!!video || !!original?.videoUrl);

  function toggleAmenity(a) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function handlePhotoPick(e) {
    const files = Array.from(e.target.files ?? []);
    setNewPhotos((prev) => [...prev, ...files]);
    e.target.value = '';
  }

  function removeExistingPhoto(url) {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
  }

  function removeNewPhoto(index) {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await updateProperty(id, {
        title: title.trim(),
        location: location.trim(),
        state,
        country: country.trim(),
        price: Number(price) || 0,
        bedrooms: Number(bedrooms) || 0,
        sizeSqm: Number(size) || 0,
        amenities,
        lat: pinLat ?? undefined,
        lng: pinLng ?? undefined,
      });

      // Only touch photos if something actually changed — no point
      // replacing an unchanged array or appending an empty file list.
      const photosRemoved = existingPhotos.length !== (original.photos ?? []).length;
      if (photosRemoved) {
        await setPropertyPhotos(id, existingPhotos);
      }
      if (newPhotos.length > 0 || video || document) {
        await addPropertyMedia(id, { photos: newPhotos, video, document });
      }

      navigate(`/my-properties/${id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save these changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button type="button" style={styles.backLink} onClick={() => navigate(-1)}>
          <ChevronLeftIcon size={14} color="#475569" /> Back
        </button>
      </div>

      <h1 style={styles.title}>Edit property</h1>
      <p style={styles.subtitle}>Update the details tenants see.</p>

      <div style={styles.form}>
        <Field label="Property title">
          <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="2-bed flat, Lekki Phase 1" />
        </Field>

        <Field label="Address / area">
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

        <Field label="State">
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
          <Field label="Price / yr (₦)">
            <input style={styles.input} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="2400000" />
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

        <Field label={`Photos (min. ${MIN_PHOTOS})`}>
          <div style={styles.photoGrid}>
            {existingPhotos.map((url) => (
              <div key={url} style={styles.photoThumb}>
                <img src={url} alt="" style={styles.photoImg} />
                <button type="button" style={styles.photoRemove} onClick={() => removeExistingPhoto(url)} aria-label="Remove photo">
                  <XIcon size={11} color="#fff" strokeWidth={2.5} />
                </button>
              </div>
            ))}
            {newPhotos.map((file, i) => (
              <div key={i} style={styles.photoThumb}>
                <img src={URL.createObjectURL(file)} alt="" style={styles.photoImg} />
                <button type="button" style={styles.photoRemove} onClick={() => removeNewPhoto(i)} aria-label="Remove photo">
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
          <p style={styles.hint}>{totalPhotos} of {MIN_PHOTOS} minimum photos.</p>
        </Field>

        <Field label="Walkthrough video">
          {video ? (
            <div style={styles.fileRow}>
              <FileIcon size={16} color="#475569" />
              <span style={styles.fileName}>{video.name}</span>
              <button type="button" style={styles.fileRemove} onClick={() => setVideo(null)} aria-label="Remove video">
                <XIcon size={12} color="#475569" />
              </button>
            </div>
          ) : original.videoUrl ? (
            <div style={styles.fileRow}>
              <FileIcon size={16} color="#475569" />
              <span style={styles.fileName}>Current video</span>
              <label style={styles.replaceLink}>
                Replace
                <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
              </label>
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
          ) : original.documentUrl ? (
            <div style={styles.fileRow}>
              <FileIcon size={16} color="#475569" />
              <span style={styles.fileName}>Current document</span>
              <label style={styles.replaceLink}>
                Replace
                <input type="file" accept="application/pdf,image/*" onChange={(e) => setDocument(e.target.files?.[0] ?? null)} style={{ display: 'none' }} />
              </label>
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

        <button type="button" style={{ ...styles.submitBtn, ...((!canSave || saving) ? { opacity: 0.4, cursor: 'default' } : null) }} onClick={handleSave} disabled={!canSave || saving}>
          {saving ? 'Saving…' : 'Save changes'}
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
    display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#475569',
    fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '4px 0',
  },
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
  photoThumb: { position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: '#EEF6FF' },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  photoRemove: {
    position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 999,
    background: 'rgba(19,17,16,0.75)', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  photoAdd: {
    aspectRatio: '1', borderRadius: 14, border: '1.5px dashed #BFDBFE', background: '#EEF6FF',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  hint: { fontSize: 11.5, color: '#94A3B8', marginTop: 8 },
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
  replaceLink: { fontSize: 12.5, fontWeight: 700, color: '#2563EB', cursor: 'pointer' },
  error: { fontSize: 13, color: '#C8402A' },
  submitBtn: {
    height: 54, borderRadius: 999, border: 'none',
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
    boxShadow: '0 4px 16px rgba(15,23,42,0.20)',
  },
};
