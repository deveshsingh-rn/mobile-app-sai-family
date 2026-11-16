type EventLocationInput = {
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  state?: string | null;
  venueName?: string | null;
};

const cleanPart = (value?: string | null) => value?.trim() || "";

export function getEventMapCoordinate(event: EventLocationInput) {
  if (event.latitude == null || event.longitude == null) return null;

  const latitude = Number(event.latitude);
  const longitude = Number(event.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    (latitude === 0 && longitude === 0)
  ) {
    return null;
  }

  return { latitude, longitude };
}

export function createEventLocationQuery(event: EventLocationInput) {
  const venueName = cleanPart(event.venueName);
  const address = cleanPart(event.address);
  const primaryParts = [venueName, address].filter(Boolean);
  const primaryText = primaryParts.join(", ").toLocaleLowerCase();
  const contextParts = [event.city, event.state, event.country]
    .map(cleanPart)
    .filter(
      (part, index, parts) =>
        Boolean(part) &&
        parts.findIndex(
          (candidate) =>
            candidate.toLocaleLowerCase() === part.toLocaleLowerCase()
        ) === index &&
        !primaryText.includes(part.toLocaleLowerCase())
    );
  const textQuery = [...primaryParts, ...contextParts].join(", ");

  if (textQuery) {
    return textQuery;
  }

  if (
    typeof event.latitude === "number" &&
    Number.isFinite(event.latitude) &&
    typeof event.longitude === "number" &&
    Number.isFinite(event.longitude)
  ) {
    return `${event.latitude},${event.longitude}`;
  }

  return "";
}

/** What Google Maps should search for: exact pin when we have coordinates, else the address text. */
function googleMapsQuery(event: EventLocationInput) {
  const coordinate = getEventMapCoordinate(event);
  if (coordinate) return `${coordinate.latitude},${coordinate.longitude}`;
  return createEventLocationQuery(event);
}

/**
 * Google Maps universal link (official "Maps URLs" API). On Android it opens the Google Maps app
 * directly; elsewhere it opens Google Maps in the browser. Used as the fallback on iOS.
 */
export function createEventMapUrl(event: EventLocationInput) {
  const query = googleMapsQuery(event);
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null;
}

/** iOS deep link into the Google Maps app (works only when the app is installed). */
export function createGoogleMapsAppUrl(event: EventLocationInput) {
  const query = googleMapsQuery(event);
  if (!query) return null;
  const coordinate = getEventMapCoordinate(event);
  const center = coordinate ? `&center=${coordinate.latitude},${coordinate.longitude}&zoom=16` : "";
  return `comgooglemaps://?q=${encodeURIComponent(query)}${center}`;
}
