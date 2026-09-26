import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

// Landlord's own listings — mirrors uleeb mobile's store/properties.tsx,
// including addProperty's real two-step upload (POST /properties for the
// fields, then POST /properties/:id/media for photos/video/document —
// browsers hand FormData real File objects directly, no URI-to-file
// shimming needed the way React Native's fetch requires).
const PropertiesContext = createContext(null);

export function PropertiesProvider({ children }) {
  const { token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    // Not gated on current role — properties you've listed stay yours
    // across a role switch, and the backend already scopes this to what
    // you actually own.
    if (!token) return;
    setLoading(true);
    try {
      const list = await api.get('/properties/mine/list', token);
      setProperties(list ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Multipart upload — photos append, video/document replace. Shared by
  // addProperty (against the just-created property) and EditProperty
  // (against an existing one); only ever called when there's actually
  // something new to send.
  async function uploadMedia(id, { photos = [], video, document } = {}) {
    const form = new FormData();
    photos.forEach((file) => form.append('photos', file));
    if (video) form.append('video', video);
    if (document) form.append('document', document);
    return api.postForm(`/properties/${id}/media`, form, token);
  }

  async function addProperty(input) {
    if (!token) throw new Error('Not signed in');

    const created = await api.post(
      '/properties',
      {
        title: input.title,
        location: input.location,
        state: input.state,
        country: input.country,
        price: input.price,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        sizeSqm: input.sizeSqm,
        amenities: input.amenities,
      },
      token,
    );

    if (input.photos.length > 0 || input.video || input.document) {
      const withMedia = await uploadMedia(created.id, input);
      setProperties((prev) => [withMedia, ...prev]);
      return withMedia;
    }

    setProperties((prev) => [created, ...prev]);
    return created;
  }

  // Core-field edit — PATCH /properties/:id, added alongside uleeb-api's
  // new edit endpoints (no update path existed before this).
  async function updateProperty(id, fields) {
    if (!token) throw new Error('Not signed in');
    const updated = await api.patch(`/properties/${id}`, fields, token);
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  // Adds newly-picked photos/video/document to an EXISTING property.
  async function addPropertyMedia(id, media) {
    if (!token) throw new Error('Not signed in');
    const updated = await uploadMedia(id, media);
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  // Replaces the whole photo list — how removing/reordering a photo
  // works, since the media endpoint above only ever appends.
  async function setPropertyPhotos(id, photoUrls) {
    if (!token) throw new Error('Not signed in');
    const updated = await api.patch(`/properties/${id}/photos`, { photos: photoUrls }, token);
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  return (
    <PropertiesContext.Provider
      value={{ properties, loading, refresh, addProperty, updateProperty, addPropertyMedia, setPropertyPhotos }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}

export function useProperties() {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error('useProperties must be used within PropertiesProvider');
  return ctx;
}
