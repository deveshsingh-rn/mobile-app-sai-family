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

function escapeWhatsAppFormatting(value: string) {
  return value.replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();
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
  const safeTitle = escapeWhatsAppFormatting(title) || "Sai Family Event";
  const safeDate = escapeWhatsAppFormatting(date) || "Date pending";
  const safeTime = escapeWhatsAppFormatting(time) || "Time pending";
  const safeLocation = escapeWhatsAppFormatting(location) || "Venue pending";

  return [
    "*SAI FAMILY EVENT*",
    "",
    `*${safeTitle}*`,
    "",
    `*Date:* ${safeDate}`,
    `*Time:* ${safeTime}`,
    `*Venue:* ${safeLocation}`,
    "",
    "*View details and RSVP:*",
    eventUrl,
    "",
    "Om Sai Ram",
  ].join("\n");
}
