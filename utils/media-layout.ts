/**
 * Card media sizing (pure; tested in utils/media-layout.test.mjs).
 *
 * The card takes the media's own shape, limited like Instagram: tallest 4:5 (portrait),
 * widest 1.91:1 (landscape). Inside that box the whole picture is shown ("contain"), so nothing
 * is ever cut off; any leftover space is filled with a blurred copy of the same picture.
 */

export const MIN_CARD_ASPECT = 4 / 5;
export const MAX_CARD_ASPECT = 1.91;
export const DEFAULT_CARD_ASPECT = 4 / 3;

/** width / height of the card box for media of the given pixel size. */
export function cardAspectRatio(width?: number | null, height?: number | null) {
  if (!width || !height || width <= 0 || height <= 0) return DEFAULT_CARD_ASPECT;
  const ratio = width / height;
  return Math.min(MAX_CARD_ASPECT, Math.max(MIN_CARD_ASPECT, ratio));
}
