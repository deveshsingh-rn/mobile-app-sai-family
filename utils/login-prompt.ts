/**
 * Guest mode: what the "log in to continue" sheet says for each action. Pure (node-tested).
 */
export type AccountAction =
  | "like"
  | "comment"
  | "repost"
  | "bookmark"
  | "report"
  | "block"
  | "post"
  | "rsvp"
  | "event"
  | "listing"
  | "review"
  | "enquiry"
  | "connect"
  | "message"
  | "profile"
  | "ai_limit"
  | "default";

type Copy = { title: string; message: string };

const COPY: Record<AccountAction, Copy> = {
  ai_limit: {
    message: "You have used today's free questions. Log in to ask Sai up to 50 questions every day.",
    title: "Keep talking with Sai",
  },
  block: { message: "Log in to block devotees and control what you see.", title: "Log in to continue" },
  bookmark: { message: "Log in to save posts and find them again anytime.", title: "Save this for later" },
  comment: { message: "Log in to share your thoughts with the Sai Family.", title: "Join the conversation" },
  connect: { message: "Log in to connect with other devotees.", title: "Connect with devotees" },
  default: { message: "Create a free account or log in to continue.", title: "Log in to continue" },
  enquiry: { message: "Log in to contact this listing.", title: "Log in to send an enquiry" },
  event: { message: "Log in to create and manage events.", title: "Create your event" },
  like: { message: "Log in to like posts and show your love for Sai's leelas.", title: "Like this post" },
  listing: { message: "Log in to add your business or service to the directory.", title: "List your business" },
  message: { message: "Log in to send messages to other devotees.", title: "Send a message" },
  post: { message: "Create a free account to share your experience with the Sai Family.", title: "Share your experience" },
  profile: { message: "Create your free devotee account to get your Sai Family ID.", title: "Your Sai Family profile" },
  repost: { message: "Log in to share this post to your feed.", title: "Share to your feed" },
  report: { message: "Log in to report posts that break the community rules.", title: "Log in to report" },
  review: { message: "Log in to write a review.", title: "Share your review" },
  rsvp: { message: "Log in to join this event and get reminders.", title: "Join this event" },
};

export function loginPromptCopy(action: AccountAction | undefined): Copy {
  return COPY[action ?? "default"] ?? COPY.default;
}

/** Backend error codes that mean "a guest needs an account for this". */
export function accountActionForErrorCode(status: number | undefined, code: string | undefined): AccountAction | null {
  if (status === 403 && code === "ACCOUNT_REQUIRED") return "default";
  if (code === "GUEST_AI_LIMIT" || code === "GUEST_AI_BUDGET" || code === "GUEST_AI_UNAVAILABLE") return "ai_limit";
  return null;
}
