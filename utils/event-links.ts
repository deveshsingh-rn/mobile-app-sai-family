const DEFAULT_PUBLIC_URL = "https://saifamily.sustaininsight.com";

type EventShareDetails = {
  date: string;
  eventId: string;
  location: string;
  time: string;
  title: string;
};

function publicBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_EVENT_SHARE_BASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
    DEFAULT_PUBLIC_URL
  ).replace(/\/$/, "");
}

export function createEventPublicShareLink(eventId: string) {
  return `${publicBaseUrl()}/events/${encodeURIComponent(eventId)}`;
}

export function createEventShareMessage({
  date,
  eventId,
  location,
  time,
  title,
}: EventShareDetails) {
  const eventUrl = createEventPublicShareLink(eventId);

  return [
    "Join this Sai Family event",
    "",
    title,
    `${date} | ${time}`,
    location,
    "",
    "View details and RSVP:",
    eventUrl,
  ].join("\n");
}
