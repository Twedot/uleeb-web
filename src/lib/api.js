// Thin fetch wrapper for the uleeb-api Go backend — mirrors the mobile
// app's lib/api.ts exactly (same base URL, same envelope), so the web
// client talks to the exact same backend the phone app does.
const BASE_URL = 'https://uleebapi.twedot.com';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, opts = {}) {
  const headers = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let body;
  if (opts.formData) {
    body = opts.formData;
    // Deliberately no Content-Type — fetch sets the multipart boundary itself.
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method: opts.method ?? 'GET', headers, body });
  } catch {
    throw new ApiError(0, "Can't reach the server — check your connection.");
  }

  const isJSON = res.headers.get('content-type')?.includes('application/json');
  const data = isJSON ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && typeof data === 'object' && 'error' in data ? data.error : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data;
}

export const api = {
  get: (path, token) => request(path, { method: 'GET', token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  patch: (path, body, token) => request(path, { method: 'PATCH', body, token }),
  del: (path, token) => request(path, { method: 'DELETE', token }),
  postForm: (path, formData, token) => request(path, { method: 'POST', formData, token }),
};

// XHR-based multipart upload so callers can track real upload progress
// via onProgress(0-100). fetch has no upload progress event.
export function postFormWithProgress(path, formData, token, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}${path}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      const isJSON = xhr.getResponseHeader('content-type')?.includes('application/json');
      let data = null;
      if (isJSON) {
        try { data = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const message = data?.error ?? `Request failed (${xhr.status})`;
        reject(new ApiError(xhr.status, message));
      }
    };

    xhr.onerror = () => reject(new ApiError(0, "Can't reach the server — check your connection."));
    xhr.send(formData);
  });
}

export { BASE_URL };
