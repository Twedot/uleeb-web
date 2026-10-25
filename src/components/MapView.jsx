import { useEffect, useRef } from 'react';

// State-capital fallback coordinates so a property without an exact pin
// still shows a map centred on the right city.
const STATE_COORDS = {
  'Lagos':       [6.5244,  3.3792],
  'Abuja (FCT)': [9.0765,  7.3986],
  'Rivers':      [4.8156,  7.0498],
  'Oyo':         [7.3775,  3.9470],
  'Ogun':        [7.1600,  3.3473],
  'Kano':        [12.0022, 8.5920],
  'Enugu':       [6.4584,  7.5464],
  'Kaduna':      [10.5264, 7.4381],
};

// Renders a Leaflet map with a single marker. Uses lat/lng when stored,
// falls back to the state capital with zoom 11 (vs 15 for exact).
export function MapView({ lat, lng, state }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const hasExact = lat != null && lng != null;
    const fallback = STATE_COORDS[state] ?? [9.082, 8.6753]; // Nigeria center
    const center = hasExact ? [lat, lng] : fallback;
    const zoom = hasExact ? 15 : 11;

    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');

      // Fix default icon path broken by bundlers
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.default.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(center, zoom);
      mapRef.current = map;

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.default.marker(center).addTo(map);
      if (!hasExact) {
        marker.bindPopup(`Approximate location — ${state}`).openPopup();
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, state]);

  return (
    <div style={s.wrap}>
      <div ref={containerRef} style={s.map} />
      {(lat == null || lng == null) && (
        <div style={s.approxBadge}>Approximate location</div>
      )}
    </div>
  );
}

const s = {
  wrap: { position: 'relative', borderRadius: 18, overflow: 'hidden', marginTop: 12 },
  map: { width: '100%', height: 240 },
  approxBadge: {
    position: 'absolute', bottom: 10, left: 10,
    background: 'rgba(19,17,16,0.75)', backdropFilter: 'blur(6px)',
    color: '#FFFFFF', fontSize: 11, fontWeight: 600, padding: '4px 10px',
    borderRadius: 999, pointerEvents: 'none',
  },
};
