import axios from "axios";

import { hasSavedAuthAccessToken } from "./auth";
import { apiClient } from "./api";

const DEFAULT_DEVOTEE_AI_ENDPOINT = "/api/ai/devotee-question";
const AI_BASE_PATH = "/api/ai";
const AI_QUESTION_TIMEOUT_MS = 180000;
const AUTH_REQUIRED_MESSAGE =
  "Please login again to use Ask Sai. This feature needs a secure login session.";

export type DevoteeAiPillar =
  | "experiences"
  | "events"
  | "directory"
  | "sangha";

export type AskDevoteeQuestionPayload = {
  conversationId?: string;
  locale?: string;
  question: string;
  pillar?: DevoteeAiPillar;
  voice?: boolean;
};

export type AskDevoteeQuestionResponse = {
  answer: string;
  cached?: boolean;
  conversationId?: string;
  latencyMs?: number | null;
  messageId?: string;
  model?: string | null;
  safetyNote?: string | null;
};

export type DevoteeAiConversation = {
  id: string;
  title: string;
  pillar?: DevoteeAiPillar | string;
  lastMessageAt?: string;
  messageCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type DevoteeAiMessage = {
  id: string;
  cached?: boolean;
  content: string;
  createdAt?: string;
  latencyMs?: number | null;
  model?: string | null;
  role: "user" | "assistant";
  safetyStatus?: string | null;
};

export type DevoteeAiPagination = {
  hasMore?: boolean;
  limit: number;
  offset: number;
  total?: number;
};

export type DevoteeAiConversationListResponse = {
  items: DevoteeAiConversation[];
  pagination?: DevoteeAiPagination;
};

export type DevoteeAiConversationDetailResponse = {
  conversation: DevoteeAiConversation;
  messages: DevoteeAiMessage[];
};

export type DevoteeAiFeedbackRating =
  | "helpful"
  | "not_helpful";

export type DevoteeAiFeedback = {
  id: string;
  createdAt?: string;
  messageId: string;
  rating: DevoteeAiFeedbackRating;
  reason?: string | null;
};

export type DevoteeAiVoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "error";

export type CreateDevoteeAiVoiceSessionPayload = {
  conversationId?: string;
  locale?: "hi-IN" | "en-IN";
  pillar?: DevoteeAiPillar;
  secondaryLocale?: "hi-IN" | "en-IN";
  ttsVoiceId?: string;
  voiceProvider?: "elevenlabs" | "mock";
};

export type DevoteeAiVoiceSession = {
  audio?: {
    channels: number;
    chunkMs: number;
    inputFormat: "pcm_s16le";
    outputFormat?: "mp3_44100" | string;
    sampleRate: number;
  };
  conversationId?: string;
  expiresAt: string;
  limits?: {
    bargeInEnabled?: boolean;
    maxSessionSeconds?: number;
    maxTurnsPerSession?: number;
  };
  providers?: {
    llm?: string;
    stt?: string;
    tts?: string;
  };
  sessionId: string;
  sessionToken: string;
  status?: "active" | "ended" | "failed" | string;
  webSocketUrl: string;
};

export type DevoteeAiVoiceClientEvent =
  | {
      audio: {
        channels: number;
        chunkMs: number;
        format: "pcm_s16le";
        sampleRate: number;
      };
      turnId: string;
      type: "start";
    }
  | {
      data: string;
      encoding: "base64";
      turnId: string;
      type: "audio_chunk";
    }
  | {
      turnId: string;
      type: "end_input";
    }
  | {
      turnId: string;
      type: "barge_in";
    };

export type DevoteeAiVoiceServerEvent =
  | {
      sessionId: string;
      state: DevoteeAiVoiceState;
      turnId: string;
      type: "state";
    }
  | {
      text: string;
      turnId: string;
      type: "transcript_partial" | "transcript_final" | "answer_delta";
    }
  | {
      data: string;
      encoding: "base64";
      format: "mp3_44100";
      turnId: string;
      type: "audio_chunk";
    }
  | {
      reason?: string;
      turnId: string;
      type: "stop_playback";
    }
  | {
      conversationId?: string;
      latency?: {
        firstAudioMs?: number;
        firstTokenMs?: number;
        speechEndpointMs?: number;
        totalMs?: number;
      };
      messageId?: string;
      turnId: string;
      type: "turn_complete";
    }
  | {
      code?: string;
      message: string;
      turnId?: string;
      type: "error";
    };

type BackendDevoteeAiResponse = {
  answer?: string;
  cached?: boolean;
  conversationId?: string;
  latencyMs?: number | null;
  messageId?: string;
  model?: string | null;
  reply?: string;
  safetyNote?: string | null;
  text?: string;
  message?: string;
};

function getAiEndpoint() {
  return (
    process.env.EXPO_PUBLIC_AI_ASSISTANT_ENDPOINT ||
    DEFAULT_DEVOTEE_AI_ENDPOINT
  );
}

function getAiErrorMessage(error: unknown) {
  if (axios.isAxiosError<any>(error)) {
    if (error.response?.status === 401) {
      return AUTH_REQUIRED_MESSAGE;
    }

    if (error.response?.status === 404) {
      return "The Sai assistant API is not ready on the backend yet.";
    }

    if (
      error.response?.status === 504 ||
      error.response?.data?.error?.code === "AI_TIMEOUT"
    ) {
      return "Sai assistant is taking longer than usual. Please try again in a moment, or ask a shorter question.";
    }

    if (error.code === "ECONNABORTED") {
      return "Sai assistant took too long to respond. Please check your connection and try again.";
    }

    return (
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Unable to get Sai assistant reply."
    );
  }

  return error instanceof Error
    ? error.message
    : "Unable to get Sai assistant reply.";
}

async function assertAiAuthSession() {
  const hasToken = await hasSavedAuthAccessToken();

  if (!hasToken) {
    throw new Error(AUTH_REQUIRED_MESSAGE);
  }
}

export async function askDevoteeQuestion(
  payload: AskDevoteeQuestionPayload
): Promise<AskDevoteeQuestionResponse> {
  const question = payload.question.trim();

  if (!question) {
    throw new Error("Please write your question first.");
  }

  try {
    await assertAiAuthSession();

    const { data } =
      await apiClient.post<BackendDevoteeAiResponse>(
        getAiEndpoint(),
        {
          conversationId: payload.conversationId,
          locale: payload.locale || "en-IN",
          pillar: payload.pillar || "experiences",
          question,
          voice: payload.voice || false,
        },
        {
          timeout: AI_QUESTION_TIMEOUT_MS,
        }
      );

    const answer =
      data.answer ||
      data.reply ||
      data.text ||
      data.message;

    if (!answer) {
      throw new Error(
        "Sai assistant could not prepare an answer right now. Please try again in a moment."
      );
    }

    return {
      answer,
      cached: data.cached,
      conversationId: data.conversationId,
      latencyMs: data.latencyMs,
      messageId: data.messageId,
      model: data.model,
      safetyNote: data.safetyNote,
    };
  } catch (error) {
    throw new Error(getAiErrorMessage(error));
  }
}

export async function fetchDevoteeAiConversations(params?: {
  limit?: number;
  offset?: number;
}): Promise<DevoteeAiConversationListResponse> {
  try {
    await assertAiAuthSession();

    const { data } =
      await apiClient.get<DevoteeAiConversationListResponse>(
        `${AI_BASE_PATH}/devotee-conversations`,
        {
          params: {
            limit: params?.limit || 20,
            offset: params?.offset || 0,
          },
        }
      );

    return {
      items: Array.isArray(data.items) ? data.items : [],
      pagination: data.pagination,
    };
  } catch (error) {
    throw new Error(getAiErrorMessage(error));
  }
}

export async function fetchDevoteeAiConversationDetail(
  conversationId: string
): Promise<DevoteeAiConversationDetailResponse> {
  if (!conversationId) {
    throw new Error("Conversation id is required.");
  }

  try {
    await assertAiAuthSession();

    const { data } =
      await apiClient.get<DevoteeAiConversationDetailResponse>(
        `${AI_BASE_PATH}/devotee-conversations/${conversationId}`
      );

    return {
      conversation: data.conversation,
      messages: Array.isArray(data.messages) ? data.messages : [],
    };
  } catch (error) {
    throw new Error(getAiErrorMessage(error));
  }
}

export async function deleteDevoteeAiConversation(
  conversationId: string
) {
  if (!conversationId) {
    throw new Error("Conversation id is required.");
  }

  try {
    await assertAiAuthSession();

    const { data } = await apiClient.delete<{
      id?: string;
      success?: boolean;
    }>(`${AI_BASE_PATH}/devotee-conversations/${conversationId}`);

    return data;
  } catch (error) {
    throw new Error(getAiErrorMessage(error));
  }
}

export async function submitDevoteeAiFeedback(
  messageId: string,
  payload: {
    rating: DevoteeAiFeedbackRating;
    reason?: string;
  }
): Promise<DevoteeAiFeedback> {
  if (!messageId) {
    throw new Error("AI answer id is required.");
  }

  try {
    await assertAiAuthSession();

    const { data } = await apiClient.post<{
      feedback: DevoteeAiFeedback;
    }>(
      `${AI_BASE_PATH}/devotee-messages/${messageId}/feedback`,
      {
        rating: payload.rating,
        reason: payload.reason,
      }
    );

    return data.feedback;
  } catch (error) {
    throw new Error(getAiErrorMessage(error));
  }
}

export async function createDevoteeAiVoiceSession(
  payload?: CreateDevoteeAiVoiceSessionPayload
): Promise<DevoteeAiVoiceSession> {
  try {
    await assertAiAuthSession();

    const { data } = await apiClient.post<DevoteeAiVoiceSession>(
      `${AI_BASE_PATH}/voice/sessions`,
      {
        locale: payload?.locale || "hi-IN",
        pillar: payload?.pillar || "experiences",
        secondaryLocale: payload?.secondaryLocale || "en-IN",
        ttsVoiceId: payload?.ttsVoiceId,
        voiceProvider: payload?.voiceProvider || "elevenlabs",
        conversationId: payload?.conversationId,
      }
    );

    return data;
  } catch (error) {
    throw new Error(getAiErrorMessage(error));
  }
}

export function createDevoteeAiVoiceSocket(
  session: DevoteeAiVoiceSession,
  handlers: {
    onClose?: () => void;
    onError?: (error: Event) => void;
    onEvent?: (event: DevoteeAiVoiceServerEvent) => void;
    onOpen?: () => void;
  }
) {
  const socket = new WebSocket(session.webSocketUrl);

  socket.onopen = () => {
    handlers.onOpen?.();
  };

  socket.onclose = () => {
    handlers.onClose?.();
  };

  socket.onerror = (error) => {
    handlers.onError?.(error);
  };

  socket.onmessage = (message) => {
    if (typeof message.data !== "string") {
      return;
    }

    try {
      handlers.onEvent?.(
        JSON.parse(message.data) as DevoteeAiVoiceServerEvent
      );
    } catch {
      handlers.onEvent?.({
        message: "Voice assistant sent an unreadable event.",
        type: "error",
      });
    }
  };

  return {
    close: () => socket.close(),
    get readyState() {
      return socket.readyState;
    },
    send: (event: DevoteeAiVoiceClientEvent) => {
      socket.send(JSON.stringify(event));
    },
    socket,
  };
}
