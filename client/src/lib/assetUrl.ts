const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:4000";

export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
