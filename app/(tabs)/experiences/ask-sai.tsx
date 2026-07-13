import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  History,
  Mic,
  Mic2,
  Pause,
  Plus,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Volume2,
} from "lucide-react-native";

import { ExperienceTopTabs } from "@/components/experiences";
import {
  AskDevoteeQuestionResponse,
  createDevoteeAiVoiceSocket,
  createDevoteeAiVoiceSession,
  deleteDevoteeAiConversation,
  DevoteeAiConversation,
  DevoteeAiMessage,
  DevoteeAiVoiceServerEvent,
  DevoteeAiVoiceSession,
  DevoteeAiVoiceState,
  fetchDevoteeAiConversationDetail,
  fetchDevoteeAiConversations,
  askDevoteeQuestion,
  submitDevoteeAiFeedback,
} from "@/services/devotee-ai";
import { trackProductEvent } from "@/services/product-analytics";
import type {
  SaiAudioStreamChunkEvent,
  SaiAudioStreamErrorEvent,
} from "sai-audio-stream";

const SUGGESTED_QUESTIONS = [
  "How can I keep faith during a difficult time?",
  "What is a simple Sai prayer I can do daily?",
  "How do I share my experience with other devotees?",
  "What should I do before attending a Sai event?",
];

const FULL_DUPLEX_VOICE_ENABLED =
  process.env.EXPO_PUBLIC_AI_VOICE_ENABLED === "true" ||
  process.env.EXPO_PUBLIC_VOICE_AI_ENABLED === "true";
const VOICE_PROVIDER =
  process.env.EXPO_PUBLIC_AI_VOICE_PROVIDER === "mock"
    ? "mock"
    : "elevenlabs";
const ELEVENLABS_VOICE_ID =
  process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID || undefined;

const createVoiceTurnId = () =>
  `turn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getVoiceErrorMessage = (code?: string, fallback?: string) => {
  switch (code) {
    case "UNAUTHENTICATED":
      return "Please login again to use voice guidance.";
    case "VOICE_AI_DISABLED":
      return "Voice assistant is not available right now.";
    case "VOICE_SESSION_RATE_LIMITED":
      return "Please try voice guidance again after some time.";
    case "VOICE_SESSION_ALREADY_ACTIVE":
      return "Another voice session is already active. Please stop it first.";
    case "VOICE_STT_NOT_CONFIGURED":
      return "Voice listening is not ready yet.";
    case "VOICE_TTS_NOT_CONFIGURED":
      return "Voice response is not ready yet.";
    case "VOICE_TTS_FAILED":
      return "Voice response failed. Please try again.";
    default:
      return fallback || "Voice guidance is unavailable right now.";
  }
};

async function getSpeechRecognitionModule() {
  const speechRecognition = await import("expo-speech-recognition");

  return speechRecognition.ExpoSpeechRecognitionModule;
}

async function getSaiAudioStreamModule() {
  return import("sai-audio-stream");
}

export default function AskSaiScreen() {
  const insets = useSafeAreaInsets();
  const voiceSocketRef =
    useRef<ReturnType<typeof createDevoteeAiVoiceSocket> | null>(null);
  const audioChunkSubscriptionRef = useRef<{ remove: () => void } | null>(
    null
  );
  const audioErrorSubscriptionRef = useRef<{ remove: () => void } | null>(
    null
  );
  const activeVoiceTurnIdRef = useRef<string | null>(null);
  const voiceAnswerBufferRef = useRef("");
  const voiceFinalTranscriptRef = useRef("");
  const voiceHadAudioChunksRef = useRef(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<DevoteeAiConversation[]>(
    []
  );
  const [messages, setMessages] = useState<DevoteeAiMessage[]>([]);
  const [lastResponse, setLastResponse] =
    useState<AskDevoteeQuestionResponse | null>(null);
  const [safetyNote, setSafetyNote] = useState("");
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(
    null
  );
  const [authMessage, setAuthMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSession, setVoiceSession] =
    useState<DevoteeAiVoiceSession | null>(null);
  const [voiceConnectionState, setVoiceConnectionState] =
    useState<DevoteeAiVoiceState>("idle");
  const [voiceError, setVoiceError] = useState("");
  const [activeVoiceTurnId, setActiveVoiceTurnId] =
    useState<string | null>(null);
  const [voicePartialTranscript, setVoicePartialTranscript] = useState("");
  const [voiceFinalTranscript, setVoiceFinalTranscript] = useState("");

  const canSubmit = useMemo(
    () => question.trim().length >= 3 && !isSubmitting,
    [isSubmitting, question]
  );

  const voiceAiState: DevoteeAiVoiceState = useMemo(() => {
    if (voiceError) {
      return "error";
    }

    if (voiceConnectionState !== "idle") {
      return voiceConnectionState;
    }

    if (isListening) {
      return "listening";
    }

    if (isSubmitting) {
      return "thinking";
    }

    if (isSpeaking) {
      return "speaking";
    }

    return "idle";
  }, [
    isListening,
    isSpeaking,
    isSubmitting,
    voiceConnectionState,
    voiceError,
  ]);

  const isVoiceControlActive =
    isListening || voiceConnectionState !== "idle";

  const voiceStateLabel = useMemo(() => {
    switch (voiceAiState) {
      case "connecting":
        return "Connecting";
      case "listening":
        return "Listening";
      case "thinking":
        return "Thinking";
      case "speaking":
        return "Speaking";
      case "interrupted":
        return "Interrupted";
      case "error":
        return "Needs setup";
      default:
        return "Ready";
    }
  }, [voiceAiState]);

  useEffect(() => {
    return () => {
      voiceSocketRef.current?.close();
      voiceSocketRef.current = null;
      activeVoiceTurnIdRef.current = null;
      void Speech.stop();
    };
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetchDevoteeAiConversations({
        limit: 8,
        offset: 0,
      });
      setAuthMessage("");
      setConversations(response.items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load guidance.";

      if (message.toLowerCase().includes("login again")) {
        setAuthMessage(message);
      } else {
        console.warn("[AskSai] Unable to load conversations", error);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const stopSpeech = useCallback(async () => {
    await Speech.stop();
    setIsSpeaking(false);
  }, []);

  const closeVoiceSession = useCallback(() => {
    void getSaiAudioStreamModule()
      .then((audioStream) => audioStream.stopSaiAudioStreamAsync())
      .catch(() => {
        // The native stream module may be unavailable in Expo Go.
      });

    audioChunkSubscriptionRef.current?.remove();
    audioErrorSubscriptionRef.current?.remove();
    audioChunkSubscriptionRef.current = null;
    audioErrorSubscriptionRef.current = null;
    voiceSocketRef.current?.close();
    voiceSocketRef.current = null;
    activeVoiceTurnIdRef.current = null;
    voiceAnswerBufferRef.current = "";
    voiceFinalTranscriptRef.current = "";
    voiceHadAudioChunksRef.current = false;
    setActiveVoiceTurnId(null);
    setIsListening(false);
    setVoiceConnectionState("idle");
    setVoicePartialTranscript("");
  }, []);

  const resetConversation = useCallback(() => {
    void stopSpeech();
    closeVoiceSession();
    setAnswer("");
    setConversationId(undefined);
    setFeedbackMessageId(null);
    setLastResponse(null);
    setMessages([]);
    setQuestion("");
    setSafetyNote("");
    setVoiceFinalTranscript("");
    setVoiceSession(null);
  }, [closeVoiceSession, stopSpeech]);

  const speakText = useCallback(
    async (text: string) => {
      const textToSpeak = text.trim();

      if (!textToSpeak) {
        return;
      }

      await Speech.stop();
      setIsSpeaking(true);
      Speech.speak(textToSpeak, {
        language: "en-IN",
        pitch: 1,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });

      trackProductEvent("Devotee Answer Spoken", {
        pillar: "experiences",
      });
    },
    []
  );

  const speakAnswer = useCallback(async () => {
    if (!answer.trim()) {
      return;
    }

    const speaking = await Speech.isSpeakingAsync();

    if (speaking || isSpeaking) {
      await stopSpeech();
      return;
    }

    await speakText(answer);
  }, [answer, isSpeaking, speakText, stopSpeech]);

  const handleVoiceServerEvent = useCallback(
    (event: DevoteeAiVoiceServerEvent) => {
      const eventTurnId = "turnId" in event ? event.turnId : undefined;

      if (
        eventTurnId &&
        activeVoiceTurnIdRef.current &&
        eventTurnId !== activeVoiceTurnIdRef.current
      ) {
        return;
      }

      switch (event.type) {
        case "state":
          setVoiceConnectionState(event.state);
          break;

        case "transcript_partial":
          setVoicePartialTranscript(event.text);
          setVoiceConnectionState("listening");
          break;

        case "transcript_final":
          voiceFinalTranscriptRef.current = event.text;
          setVoiceFinalTranscript(event.text);
          setVoicePartialTranscript("");
          setQuestion(event.text);
          setVoiceConnectionState("thinking");
          break;

        case "answer_delta":
          voiceAnswerBufferRef.current += event.text;
          setAnswer(voiceAnswerBufferRef.current);
          setVoiceConnectionState("speaking");
          break;

        case "audio_chunk":
          voiceHadAudioChunksRef.current = true;
          setVoiceConnectionState("speaking");
          break;

        case "stop_playback":
          void stopSpeech();
          setVoiceConnectionState("interrupted");
          break;

        case "turn_complete": {
          const finalQuestion = voiceFinalTranscriptRef.current || question;
          const finalAnswer = voiceAnswerBufferRef.current.trim();

          if (event.conversationId) {
            setConversationId(event.conversationId);
          }

          if (event.messageId) {
            setFeedbackMessageId(event.messageId);
          }

          if (finalQuestion || finalAnswer) {
            setMessages([
              ...(finalQuestion
                ? [
                    {
                      content: finalQuestion,
                      id: `${event.turnId}-user`,
                      role: "user" as const,
                    },
                  ]
                : []),
              ...(finalAnswer
                ? [
                    {
                      content: finalAnswer,
                      id: event.messageId || `${event.turnId}-assistant`,
                      latencyMs: event.latency?.totalMs,
                      role: "assistant" as const,
                    },
                  ]
                : []),
            ]);
            setLastResponse(
              finalAnswer
                ? {
                    answer: finalAnswer,
                    conversationId: event.conversationId || conversationId,
                    latencyMs: event.latency?.totalMs,
                    messageId: event.messageId,
                    model: voiceSession?.providers?.llm,
                  }
                : null
            );
          }

          if (finalAnswer && !voiceHadAudioChunksRef.current) {
            void speakText(finalAnswer);
          }

          activeVoiceTurnIdRef.current = null;
          setActiveVoiceTurnId(null);
          setVoiceConnectionState("idle");
          void loadConversations();
          break;
        }

        case "error":
          setVoiceConnectionState("error");
          setVoiceError(getVoiceErrorMessage(event.code, event.message));
          break;
      }
    },
    [
      conversationId,
      loadConversations,
      question,
      speakText,
      stopSpeech,
      voiceSession?.providers?.llm,
    ]
  );

  const submitQuestion = useCallback(
    async (
      nextQuestion?: string,
      options?: { speak?: boolean }
    ) => {
      const questionToAsk = (nextQuestion || question).trim();

      if (questionToAsk.length < 3) {
        Alert.alert(
          "Question required",
          "Please write a little more so Sai assistant can understand."
        );
        return;
      }

      try {
        await stopSpeech();
        setIsSubmitting(true);
        setAnswer("");
        setFeedbackMessageId(null);
        setLastResponse(null);
        setMessages([]);
        setSafetyNote("");
        const response = await askDevoteeQuestion({
          conversationId,
          locale: "en-IN",
          pillar: "experiences",
          question: questionToAsk,
          voice: false,
        });

        setQuestion(questionToAsk);
        setAnswer(response.answer);
        setConversationId(response.conversationId || conversationId);
        setFeedbackMessageId(response.messageId || null);
        setLastResponse(response);
        setMessages([
          {
            content: questionToAsk,
            id: `${Date.now()}-user`,
            role: "user",
          },
          {
            cached: response.cached,
            content: response.answer,
            id: response.messageId || `${Date.now()}-assistant`,
            latencyMs: response.latencyMs,
            model: response.model,
            role: "assistant",
          },
        ]);
        setSafetyNote(response.safetyNote || "");
        void loadConversations();

        if (options?.speak) {
          await speakText(response.answer);
        }

        trackProductEvent("Devotee Question Asked", {
          cached: Boolean(response.cached),
          has_answer: true,
          latency_ms: response.latencyMs ?? null,
          pillar: "experiences",
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to get reply right now.";

        if (message.toLowerCase().includes("login again")) {
          setAuthMessage(message);
        }

        Alert.alert(
          "Sai assistant",
          message
        );

        trackProductEvent("Devotee Question Asked", {
          has_answer: false,
          pillar: "experiences",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [conversationId, loadConversations, question, speakText, stopSpeech]
  );

  useEffect(() => {
    let isMounted = true;
    let resultSubscription: { remove: () => void } | undefined;
    let errorSubscription: { remove: () => void } | undefined;
    let endSubscription: { remove: () => void } | undefined;

    void getSpeechRecognitionModule()
      .then((ExpoSpeechRecognitionModule) => {
        if (!isMounted) {
          return;
        }

        resultSubscription = ExpoSpeechRecognitionModule.addListener(
          "result",
          (event: {
            isFinal: boolean;
            results?: { transcript?: string }[];
          }) => {
            const transcript = event.results?.[0]?.transcript?.trim();

            if (!transcript) {
              return;
            }

            setQuestion(transcript);
            setVoiceError("");

            if (event.isFinal) {
              setIsListening(false);
              void submitQuestion(transcript, { speak: true });
            }
          }
        );

        errorSubscription = ExpoSpeechRecognitionModule.addListener(
          "error",
          (event: { message?: string }) => {
            setIsListening(false);
            setVoiceError(
              event.message ||
                "Voice input is unavailable. Please type your question."
            );
          }
        );

        endSubscription = ExpoSpeechRecognitionModule.addListener(
          "end",
          () => {
            setIsListening(false);
          }
        );
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setVoiceError(
          "Voice input needs a custom development build. Please type your question for now."
        );
      });

    return () => {
      isMounted = false;
      resultSubscription?.remove();
      errorSubscription?.remove();
      endSubscription?.remove();
    };
  }, [submitQuestion]);

  const handleVoiceQuestion = useCallback(async () => {
    if (
      FULL_DUPLEX_VOICE_ENABLED &&
      (voiceSocketRef.current || voiceConnectionState !== "idle")
    ) {
      const activeTurnId = activeVoiceTurnIdRef.current;

      if (
        activeTurnId &&
        voiceSocketRef.current?.readyState === WebSocket.OPEN
      ) {
        voiceSocketRef.current.send({
          turnId: activeTurnId,
          type: "end_input",
        });
      }

      try {
        const audioStream = await getSaiAudioStreamModule();
        await audioStream.stopSaiAudioStreamAsync();
      } catch {
        // Native stream may already be stopped or unavailable.
      }

      setIsListening(false);
      setVoiceConnectionState("thinking");
      return;
    }

    if (isListening) {
      try {
        const ExpoSpeechRecognitionModule =
          await getSpeechRecognitionModule();
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // Nothing else to do; the fallback text is already visible.
      }

      setIsListening(false);
      return;
    }

    try {
      await stopSpeech();

      if (FULL_DUPLEX_VOICE_ENABLED) {
        setVoiceError("");
        setVoiceConnectionState("connecting");
        setVoicePartialTranscript("");
        setVoiceFinalTranscript("");
        voiceFinalTranscriptRef.current = "";
        voiceAnswerBufferRef.current = "";
        voiceHadAudioChunksRef.current = false;

        const audioStream = await getSaiAudioStreamModule();
        const permissions =
          await audioStream.requestSaiAudioStreamPermissionsAsync();

        if (!permissions.granted) {
          setVoiceConnectionState("error");
          setVoiceError(
            "Please allow microphone permission to ask Sai by voice."
          );
          return;
        }

        const session = await createDevoteeAiVoiceSession({
          conversationId,
          locale: "hi-IN",
          pillar: "experiences",
          secondaryLocale: "en-IN",
          ttsVoiceId: ELEVENLABS_VOICE_ID,
          voiceProvider: VOICE_PROVIDER,
        });

        setVoiceSession(session);
        setConversationId(session.conversationId || conversationId);

        const turnId = createVoiceTurnId();
        const audioSampleRate = session.audio?.sampleRate || 16000;
        const audioChunkMs = session.audio?.chunkMs || 100;
        const audioChannels = session.audio?.channels || 1;
        activeVoiceTurnIdRef.current = turnId;
        setActiveVoiceTurnId(turnId);

        let socketClient:
          | ReturnType<typeof createDevoteeAiVoiceSocket>
          | null = null;

        socketClient = createDevoteeAiVoiceSocket(session, {
          onClose: () => {
            void audioStream.stopSaiAudioStreamAsync().catch(() => {
              // Recording may already be stopped.
            });
            audioChunkSubscriptionRef.current?.remove();
            audioErrorSubscriptionRef.current?.remove();
            audioChunkSubscriptionRef.current = null;
            audioErrorSubscriptionRef.current = null;
            voiceSocketRef.current = null;
            activeVoiceTurnIdRef.current = null;
            setActiveVoiceTurnId(null);
            setIsListening(false);
            setVoiceConnectionState((currentState) =>
              currentState === "error" ? "error" : "idle"
            );
          },
          onError: () => {
            void audioStream.stopSaiAudioStreamAsync().catch(() => {
              // Recording may already be stopped.
            });
            setIsListening(false);
            setVoiceConnectionState("error");
            setVoiceError(
              "Voice connection failed. Please try again or type your question."
            );
          },
          onEvent: handleVoiceServerEvent,
          onOpen: () => {
            setIsListening(true);
            setVoiceConnectionState("listening");
            socketClient?.send({
              audio: {
                channels: audioChannels,
                chunkMs: audioChunkMs,
                format: "pcm_s16le",
                sampleRate: audioSampleRate,
              },
              turnId,
              type: "start",
            });

            audioChunkSubscriptionRef.current =
              audioStream.addAudioChunkListener(
                (event: SaiAudioStreamChunkEvent) => {
                  if (
                    activeVoiceTurnIdRef.current !== turnId ||
                    !socketClient ||
                    socketClient.readyState !== WebSocket.OPEN
                  ) {
                    return;
                  }

                  socketClient.send({
                    data: event.data,
                    encoding: "base64",
                    turnId,
                    type: "audio_chunk",
                  });
                }
              );

            audioErrorSubscriptionRef.current =
              audioStream.addAudioErrorListener(
                (event: SaiAudioStreamErrorEvent) => {
                  setVoiceConnectionState("error");
                  setVoiceError(event.message);
                  void audioStream.stopSaiAudioStreamAsync();
                }
              );

            void audioStream.startSaiAudioStreamAsync({
              chunkMs: audioChunkMs,
              sampleRate: audioSampleRate,
            });
          },
        });

        voiceSocketRef.current = socketClient;
        setVoiceError(
          session.providers?.stt === "mock"
            ? "Voice session connected in mock mode. Backend can now send test transcript and answer events."
            : "Voice session connected. Listening now."
        );
        trackProductEvent("Devotee Voice Session Started", {
          pillar: "experiences",
          provider: session.providers?.tts || VOICE_PROVIDER,
        });
        return;
      }

      const ExpoSpeechRecognitionModule =
        await getSpeechRecognitionModule();

      const permissions =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permissions.granted) {
        setVoiceError(
          "Please allow microphone and speech recognition permissions to ask by voice."
        );
        return;
      }

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setVoiceError(
          "Voice input is not available on this device. Please type your question."
        );
        return;
      }

      setVoiceError("");
      setIsListening(true);

      ExpoSpeechRecognitionModule.start({
        addsPunctuation: true,
        continuous: false,
        interimResults: true,
        lang: "en-IN",
        maxAlternatives: 1,
      });
    } catch {
      setIsListening(false);
      setVoiceError(
        "Voice input needs a custom development build. Please type your question for now."
      );
    }
  }, [
    conversationId,
    handleVoiceServerEvent,
    isListening,
    stopSpeech,
    voiceConnectionState,
  ]);

  const openConversation = useCallback(
    async (id: string) => {
      try {
        await stopSpeech();
        setIsLoadingHistory(true);
        const detail = await fetchDevoteeAiConversationDetail(id);
        const assistantMessage = [...detail.messages]
          .reverse()
          .find((message) => message.role === "assistant");
        const userMessage = [...detail.messages]
          .reverse()
          .find((message) => message.role === "user");

        setConversationId(detail.conversation.id);
        setMessages(detail.messages);
        setQuestion(userMessage?.content || detail.conversation.title || "");
        setAnswer(assistantMessage?.content || "");
        setFeedbackMessageId(assistantMessage?.id || null);
        setLastResponse(
          assistantMessage
            ? {
                answer: assistantMessage.content,
                cached: assistantMessage.cached,
                conversationId: detail.conversation.id,
                latencyMs: assistantMessage.latencyMs ?? undefined,
                messageId: assistantMessage.id,
                model: assistantMessage.model || undefined,
              }
            : null
        );
        setSafetyNote("");

        trackProductEvent("Devotee Conversation Opened", {
          pillar: detail.conversation.pillar || "experiences",
        });
      } catch (error) {
        Alert.alert(
          "Conversation",
          error instanceof Error
            ? error.message
            : "Unable to open this conversation."
        );
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [stopSpeech]
  );

  const deleteCurrentConversation = useCallback(() => {
    if (!conversationId) {
      return;
    }

    Alert.alert(
      "Delete conversation?",
      "This will remove this Sai assistant conversation from your history.",
      [
        { style: "cancel", text: "Cancel" },
        {
          style: "destructive",
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDevoteeAiConversation(conversationId);
              resetConversation();
              await loadConversations();
              trackProductEvent("Devotee Conversation Deleted", {
                pillar: "experiences",
              });
            } catch (error) {
              Alert.alert(
                "Delete failed",
                error instanceof Error
                  ? error.message
                  : "Unable to delete this conversation."
              );
            }
          },
        },
      ]
    );
  }, [conversationId, loadConversations, resetConversation]);

  const sendFeedback = useCallback(
    async (rating: "helpful" | "not_helpful") => {
      if (!feedbackMessageId) {
        return;
      }

      try {
        await submitDevoteeAiFeedback(feedbackMessageId, {
          rating,
          reason:
            rating === "helpful"
              ? "Helpful and easy to understand."
              : "Needs improvement for this devotee.",
        });

        Alert.alert("Thank you", "Your feedback helps improve Sai assistant.");
        trackProductEvent("Devotee Answer Feedback Sent", {
          pillar: "experiences",
          rating,
        });
      } catch (error) {
        Alert.alert(
          "Feedback failed",
          error instanceof Error
            ? error.message
            : "Unable to save feedback."
        );
      }
    },
    [feedbackMessageId]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <LinearGradient
        colors={["#FFF8E7", "#FFFFFF", "#F7FBFF"]}
        style={styles.gradient}
      >
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <View style={styles.titleRow}>
            <View style={styles.iconBubble}>
              <Sparkles color="#B45309" size={22} strokeWidth={2.4} />
            </View>
            <View style={styles.titleCopy}>
              <Text style={styles.eyebrow}>SAI GUIDANCE</Text>
              <Text style={styles.title}>Ask Sai</Text>
            </View>
          </View>

          <ExperienceTopTabs activeTab="ask" />
        </View>

        <ScrollView
          bounces
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 28 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroPanel}>
            <View style={styles.heroActions}>
              <Pressable
                onPress={resetConversation}
                style={({ pressed }) => [
                  styles.smallActionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Plus color="#B45309" size={16} strokeWidth={2.4} />
                <Text style={styles.smallActionText}>New</Text>
              </Pressable>

              {conversationId ? (
                <Pressable
                  onPress={deleteCurrentConversation}
                  style={({ pressed }) => [
                    styles.smallActionButton,
                    styles.deleteActionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Trash2 color="#B91C1C" size={16} strokeWidth={2.4} />
                  <Text style={styles.deleteActionText}>Delete</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.heroTitle}>
              Ask with faith. Receive a calm, practical reply.
            </Text>
            <Text style={styles.heroText}>
              This assistant is here for spiritual reflection and app help. For
              medical, legal, or emergency matters, please speak with the right
              professional.
            </Text>
          </View>

          {authMessage ? (
            <View style={styles.authCard}>
              <Text style={styles.authTitle}>Secure login needed</Text>
              <Text style={styles.authText}>{authMessage}</Text>
            </View>
          ) : null}

          <View style={styles.historyBlock}>
            <View style={styles.historyHeader}>
              <View style={styles.historyTitleRow}>
                <History color="#B45309" size={18} strokeWidth={2.4} />
                <Text style={styles.sectionTitle}>Recent guidance</Text>
              </View>
              {isLoadingHistory ? (
                <ActivityIndicator color="#B45309" size="small" />
              ) : null}
            </View>

            {conversations.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.historyScroller}
              >
                {conversations.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openConversation(item.id)}
                    style={({ pressed }) => [
                      styles.historyCard,
                      item.id === conversationId && styles.activeHistoryCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text numberOfLines={2} style={styles.historyTitle}>
                      {item.title || "Sai guidance"}
                    </Text>
                    <Text style={styles.historyMeta}>
                      {item.messageCount || 0} messages
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyHistoryText}>
                Your recent questions will appear here.
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.questionHeader}>
              <Text style={styles.label}>Your question</Text>
              <View
                style={[
                  styles.voiceStatePill,
                  voiceAiState === "error" && styles.voiceStatePillError,
                  voiceAiState === "listening" && styles.voiceStatePillActive,
                  voiceAiState === "speaking" && styles.voiceStatePillActive,
                  voiceAiState === "thinking" && styles.voiceStatePillThinking,
                ]}
              >
                <Text
                  style={[
                    styles.voiceStateText,
                    voiceAiState !== "idle" && styles.voiceStateTextActive,
                  ]}
                >
                  {voiceStateLabel}
                </Text>
              </View>
            </View>
            <TextInput
              multiline
              onChangeText={setQuestion}
              placeholder="Write your question here..."
              placeholderTextColor="#A8A29E"
              returnKeyType="done"
              style={styles.input}
              textAlignVertical="top"
              value={question}
            />

            {voiceError ? (
              <Text style={styles.voiceError}>{voiceError}</Text>
            ) : isListening ? (
              <Text style={styles.listeningText}>
                Listening... speak your question clearly.
              </Text>
            ) : null}

            {voicePartialTranscript || voiceFinalTranscript ? (
              <View style={styles.voiceTranscriptCard}>
                <Text style={styles.voiceTranscriptLabel}>
                  {voicePartialTranscript ? "Listening" : "Heard"}
                </Text>
                <Text style={styles.voiceTranscriptText}>
                  {voicePartialTranscript || voiceFinalTranscript}
                </Text>
              </View>
            ) : null}

            {voiceSession ? (
              <View style={styles.voiceSessionCard}>
                <Text style={styles.voiceSessionTitle}>
                  Voice session connected
                </Text>
                <Text style={styles.voiceSessionText}>
                  STT: {voiceSession.providers?.stt || "mock"} · TTS:{" "}
                  {voiceSession.providers?.tts || VOICE_PROVIDER} · Audio:{" "}
                  {voiceSession.audio?.outputFormat || "mp3_44100"}
                </Text>
                {activeVoiceTurnId ? (
                  <Text style={styles.voiceSessionText}>
                    Turn: {activeVoiceTurnId}
                  </Text>
                ) : null}
                {ELEVENLABS_VOICE_ID ? (
                  <Text style={styles.voiceSessionText}>
                    Voice ID: {ELEVENLABS_VOICE_ID}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.inputActions}>
              <Pressable
                disabled={isSubmitting}
                onPress={handleVoiceQuestion}
                style={({ pressed }) => [
                  styles.micButton,
                  isVoiceControlActive && styles.micButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Mic
                  color={isVoiceControlActive ? "#FFFFFF" : "#B45309"}
                  size={20}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.micButtonText,
                    isVoiceControlActive && styles.micButtonTextActive,
                  ]}
                >
                  {isVoiceControlActive ? "Stop" : "Speak"}
                </Text>
              </Pressable>

              <Pressable
                disabled={!canSubmit}
                onPress={() => submitQuestion()}
                style={({ pressed }) => [
                  styles.askButton,
                  pressed && styles.pressed,
                  !canSubmit && styles.disabledButton,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Send color="#FFFFFF" size={18} strokeWidth={2.4} />
                    <Text style={styles.askButtonText}>Ask now</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.suggestionsBlock}>
            <Text style={styles.sectionTitle}>Helpful starts</Text>
            {SUGGESTED_QUESTIONS.map((item) => (
              <Pressable
                disabled={isSubmitting}
                key={item}
                onPress={() => submitQuestion(item)}
                style={({ pressed }) => [
                  styles.suggestion,
                  pressed && styles.pressed,
                ]}
              >
                <Mic2 color="#B45309" size={17} strokeWidth={2.2} />
                <Text style={styles.suggestionText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {answer ? (
            <View style={styles.answerCard}>
              <View style={styles.answerHeader}>
                <View>
                  <Text style={styles.answerEyebrow}>REPLY</Text>
                  <Text style={styles.answerTitle}>Sai assistant says</Text>
                </View>
                <Pressable
                  onPress={speakAnswer}
                  style={({ pressed }) => [
                    styles.speakButton,
                    pressed && styles.pressed,
                  ]}
                >
                  {isSpeaking ? (
                    <Pause color="#FFFFFF" size={18} fill="#FFFFFF" />
                  ) : (
                    <Volume2 color="#FFFFFF" size={18} strokeWidth={2.4} />
                  )}
                </Pressable>
              </View>

              <Text style={styles.answerText}>{answer}</Text>

              <View style={styles.metaRow}>
                {typeof lastResponse?.latencyMs === "number" ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaText}>
                      {lastResponse.latencyMs} ms
                    </Text>
                  </View>
                ) : null}

                {lastResponse?.cached ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaText}>Cached</Text>
                  </View>
                ) : null}

                {lastResponse?.model ? (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaText}>
                      {lastResponse.model}
                    </Text>
                  </View>
                ) : null}
              </View>

              {safetyNote ? (
                <Text style={styles.safetyNote}>{safetyNote}</Text>
              ) : null}

              {feedbackMessageId ? (
                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackTitle}>Was this helpful?</Text>
                  <View style={styles.feedbackActions}>
                    <Pressable
                      onPress={() => sendFeedback("helpful")}
                      style={({ pressed }) => [
                        styles.feedbackButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThumbsUp color="#FFFFFF" size={16} strokeWidth={2.4} />
                      <Text style={styles.feedbackText}>Yes</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => sendFeedback("not_helpful")}
                      style={({ pressed }) => [
                        styles.feedbackButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThumbsDown color="#FFFFFF" size={16} strokeWidth={2.4} />
                      <Text style={styles.feedbackText}>No</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {messages.length > 2 ? (
            <View style={styles.threadCard}>
              <Text style={styles.threadTitle}>Conversation</Text>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === "assistant"
                      ? styles.assistantBubble
                      : styles.userBubble,
                  ]}
                >
                  <Text style={styles.messageRole}>
                    {message.role === "assistant" ? "Sai assistant" : "You"}
                  </Text>
                  <Text style={styles.messageText}>{message.content}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#FFF8E7",
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    backgroundColor: "rgba(255, 248, 231, 0.96)",
    borderBottomColor: "#F3E1BE",
    borderBottomWidth: 1,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: "#FFE8B6",
    borderRadius: 18,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  titleCopy: {
    flex: 1,
  },
  eyebrow: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  title: {
    color: "#1F2933",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  heroPanel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F3E1BE",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#92400E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  smallActionButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#F1DEC0",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallActionText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "900",
  },
  deleteActionButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  deleteActionText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "900",
  },
  heroTitle: {
    color: "#23201D",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29,
  },
  heroText: {
    color: "#6B6257",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 10,
  },
  authCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  authTitle: {
    color: "#991B1B",
    fontSize: 15,
    fontWeight: "900",
  },
  authText: {
    color: "#7F1D1D",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 5,
  },
  historyBlock: {
    marginTop: 18,
  },
  historyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  historyTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  historyScroller: {
    gap: 10,
    paddingRight: 18,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DFC6",
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 86,
    padding: 14,
    width: 210,
  },
  activeHistoryCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#B45309",
  },
  historyTitle: {
    color: "#23201D",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
  },
  historyMeta: {
    color: "#8B735F",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyHistoryText: {
    color: "#8B735F",
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F3E1BE",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  label: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  questionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  voiceStatePill: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  voiceStatePillActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#BBF7D0",
  },
  voiceStatePillThinking: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  voiceStatePillError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  voiceStateText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
  },
  voiceStateTextActive: {
    color: "#92400E",
  },
  input: {
    backgroundColor: "#FFFDF8",
    borderColor: "#F1DEC0",
    borderRadius: 18,
    borderWidth: 1,
    color: "#23201D",
    fontSize: 16,
    fontWeight: "700",
    minHeight: 136,
    paddingHorizontal: 15,
    paddingTop: 14,
  },
  voiceError: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 10,
  },
  listeningText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 18,
    marginTop: 10,
  },
  voiceTranscriptCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  voiceTranscriptLabel: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  voiceTranscriptText: {
    color: "#3F3328",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginTop: 5,
  },
  voiceSessionCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  voiceSessionTitle: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "900",
  },
  voiceSessionText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 4,
  },
  inputActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  micButton: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#F1DEC0",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 54,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  micButtonActive: {
    backgroundColor: "#B45309",
    borderColor: "#B45309",
  },
  micButtonText: {
    color: "#B45309",
    fontSize: 14,
    fontWeight: "900",
  },
  micButtonTextActive: {
    color: "#FFFFFF",
  },
  askButton: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    gap: 9,
    height: 54,
    justifyContent: "center",
  },
  askButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  disabledButton: {
    backgroundColor: "#D6B38D",
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  suggestionsBlock: {
    marginTop: 18,
  },
  sectionTitle: {
    color: "#23201D",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },
  suggestion: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DFC6",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    padding: 14,
  },
  suggestionText: {
    color: "#4B5563",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  answerCard: {
    backgroundColor: "#23201D",
    borderRadius: 24,
    marginTop: 10,
    padding: 18,
  },
  answerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  answerEyebrow: {
    color: "#FACC15",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  answerTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },
  speakButton: {
    alignItems: "center",
    backgroundColor: "#C2410C",
    borderRadius: 17,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  answerText: {
    color: "#FFF7ED",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 25,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  metaPill: {
    backgroundColor: "rgba(255, 247, 237, 0.12)",
    borderColor: "rgba(253, 230, 138, 0.24)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    color: "#FDE68A",
    fontSize: 11,
    fontWeight: "900",
  },
  safetyNote: {
    color: "#FDE68A",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 14,
  },
  feedbackRow: {
    borderTopColor: "rgba(255, 247, 237, 0.14)",
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 16,
  },
  feedbackTitle: {
    color: "#FFF7ED",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  feedbackActions: {
    flexDirection: "row",
    gap: 10,
  },
  feedbackButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  feedbackText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  threadCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DFC6",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  threadTitle: {
    color: "#23201D",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  messageBubble: {
    borderRadius: 18,
    marginBottom: 10,
    padding: 13,
  },
  assistantBubble: {
    backgroundColor: "#FFF7ED",
  },
  userBubble: {
    backgroundColor: "#F7FBFF",
  },
  messageRole: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 5,
  },
  messageText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
