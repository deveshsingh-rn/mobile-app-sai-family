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

export function createEventGoogleMapsUrl(event: EventLocationInput) {
  const query = createEventLocationQuery(event);

  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null;
}
