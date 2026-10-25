const NOMINATIM = 'https://nominatim.openstreetmap.org';

// Reverse-geocode a lat/lng to a Nominatim address object
export async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({ lat, lon: lng, format: 'json', addressdetails: '1' });
  const res = await fetch(`${NOMINATIM}/reverse?${params}`, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error('Geocoding failed');
  return res.json();
}

// Detect the browser's position then reverse-geocode it.
// Returns { address, rawState, lat, lng } or throws.
export function detectLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Your browser does not support location detection.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await reverseGeocode(coords.latitude, coords.longitude);
          resolve({
            address: data.display_name ?? '',
            rawState: data.address?.state ?? data.address?.region ?? null,
            lat: coords.latitude,
            lng: coords.longitude,
          });
        } catch (e) {
          reject(e);
        }
      },
      (err) => {
        if (err.code === 1) reject(new Error('Location access denied — please allow it or pick your state manually.'));
        else reject(new Error('Could not get your location. Please pick your state manually.'));
      },
      { timeout: 10000 }
    );
  });
}
