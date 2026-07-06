import {
  DirectoryCreateListingPayload,
  DirectoryReviewPayload,
} from "./types";

const isValidUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const hasInvalidItems = (
  values: string[] | undefined,
  maxItemLength: number
) =>
  Boolean(
    values?.some(
      (item) =>
        item.trim().length < 1 ||
        item.trim().length > maxItemLength
    )
  );

export function validateDirectoryListingPayload(
  payload: Partial<DirectoryCreateListingPayload>
) {
  const errors: Record<string, string> = {};

  if (!payload.businessName?.trim()) {
    errors.businessName = "Business name is required.";
  } else if (payload.businessName.trim().length < 2) {
    errors.businessName =
      "Business name must be 2 to 120 characters.";
  } else if (payload.businessName.trim().length > 120) {
    errors.businessName =
      "Business name must be 2 to 120 characters.";
  }

  if (!payload.categoryId?.trim()) {
    errors.categoryId = "Please select a category.";
  }

  if (
    payload.tagline &&
    payload.tagline.trim().length > 160
  ) {
    errors.tagline =
      "Tagline can be up to 160 characters.";
  }

  if (!payload.description?.trim()) {
    errors.description = "Description is required.";
  } else if (payload.description.trim().length < 20) {
    errors.description =
      "Description must be at least 20 characters.";
  } else if (payload.description.trim().length > 3000) {
    errors.description =
      "Description can be up to 3000 characters.";
  }

  if (
    !payload.phoneNumber?.trim() &&
    !payload.whatsappNumber?.trim()
  ) {
    errors.phoneNumber =
      "Enter phone or WhatsApp number.";
  }

  if (
    payload.phoneNumber &&
    (payload.phoneNumber.trim().length < 6 ||
      payload.phoneNumber.trim().length > 30)
  ) {
    errors.phoneNumber =
      "Phone number must be 6 to 30 characters.";
  }

  if (
    payload.whatsappNumber &&
    (payload.whatsappNumber.trim().length < 6 ||
      payload.whatsappNumber.trim().length > 30)
  ) {
    errors.whatsappNumber =
      "WhatsApp number must be 6 to 30 characters.";
  }

  if (
    payload.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      payload.email.trim()
    )
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (
    payload.websiteUrl &&
    !isValidUrl(payload.websiteUrl.trim())
  ) {
    errors.websiteUrl =
      "Enter a valid website URL including https://.";
  }

  if (!payload.address?.trim()) {
    errors.address = "Address is required.";
  } else if (payload.address.trim().length < 5) {
    errors.address =
      "Address must be at least 5 characters.";
  } else if (payload.address.trim().length > 500) {
    errors.address =
      "Address can be up to 500 characters.";
  }

  if (!payload.city?.trim()) {
    errors.city = "City is required.";
  } else if (payload.city.trim().length < 2) {
    errors.city = "City must be at least 2 characters.";
  } else if (payload.city.trim().length > 100) {
    errors.city = "City can be up to 100 characters.";
  }

  if (payload.state && payload.state.trim().length > 100) {
    errors.state = "State can be up to 100 characters.";
  }

  if (payload.country && payload.country.trim().length > 100) {
    errors.country =
      "Country can be up to 100 characters.";
  }

  if (
    payload.pincode &&
    !/^\d{4,10}$/.test(payload.pincode.trim())
  ) {
    errors.pincode = "Pincode must be 4 to 10 digits.";
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
    (payload.latitude === undefined) !==
    (payload.longitude === undefined)
  ) {
    errors.latitude =
      "Latitude and longitude must be added together.";
  }

  if (
    payload.subcategories &&
    payload.subcategories.length > 12
  ) {
    errors.subcategories =
      "Add up to 12 subcategories.";
  } else if (hasInvalidItems(payload.subcategories, 40)) {
    errors.subcategories =
      "Each subcategory can be up to 40 characters.";
  }

  if (
    payload.specialties &&
    payload.specialties.length > 12
  ) {
    errors.specialties =
      "You can add up to 12 specialties.";
  } else if (hasInvalidItems(payload.specialties, 40)) {
    errors.specialties =
      "Each specialty can be up to 40 characters.";
  }

  if (payload.tags && payload.tags.length > 20) {
    errors.tags = "You can add up to 20 tags.";
  } else if (hasInvalidItems(payload.tags, 40)) {
    errors.tags = "Each tag can be up to 40 characters.";
  }

  if (
    payload.serviceAreas &&
    payload.serviceAreas.length > 20
  ) {
    errors.serviceAreas =
      "Add up to 20 service areas.";
  } else if (hasInvalidItems(payload.serviceAreas, 80)) {
    errors.serviceAreas =
      "Each service area can be up to 80 characters.";
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
