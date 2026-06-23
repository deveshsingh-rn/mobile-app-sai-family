import { SanghaDiscoverySettingsPayload } from "./types";

export function validateSanghaDiscoverySettings(
  payload: SanghaDiscoverySettingsPayload
) {
  const errors: Record<string, string> = {};

  if (
    payload.bio &&
    (payload.bio.trim().length < 10 ||
      payload.bio.length > 240)
  ) {
    errors.bio = "Bio should be between 10 and 240 characters.";
  }

  if (
    payload.tradition &&
    payload.tradition.trim().length < 2
  ) {
    errors.tradition = "Tradition must be at least 2 characters.";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
}
