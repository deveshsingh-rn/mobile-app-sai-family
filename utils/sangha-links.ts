const DEFAULT_PUBLIC_URL = "https://saifamily.sustaininsight.com";

function publicBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_PUBLIC_URL
  ).replace(/\/$/, "");
}

export function createSanghaAppLink(groupId: string) {
  return `saifamily://group-details?id=${encodeURIComponent(groupId)}`;
}

export function createSanghaPublicShareLink(identifier: string) {
  return `${publicBaseUrl()}/join/sangha/${encodeURIComponent(identifier)}`;
}

export function extractSanghaGroupIdentifier(value: string) {
  const input = value.trim();
  if (!input) return null;

  try {
    const url = new URL(input);
    if (url.protocol === "saifamily:") {
      return url.searchParams.get("id")?.trim() || null;
    }

    const match = url.pathname.match(/\/join\/sangha\/([^/?#]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]).trim() : null;
  } catch {
    const appMatch = input.match(/group-details\?[^#]*\bid=([^&#\s]+)/i);
    const webMatch = input.match(/\/join\/sangha\/([^/?#\s]+)/i);
    const identifier = appMatch?.[1] || webMatch?.[1];
    return identifier ? decodeURIComponent(identifier).trim() : null;
  }
}
