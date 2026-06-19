import {
  DirectoryCreateListingPayload,
  DirectoryReviewPayload,
} from "./types";

export function validateDirectoryListingPayload(
  payload: Partial<DirectoryCreateListingPayload>
) {
  const errors: Record<string, string> = {};

  if (!payload.businessName?.trim()) {
    errors.businessName = "Business name is required.";
  } else if (payload.businessName.trim().length < 2) {
    errors.businessName =
      "Business name must be at least 2 characters.";
  }

  if (!payload.categoryId?.trim()) {
    errors.categoryId = "Category is required.";
  }

  if (!payload.description?.trim()) {
    errors.description = "Description is required.";
  } else if (payload.description.trim().length < 20) {
    errors.description =
      "Description must be at least 20 characters.";
  }

  if (
    !payload.phoneNumber?.trim() &&
    !payload.whatsappNumber?.trim()
  ) {
    errors.phoneNumber =
      "Phone or WhatsApp number is required.";
  }

  if (!payload.address?.trim()) {
    errors.address = "Address is required.";
  } else if (payload.address.trim().length < 5) {
    errors.address =
      "Address must be at least 5 characters.";
  }

  if (!payload.city?.trim()) {
    errors.city = "City is required.";
  } else if (payload.city.trim().length < 2) {
    errors.city = "City must be at least 2 characters.";
  }

  if (
    payload.yearsOfExperience !== undefined &&
    (payload.yearsOfExperience < 0 ||
      payload.yearsOfExperience > 100)
  ) {
    errors.yearsOfExperience =
      "Years of experience must be between 0 and 100.";
  }

  if (
    payload.latitude !== undefined &&
    (payload.latitude < -90 || payload.latitude > 90)
  ) {
    errors.latitude =
      "Latitude must be between -90 and 90.";
  }

  if (
    payload.longitude !== undefined &&
    (payload.longitude < -180 ||
      payload.longitude > 180)
  ) {
    errors.longitude =
      "Longitude must be between -180 and 180.";
  }

  if (
    payload.specialties &&
    payload.specialties.length > 12
  ) {
    errors.specialties =
      "You can add up to 12 specialties.";
  }

  if (payload.tags && payload.tags.length > 20) {
    errors.tags = "You can add up to 20 tags.";
  }

  if (
    payload.galleryUrls &&
    payload.galleryUrls.length > 10
  ) {
    errors.galleryUrls =
      "You can upload up to 10 gallery images.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function validateDirectoryReviewPayload(
  payload: Partial<DirectoryReviewPayload>
) {
  const errors: Record<string, string> = {};

  if (
    !payload.rating ||
    payload.rating < 1 ||
    payload.rating > 5
  ) {
    errors.rating = "Rating must be between 1 and 5.";
  }

  if (!payload.content?.trim()) {
    errors.content = "Review content is required.";
  } else if (payload.content.trim().length < 10) {
    errors.content =
      "Review must be at least 10 characters.";
  } else if (payload.content.trim().length > 2000) {
    errors.content =
      "Review cannot be longer than 2000 characters.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
