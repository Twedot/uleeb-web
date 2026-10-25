import { useEffect, useRef, useState } from 'react';
import { PinIcon } from './icons';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

async function fetchSuggestions(query) {
  const params = new URLSearchParams({
    q: query,
    countrycodes: 'ng',
    format: 'json',
    addressdetails: '1',
    limit: '7',
  });
  const res = await fetch(`${NOMINATIM}?${params}`, {
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) return [];
  return res.json();
}

// Address autocomplete for Nigerian locations using OpenStreetMap Nominatim.
// Props:
//   value        — current address string
//   onChange     — called with { address, state, lat, lng } on selection
//   placeholder  — input placeholder text
export function LocationAutocomplete({ value, onChange, placeholder = 'Start typing an address…' }) {
  const [query, setQuery] = useState(value ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  // keep input in sync if parent resets value
  useEffect(() => { setQuery(value ?? ''); }, [value]);

  useEffect(() => {
    const onClickOut = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  function handleInput(e) {
    const q = e.target.value;
    setQuery(q);
    setSuggestions([]);
    setOpen(false);
    clearTimeout(debounceRef.current);
    if (q.length < 3) return;
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchSuggestions(q);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        // network error — fail silently
      } finally {
        setLoading(false);
      }
    }, 420);
  }

  function handleSelect(item) {
    const address = item.display_name;
    const addr = item.address ?? {};
    // Extract state from the Nominatim address object
    const rawState = addr.state ?? addr.region ?? null;
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setQuery(address);
    setOpen(false);
    setSuggestions([]);
    onChange({ address, rawState, lat, lng });
  }

  // Format display: show first two comma-separated parts (area + city) prominently
  function formatLabel(displayName) {
    const parts = displayName.split(',').map((p) => p.trim());
    return {
      main: parts.slice(0, 2).join(', '),
      rest: parts.slice(2).join(', '),
    };
  }

  return (
    <div ref={wrapRef} style={s.wrap}>
      <div style={s.inputWrap}>
        <PinIcon size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          style={s.input}
        />
        {loading && <span style={s.spinner} />}
      </div>
      {open && suggestions.length > 0 && (
        <ul style={s.dropdown}>
          {suggestions.map((item) => {
            const { main, rest } = formatLabel(item.display_name);
            return (
              <li key={item.place_id}>
                <button
                  type="button"
                  style={s.option}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
                >
                  <PinIcon size={13} color="#BFDBFE" />
                  <div style={s.optionText}>
                    <span style={s.optionMain}>{main}</span>
                    {rest && <span style={s.optionRest}>{rest}</span>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const s = {
  wrap: { position: 'relative', width: '100%' },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    height: 50, borderRadius: 16, border: '1px solid #BFDBFE', background: '#FFFFFF',
    padding: '0 14px',
  },
  input: {
    flex: 1, border: 'none', outline: 'none', fontSize: 14.5, color: '#0F172A',
    fontFamily: 'inherit', background: 'transparent',
  },
  spinner: {
    width: 14, height: 14, borderRadius: 999,
    border: '2px solid #BFDBFE', borderTopColor: '#2563EB',
    animation: 'spin 0.7s linear infinite', flexShrink: 0,
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 1001,
    background: '#FFFFFF', border: '1px solid #DBEAFE', borderRadius: 16,
    boxShadow: '0 8px 32px rgba(37,99,235,0.12)', listStyle: 'none',
    overflow: 'hidden', padding: '4px 0',
  },
  option: {
    width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer',
    textAlign: 'left',
  },
  optionText: { display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 },
  optionMain: { fontSize: 13.5, fontWeight: 600, color: '#0F172A', lineHeight: '18px' },
  optionRest: { fontSize: 11.5, color: '#94A3B8', marginTop: 1, lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
};

// Inject keyframe for the spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}
