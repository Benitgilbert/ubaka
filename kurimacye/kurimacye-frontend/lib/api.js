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
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

  try {
    const res = await fetch(`${API_BASE_URL}${cleanedPath}`, {
      next: { revalidate, tags },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function safeFetchApi(path, options) {
  try {
    return await fetchApi(path, options);
  } catch {
    return null;
  }
}
