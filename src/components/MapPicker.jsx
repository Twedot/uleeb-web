import { useEffect, useRef } from 'react';

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

// Editable Leaflet map: the landlord drops a pin on the exact property
// location. Calls onChange({ lat, lng }) on every pin move.
export function MapPicker({ state, lat, lng, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const hasPin = lat != null && lng != null;
    const fallback = STATE_COORDS[state] ?? [9.082, 8.6753];
    const center = hasPin ? [lat, lng] : fallback;

    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');

      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.default.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(center, hasPin ? 15 : 12);
      mapRef.current = map;

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);

      if (hasPin) {
        const marker = L.default.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current = marker;
        marker.on('dragend', () => {
          const { lat: la, lng: ln } = marker.getLatLng();
          onChange({ lat: la, lng: ln });
        });
      }

      map.on('click', (e) => {
        const { lat: la, lng: ln } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([la, ln]);
        } else {
          const m = L.default.marker([la, ln], { draggable: true }).addTo(map);
          markerRef.current = m;
          m.on('dragend', () => {
            const p = m.getLatLng();
            onChange({ lat: p.lat, lng: p.lng });
          });
        }
        onChange({ lat: la, lng: ln });
      });
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // only init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center when state changes (without reinitialising the whole map)
  useEffect(() => {
    if (!mapRef.current || lat != null) return;
    const coords = STATE_COORDS[state];
    if (coords) mapRef.current.setView(coords, 12);
  }, [state, lat]);

  return (
    <div style={s.wrap}>
      <div ref={containerRef} style={s.map} />
      <p style={s.hint}>
        {lat != null ? 'Drag the pin or click to move it.' : 'Click on the map to drop a pin on the exact location.'}
      </p>
    </div>
  );
}

const s = {
  wrap: { borderRadius: 18, overflow: 'visible' },
  map: { width: '100%', height: 280, borderRadius: 18, overflow: 'hidden' },
  hint: { fontSize: 11.5, color: '#9B968C', marginTop: 6 },
};
