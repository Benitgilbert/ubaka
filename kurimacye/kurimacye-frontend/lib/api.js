const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.kurimacye.co.rw").replace(/\/+$/, "");
}

export function toAbsoluteAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL.replace(/\/api\/?$/, "")}${normalized}`;
}

export async function fetchApi(path, { revalidate = 60, tags } = {}) {
  const cleanedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE_URL}${cleanedPath}`, {
    next: { revalidate, tags }
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function safeFetchApi(path, options) {
  try {
    return await fetchApi(path, options);
  } catch {
    return null;
  }
}
