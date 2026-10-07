const DEFAULT_PUBLIC_URL = "https://saifamily.sustaininsight.com";

type ExperienceShareDetails = {
  authorName?: string | null;
  content?: string | null;
  experienceId: string;
};

function publicBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_EXPERIENCE_SHARE_BASE_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
    DEFAULT_PUBLIC_URL
  ).replace(/\/$/, "");
}

function cleanShareText(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function truncate(value: string, maximumLength: number) {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength - 1).trimEnd()}…`;
}

export function createExperiencePublicShareLink(experienceId: string) {
  return `${publicBaseUrl()}/experiences/${encodeURIComponent(experienceId)}`;
}

export function createExperienceShareMessage({
  authorName,
  content,
  experienceId,
}: ExperienceShareDetails) {
  const safeAuthor = cleanShareText(authorName) || "A Sai devotee";
  const safeContent = truncate(cleanShareText(content), 220);
  const publicUrl = createExperiencePublicShareLink(experienceId);

  return [
    `${safeAuthor} shared an experience with Sai Family`,
    safeContent,
    "",
    "View the complete experience:",
    publicUrl,
  ]
    .filter(Boolean)
    .join("\n");
}
