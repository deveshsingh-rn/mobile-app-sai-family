/**
 * External links used across the app.
 *
 * SAI_LIVE_YOUTUBE_URL: opened by the "Live Darshan" button in the Experiences header.
 *
 * Use the CHANNEL's "/live" link, never a single video link:
 * the channel "The Real SoulShirdi Sai" starts a new live stream every day, so each video id
 * (e.g. watch?v=5mYgyHVqz1k) dies after a day. "https://www.youtube.com/@<handle>/live" always
 * redirects to whatever is live right now (checked 2026-11-16: it pointed at watch?v=MHu5pgS2gRg).
 * While it is empty the Live button stays hidden, so devotees never tap a dead button.
 */
export const SAI_LIVE_YOUTUBE_URL = "https://www.youtube.com/@therealsoulshirdisai/live";
