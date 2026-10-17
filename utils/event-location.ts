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

export function createEventMapUrl(event: EventLocationInput) {
  const coordinate = getEventMapCoordinate(event);
  if (coordinate) {
    const { latitude, longitude } = coordinate;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  }

  const query = createEventLocationQuery(event);

  return query
    ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`
    : null;
}
