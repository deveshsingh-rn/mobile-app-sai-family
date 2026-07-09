import axios from "axios";

import { apiClient } from "./api";

const DEFAULT_DEVOTEE_AI_ENDPOINT = "/api/ai/devotee-question";

export type AskDevoteeQuestionPayload = {
  question: string;
  pillar?: "experiences" | "events" | "directory" | "sangha";
};

export type AskDevoteeQuestionResponse = {
  answer: string;
  conversationId?: string;
  safetyNote?: string;
};

type BackendDevoteeAiResponse = {
  answer?: string;
  reply?: string;
  text?: string;
  message?: string;
  conversationId?: string;
  safetyNote?: string;
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
          pillar: payload.pillar || "experiences",
          question,
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
      conversationId: data.conversationId,
      safetyNote: data.safetyNote,
    };
  } catch (error) {
    throw new Error(getAiErrorMessage(error));
  }
}
