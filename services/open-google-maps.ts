import { Linking, Platform } from "react-native";

import { createEventMapUrl, createGoogleMapsAppUrl } from "@/utils/event-location";

type EventLocation = Parameters<typeof createEventMapUrl>[0];

/**
 * Opens an event location in the Google Maps app.
 * - iOS: `comgooglemaps://` opens the app; if it isn't installed, openURL rejects and we fall back to
 *   the Google Maps website. (We call openURL directly: canOpenURL would need an Info.plist entry
 *   and a new native build.)
 * - Android: the official https Maps URL is handled by the Google Maps app itself.
 * Returns false when the event has no usable location.
 */
export async function openEventInGoogleMaps(event: EventLocation) {
  const webUrl = createEventMapUrl(event);
  if (!webUrl) return false;

  if (Platform.OS === "ios") {
    const appUrl = createGoogleMapsAppUrl(event);
    if (appUrl) {
      try {
        await Linking.openURL(appUrl);
        return true;
      } catch {
        // Google Maps app not installed → web fallback below.
      }
    }
  }

  try {
    await Linking.openURL(webUrl);
    return true;
  } catch {
    return false;
  }
}
