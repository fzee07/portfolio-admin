const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
const TOKEN_KEY = "portfolio_admin_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
  }

  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

const get = (p) => request("GET", p);
const put = (p, b) => request("PUT", p, b);
const post = (p, b) => request("POST", p, b);
const del = (p) => request("DELETE", p);

// Multipart upload (image bytes → backend → MongoDB). No Content-Type header:
// the browser sets the multipart boundary itself.
async function upload(path, file) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers, body: form });
  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
  }
  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(data?.error || `Upload failed (${res.status})`, res.status);
  }
  return data;
}

export const api = {
  base: BASE,

  // auth
  login: (username, password) => post("/api/admin/login", { username, password }),
  me: () => get("/api/admin/me"),

  // database storage usage → { used, limit, objects, collections, … } (bytes)
  stats: () => get("/api/admin/stats"),

  // image upload (multipart → MongoDB) → { id, url, contentType, size }
  uploadImage: (file) => upload("/api/admin/images", file),

  // singletons
  singleton: (name) => ({
    get: () => get(`/api/admin/${name}`),
    save: (body) => put(`/api/admin/${name}`, body),
  }),

  // collections
  collection: (name) => ({
    list: () => get(`/api/admin/${name}`),
    create: (body) => post(`/api/admin/${name}`, body),
    update: (id, body) => put(`/api/admin/${name}/${id}`, body),
    remove: (id) => del(`/api/admin/${name}/${id}`),
    reorder: (ids) => put(`/api/admin/${name}/reorder`, { ids }),
  }),
};

export { ApiError };
