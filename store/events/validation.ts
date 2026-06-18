import {
  CreateEventPayload,
  EventRecurrenceFrequency,
  EventType,
  SaiEvent,
  UpdateEventPayload,
} from "./types";

export const EVENT_TYPES: EventType[] = [
  "bhajan",
  "pooja",
  "seva",
  "medical",
  "satsang",
  "darshan",
  "general",
];

export const EVENT_RECURRENCE_FREQUENCIES: EventRecurrenceFrequency[] =
  ["daily", "weekly", "monthly"];

export const EVENT_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
];

const MAX_EVENT_MEDIA_FILES = 10;
const MAX_EVENT_MEDIA_FILE_SIZE =
  150 * 1024 * 1024;

export type EventValidationResult = {
  errors: Record<string, string>;
  isValid: boolean;
};

export type EventMediaFileInput = {
  fileSize?: number | null;
  mimeType?: string | null;
  name?: string | null;
  size?: number | null;
  type?: string | null;
  uri?: string;
};

const success = (): EventValidationResult => ({
  errors: {},
  isValid: true,
});

const result = (
  errors: Record<string, string>
): EventValidationResult => ({
  errors,
  isValid: Object.keys(errors).length === 0,
});

const hasText = (
  value: unknown,
  minLength: number
) =>
  typeof value === "string" &&
  value.trim().length >= minLength;

const isValidDateTime = (value: unknown) =>
  typeof value === "string" &&
  Number.isFinite(Date.parse(value));

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
};

export const isEventType = (
  value: unknown
): value is EventType =>
  typeof value === "string" &&
  EVENT_TYPES.includes(value as EventType);

export const isEventRecurrenceFrequency = (
  value: unknown
): value is EventRecurrenceFrequency =>
  typeof value === "string" &&
  EVENT_RECURRENCE_FREQUENCIES.includes(
    value as EventRecurrenceFrequency
  );

const isPositiveInteger = (value: unknown) =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 1;

const validateRecurrence = (
  payload: Partial<CreateEventPayload>,
  errors: Record<string, string>
) => {
  const recurrence = payload.recurrence;

  if (recurrence === undefined) {
    return;
  }

  if (!recurrence || typeof recurrence !== "object") {
    errors.recurrence =
      "Recurring event details are invalid.";
    return;
  }

  if (
    !isEventRecurrenceFrequency(
      recurrence.frequency
    )
  ) {
    errors.recurrenceFrequency =
      "Choose daily, weekly, or monthly recurrence.";
  }

  if (
    recurrence.interval !== undefined &&
    !isPositiveInteger(recurrence.interval)
  ) {
    errors.recurrenceInterval =
      "Recurring interval must be at least 1.";
  }

  if (
    recurrence.count !== undefined &&
    !isPositiveInteger(recurrence.count)
  ) {
    errors.recurrenceCount =
      "Recurring count must be at least 1.";
  }

  if (
    recurrence.until !== undefined &&
    !isValidDateTime(recurrence.until)
  ) {
    errors.recurrenceUntil =
      "Recurring end date must be valid.";
  }

  if (
    isValidDateTime(payload.startAt) &&
    isValidDateTime(recurrence.until) &&
    Date.parse(recurrence.until as string) <=
      Date.parse(payload.startAt as string)
  ) {
    errors.recurrenceUntil =
      "Recurring end date must be after the start date.";
  }
};

const validateSharedEventFields = (
  payload: Partial<CreateEventPayload>,
  errors: Record<string, string>,
  options: {
    requireCoreFields: boolean;
  }
) => {
  const required = options.requireCoreFields;

  if (
    (required || payload.title !== undefined) &&
    !hasText(payload.title, 3)
  ) {
    errors.title =
      "Title must be at least 3 characters.";
  }

  if (
    (required ||
      payload.description !== undefined) &&
    !hasText(payload.description, 10)
  ) {
    errors.description =
      "Description must be at least 10 characters.";
  }

  if (
    (required || payload.address !== undefined) &&
    !hasText(payload.address, 5)
  ) {
    errors.address =
      "Address must be at least 5 characters.";
  }

  if (
    (required || payload.startAt !== undefined) &&
    !isValidDateTime(payload.startAt)
  ) {
    errors.startAt =
      "Start date and time is required.";
  }

  if (
    (required || payload.endAt !== undefined) &&
    !isValidDateTime(payload.endAt)
  ) {
    errors.endAt =
      "End date and time is required.";
  }

  if (
    isValidDateTime(payload.startAt) &&
    isValidDateTime(payload.endAt) &&
    Date.parse(payload.endAt as string) <
      Date.parse(payload.startAt as string)
  ) {
    errors.endAt =
      "End date cannot be before start date.";
  }

  if (
    (required ||
      payload.latitude !== undefined) &&
    (typeof payload.latitude !== "number" ||
      payload.latitude < -90 ||
      payload.latitude > 90)
  ) {
    errors.latitude =
      "Latitude must be between -90 and 90.";
  }

  if (
    (required ||
      payload.longitude !== undefined) &&
    (typeof payload.longitude !== "number" ||
      payload.longitude < -180 ||
      payload.longitude > 180)
  ) {
    errors.longitude =
      "Longitude must be between -180 and 180.";
  }

  if (
    payload.type !== undefined &&
    !isEventType(payload.type)
  ) {
    errors.type =
      "Choose a valid event type.";
  }

  if (
    payload.bannerUrl &&
    !isValidUrl(payload.bannerUrl)
  ) {
    errors.bannerUrl =
      "Banner URL must be a valid URL.";
  }

  if (
    payload.timezone !== undefined &&
    !hasText(payload.timezone, 3)
  ) {
    errors.timezone =
      "Timezone must be at least 3 characters.";
  }

  (
    [
      "venueName",
      "city",
      "state",
      "country",
    ] as const
  ).forEach((field) => {
    const value = payload[field];

    if (
      value !== undefined &&
      value !== null &&
      !hasText(value, 2)
    ) {
      errors[field] =
        `${field} must be at least 2 characters.`;
    }
  });

  validateRecurrence(payload, errors);
};

export function validateCreateEventPayload(
  payload: CreateEventPayload
) {
  const errors: Record<string, string> = {};

  validateSharedEventFields(payload, errors, {
    requireCoreFields: true,
  });

  return result(errors);
}

export function validateUpdateEventPayload(
  payload: UpdateEventPayload,
  currentEvent?: SaiEvent | null
) {
  const errors: Record<string, string> = {};
  const { id, ...updates } = payload;

  if (!id) {
    errors.id = "Event id is required.";
  }

  if (Object.keys(updates).length === 0) {
    errors.payload =
      "At least one event field is required.";
  }

  validateSharedEventFields(updates, errors, {
    requireCoreFields: false,
  });

  const effectiveStartAt =
    updates.startAt ||
    currentEvent?.startAt;
  const effectiveEndAt =
    updates.endAt || currentEvent?.endAt;

  if (
    isValidDateTime(effectiveStartAt) &&
    isValidDateTime(effectiveEndAt) &&
    Date.parse(effectiveEndAt as string) <
      Date.parse(effectiveStartAt as string)
  ) {
    errors.endAt =
      "End date cannot be before start date.";
  }

  return result(errors);
}

export function validateEventCommentContent(
  content: string
) {
  const trimmed = content.trim();

  if (!trimmed.length) {
    return result({
      content: "Comment cannot be empty.",
    });
  }

  if (trimmed.length > 1000) {
    return result({
      content:
        "Comment must be 1000 characters or less.",
    });
  }

  return success();
}

export function validateEventMediaFile(
  file: EventMediaFileInput
) {
  const mimeType =
    file.mimeType || file.type || "";
  const size =
    file.fileSize || file.size || 0;

  if (
    !EVENT_MEDIA_MIME_TYPES.includes(mimeType)
  ) {
    return result({
      mimeType:
        "File must be jpg, png, webp, mp4, mov, mp3, m4a, wav, or webm.",
    });
  }

  if (
    size > 0 &&
    size > MAX_EVENT_MEDIA_FILE_SIZE
  ) {
    return result({
      size: "File must be 150MB or smaller.",
    });
  }

  return success();
}

export function validateEventMediaFiles(
  files: EventMediaFileInput[]
) {
  const errors: Record<string, string> = {};

  if (!files.length) {
    errors.files = "At least one file is required.";
  }

  if (files.length > MAX_EVENT_MEDIA_FILES) {
    errors.files =
      "You can upload up to 10 files.";
  }

  files.forEach((file, index) => {
    const validation =
      validateEventMediaFile(file);

    if (!validation.isValid) {
      errors[`file${index}`] =
        Object.values(validation.errors)[0];
    }
  });

  return result(errors);
}

export const getFirstValidationError = (
  validation: EventValidationResult
) =>
  Object.values(validation.errors)[0] ||
  "Please check the event form.";
