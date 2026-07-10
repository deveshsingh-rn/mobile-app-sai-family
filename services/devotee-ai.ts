import axios from "axios";

import { apiClient } from "./api";

const DEFAULT_DEVOTEE_AI_ENDPOINT = "/api/ai/devotee-question";

export type AskDevoteeQuestionPayload = {
  conversationId?: string;
  locale?: string;
  question: string;
  pillar?: "experiences" | "events" | "directory" | "sangha";
  voice?: boolean;
};

export type AskDevoteeQuestionResponse = {
  answer: string;
  cached?: boolean;
  conversationId?: string;
  latencyMs?: number;
  messageId?: string;
  model?: string;
  safetyNote?: string;
};

type BackendDevoteeAiResponse = {
  answer?: string;
  cached?: boolean;
  conversationId?: string;
  latencyMs?: number;
  messageId?: string;
  model?: string;
  reply?: string;
  safetyNote?: string;
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
    if (error.response?.status === 404) {
      return "The Sai assistant API is not ready on the backend yet.";
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

export async function askDevoteeQuestion(
  payload: AskDevoteeQuestionPayload
): Promise<AskDevoteeQuestionResponse> {
  const question = payload.question.trim();

  if (!question) {
    throw new Error("Please write your question first.");
  }

  try {
    const { data } =
      await apiClient.post<BackendDevoteeAiResponse>(
        getAiEndpoint(),
        {
          conversationId: payload.conversationId,
          locale: payload.locale || "en-IN",
          pillar: payload.pillar || "experiences",
          question,
          voice: payload.voice || false,
        }
      );

    const answer =
      data.answer ||
      data.reply ||
      data.text ||
      data.message;

    if (!answer) {
      throw new Error("Sai assistant did not return an answer.");
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
