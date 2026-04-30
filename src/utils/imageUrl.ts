const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL as string | undefined;

export function resolveImageUrl(url: string): string {
  if (!url || !imageBaseUrl) return url;
  try {
    const parsed = new URL(url);
    const base = new URL(imageBaseUrl);
    parsed.protocol = base.protocol;
    parsed.host = base.host;
    return parsed.toString();
  } catch {
    return url;
  }
}
