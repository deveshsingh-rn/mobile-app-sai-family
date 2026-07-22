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
  Modal,
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
  RotateCcw,
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
  endActiveDevoteeAiVoiceSessions,
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
const VOICE_PROVIDER: "elevenlabs" | "mock" =
  process.env.EXPO_PUBLIC_AI_VOICE_PROVIDER === "mock"
    ? "mock"
    : "elevenlabs";
const ELEVENLABS_VOICE_ID =
  process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID || undefined;
const VOICE_DEBUG_ENABLED =
  __DEV__ || FULL_DUPLEX_VOICE_ENABLED;

const logVoiceDebug = (message: string, payload?: Record<string, unknown>) => {
  if (!VOICE_DEBUG_ENABLED) {
    return;
  }

  if (payload) {
    console.log(`[AskSaiVoice] ${message}`, payload);
    return;
  }

  console.log(`[AskSaiVoice] ${message}`);
};

const logVoiceProductionCheck = (
  message: string,
  payload?: Record<string, unknown>
) => {
  console.log(`[AskSaiVoiceProd] ${message}`, payload || {});
};

const createVoiceTurnId = () =>
  `turn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getSpeechLanguage = () => "hi-IN";

const selectBestSpeechTranscript = (
  results?: { transcript?: string }[]
) => {
  const candidates = (results || [])
    .map((result) => result.transcript?.trim())
    .filter((transcript): transcript is string => Boolean(transcript));

  if (candidates.length === 0) {
    return "";
  }

  return candidates.sort((first, second) => second.length - first.length)[0];
};

const base64ToArrayBuffer = (base64: string) => {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
};

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
  const speechRecognitionModule =
    speechRecognition.ExpoSpeechRecognitionModule;

  if (!speechRecognitionModule) {
    throw new Error(
      "Speech recognition module is unavailable in this build."
    );
  }

  return speechRecognitionModule;
}

async function getSaiAudioStreamModule() {
  return import("sai-audio-stream");
}

type SaiAudioStreamModuleApi = Awaited<
  ReturnType<typeof getSaiAudioStreamModule>
>;

type PendingVoiceStartContext = {
  audioChannels: number;
  audioChunkMs: number;
  audioSampleRate: number;
  audioStream: SaiAudioStreamModuleApi;
  hasStarted: boolean;
  socketClient: ReturnType<typeof createDevoteeAiVoiceSocket>;
  turnId: string;
};

export default function AskSaiScreen() {
  const insets = useSafeAreaInsets();
  const voiceSocketRef =
    useRef<ReturnType<typeof createDevoteeAiVoiceSocket> | null>(null);
  const pendingVoiceStartRef = useRef<PendingVoiceStartContext | null>(null);
  const voiceConnectedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const audioChunkSubscriptionRef = useRef<{ remove: () => void } | null>(
    null
  );
  const audioErrorSubscriptionRef = useRef<{ remove: () => void } | null>(
    null
  );
  const activeVoiceTurnIdRef = useRef<string | null>(null);
  const voiceAnswerBufferRef = useRef("");
  const voiceAudioChunkPartsRef = useRef<string[]>([]);
  const voiceChunkCountRef = useRef(0);
  const voiceFallbackAudioFileUriRef = useRef<string | null>(null);
  const voiceFallbackAudioPlayerRef = useRef<{
    pause: () => void;
    play: () => void;
    remove?: () => void;
    seekTo?: (seconds: number) => Promise<void> | void;
  } | null>(null);
  const voiceFinalTranscriptRef = useRef("");
  const voiceHadAudioChunksRef = useRef(false);
  const voiceLivePlaybackFailedRef = useRef(false);
  const waitingToneTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const voicePlaybackCompletionTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceAudioContextRef = useRef<{
    close: () => Promise<void>;
    decodeAudioData: (data: ArrayBuffer) => Promise<unknown>;
    destination: unknown;
    resume: () => Promise<void>;
  } | null>(null);
  const voiceAudioQueueRef = useRef<{
    clearBuffers: () => void;
    enqueueBuffer: (buffer: unknown) => string;
    stop: () => void;
    start: (when?: number, offset?: number) => void;
  } | null>(null);
  const voiceAudioDecodeQueueRef = useRef(Promise.resolve());
  const voiceTimingRef = useRef<{
    connectedAt?: number;
    firstAnswerAt?: number;
    firstAudioChunkAt?: number;
    firstMicChunkAt?: number;
    firstTranscriptAt?: number;
    sessionCreatedAt?: number;
    socketOpenedAt?: number;
    startedAt?: number;
    tapAt?: number;
  }>({});
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
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const [isWaitingToneActive, setIsWaitingToneActive] = useState(false);
  const [voiceSession, setVoiceSession] =
    useState<DevoteeAiVoiceSession | null>(null);
  const [voiceConnectionState, setVoiceConnectionState] =
    useState<DevoteeAiVoiceState>("idle");
  const voiceConnectionStateRef = useRef<DevoteeAiVoiceState>("idle");
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

  useEffect(() => {
    voiceConnectionStateRef.current = voiceConnectionState;
  }, [voiceConnectionState]);

  const voiceStateLabel = useMemo(() => {
    switch (voiceAiState) {
      case "connected":
        return "Connected";
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

  const stopVoicePlayback = useCallback(async () => {
    voiceAudioDecodeQueueRef.current = Promise.resolve();

    try {
      voiceFallbackAudioPlayerRef.current?.pause();
      voiceFallbackAudioPlayerRef.current?.remove?.();
    } catch {
      // Cached playback may already be released.
    }

    voiceFallbackAudioPlayerRef.current = null;

    if (voicePlaybackCompletionTimerRef.current) {
      clearTimeout(voicePlaybackCompletionTimerRef.current);
      voicePlaybackCompletionTimerRef.current = null;
    }

    const cachedAudioUri = voiceFallbackAudioFileUriRef.current;
    voiceFallbackAudioFileUriRef.current = null;

    if (cachedAudioUri) {
      void import("expo-file-system/legacy")
        .then((FileSystem) =>
          FileSystem.deleteAsync(cachedAudioUri, {
            idempotent: true,
          })
        )
        .catch(() => {
          // Cache cleanup is best effort.
        });
    }

    try {
      voiceAudioQueueRef.current?.clearBuffers();
      voiceAudioQueueRef.current?.stop();
    } catch {
      // Native queue may already be stopped.
    }

    voiceAudioQueueRef.current = null;

    if (voiceAudioContextRef.current) {
      try {
        await voiceAudioContextRef.current.close();
      } catch {
        // Context may already be closed during route cleanup.
      }
    }

    voiceAudioContextRef.current = null;
    setIsSpeaking(false);
  }, []);

  const stopWaitingTone = useCallback(async () => {
    if (waitingToneTimerRef.current) {
      clearInterval(waitingToneTimerRef.current);
      waitingToneTimerRef.current = null;
    }

    setIsWaitingToneActive(false);

    try {
      await Speech.stop();
    } catch {
      // Waiting tone may already be stopped.
    }
  }, []);

  const startWaitingTone = useCallback(() => {
    if (waitingToneTimerRef.current) {
      return;
    }

    setIsWaitingToneActive(true);

    const playTone = () => {
      Speech.speak("Om Sai Ram", {
        language: "hi-IN",
        pitch: 0.82,
        rate: Platform.OS === "ios" ? 0.38 : 0.62,
        volume: 0.35,
      });
    };

    playTone();
    waitingToneTimerRef.current = setInterval(playTone, 3200);

    logVoiceDebug("Waiting tone started");
  }, []);

  const ensureVoicePlaybackQueue = useCallback(async () => {
    if (!voiceAudioContextRef.current || !voiceAudioQueueRef.current) {
      const { AudioContext } = await import("react-native-audio-api");
      const audioContext = new AudioContext();
      const queueSource = audioContext.createBufferQueueSource({
        pitchCorrection: false,
      }) as unknown as NonNullable<typeof voiceAudioQueueRef.current> & {
        connect: (destination: unknown) => unknown;
      };

      queueSource.connect(audioContext.destination);
      queueSource.start(0, 0);
      await audioContext.resume();

      voiceAudioContextRef.current = audioContext;
      voiceAudioQueueRef.current = queueSource;
    }

    const audioContext = voiceAudioContextRef.current;
    const queueSource = voiceAudioQueueRef.current;

    if (!audioContext || !queueSource) {
      throw new Error("Voice playback queue is not ready");
    }

    return { audioContext, queueSource };
  }, []);

  const playBufferedVoiceAudio = useCallback(async (turnId: string) => {
    const base64Audio = voiceAudioChunkPartsRef.current.join("");

    if (!base64Audio) {
      logVoiceProductionCheck("buffered audio skipped", {
        reason: "No backend audio chunks collected.",
        turnId,
      });
      return false;
    }

    try {
      const [{ createAudioPlayer }, FileSystem] = await Promise.all([
        import("expo-audio"),
        import("expo-file-system/legacy"),
      ]);

      if (!FileSystem.cacheDirectory) {
        throw new Error("FileSystem cache directory is unavailable.");
      }

      const fileUri = `${FileSystem.cacheDirectory}sai-elevenlabs-${turnId}.mp3`;

      if (voiceFallbackAudioFileUriRef.current) {
        await FileSystem.deleteAsync(
          voiceFallbackAudioFileUriRef.current,
          { idempotent: true }
        ).catch(() => undefined);
      }

      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      voiceFallbackAudioPlayerRef.current?.pause();
      voiceFallbackAudioPlayerRef.current?.remove?.();

      const player = createAudioPlayer(fileUri, {
        keepAudioSessionActive: false,
      });

      voiceFallbackAudioFileUriRef.current = fileUri;
      voiceFallbackAudioPlayerRef.current = player;

      await player.seekTo?.(0);
      await stopWaitingTone();
      player.play();
      setIsSpeaking(true);
      setVoiceConnectionState("speaking");

      if (voicePlaybackCompletionTimerRef.current) {
        clearTimeout(voicePlaybackCompletionTimerRef.current);
      }

      const estimatedBytes = Math.floor((base64Audio.length * 3) / 4);
      const estimatedDurationMs = Math.max(
        2500,
        Math.min(45000, Math.ceil((estimatedBytes / 16000) * 1000) + 1200)
      );

      voicePlaybackCompletionTimerRef.current = setTimeout(() => {
        setIsSpeaking(false);
        setVoiceConnectionState((currentState) =>
          currentState === "speaking" ? "idle" : currentState
        );
      }, estimatedDurationMs);

      logVoiceProductionCheck("buffered ElevenLabs MP3 playback started", {
        base64Length: base64Audio.length,
        fileUri,
        parts: voiceAudioChunkPartsRef.current.length,
        turnId,
      });

      return true;
    } catch (error) {
      logVoiceProductionCheck("buffered ElevenLabs MP3 playback failed", {
        error: error instanceof Error ? error.message : String(error),
        parts: voiceAudioChunkPartsRef.current.length,
        turnId,
      });
      return false;
    }
  }, [stopWaitingTone]);

  const enqueueVoiceAudioChunk = useCallback(
    (event: Extract<DevoteeAiVoiceServerEvent, { type: "audio_chunk" }>) => {
      voiceAudioDecodeQueueRef.current = voiceAudioDecodeQueueRef.current
        .then(async () => {
          if (
            activeVoiceTurnIdRef.current &&
            event.turnId !== activeVoiceTurnIdRef.current
          ) {
            return;
          }

          logVoiceProductionCheck("audio_chunk", {
            base64Length: event.data?.length ?? 0,
            format: event.format,
            hasData: Boolean(event.data),
            turnId: event.turnId,
          });

          if (event.format.startsWith("mp3")) {
            voiceAudioChunkPartsRef.current.push(event.data);
            voiceHadAudioChunksRef.current = true;
            setVoiceConnectionState("speaking");

            logVoiceProductionCheck("buffering mp3 audio chunk", {
              parts: voiceAudioChunkPartsRef.current.length,
              reason:
                "MP3 chunks may be stream fragments; playback starts from complete buffered MP3.",
              turnId: event.turnId,
            });
            return;
          }

          const { audioContext, queueSource } =
            await ensureVoicePlaybackQueue();
          const audioArrayBuffer = base64ToArrayBuffer(event.data);

          logVoiceDebug("Audio chunk received", {
            bytes: audioArrayBuffer.byteLength,
            format: event.format,
            turnId: event.turnId,
          });

          const audioBuffer = await audioContext.decodeAudioData(
            audioArrayBuffer
          );

          await stopWaitingTone();
          queueSource.enqueueBuffer(audioBuffer);
          voiceHadAudioChunksRef.current = true;
          setIsSpeaking(true);
          setVoiceConnectionState("speaking");
        })
        .catch((error) => {
          voiceLivePlaybackFailedRef.current = true;
          logVoiceDebug("Voice audio chunk playback failed", {
            error: error instanceof Error ? error.message : String(error),
            format: event.format,
            turnId: event.turnId,
          });
        });
    },
    [ensureVoicePlaybackQueue, stopWaitingTone]
  );

  const stopSpeech = useCallback(async () => {
    try {
      await Speech.stop();
    } catch (error) {
      logVoiceDebug("Expo speech stop failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    if (voiceAudioContextRef.current || voiceAudioQueueRef.current) {
      await stopVoicePlayback();
    }

    setIsSpeaking(false);
  }, [stopVoicePlayback]);

  const cleanupBackendVoiceSessions = useCallback(async (reason: string) => {
    try {
      logVoiceDebug("Cleaning active backend voice sessions", { reason });

      const response = await endActiveDevoteeAiVoiceSessions();

      logVoiceDebug("Backend voice sessions cleaned", {
        endedCount: response.endedCount,
        reason,
        success: response.success,
      });

      return response;
    } catch (error) {
      logVoiceDebug("Backend voice session cleanup failed", {
        error: error instanceof Error ? error.message : String(error),
        reason,
      });

      return null;
    }
  }, []);

  const closeVoiceSession = useCallback(() => {
    logVoiceDebug("Closing voice session", {
      chunksSent: voiceChunkCountRef.current,
      state: voiceConnectionStateRef.current,
      turnId: activeVoiceTurnIdRef.current,
    });

    if (voiceConnectedTimeoutRef.current) {
      clearTimeout(voiceConnectedTimeoutRef.current);
      voiceConnectedTimeoutRef.current = null;
    }

    pendingVoiceStartRef.current = null;
    void stopWaitingTone();

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
    void stopVoicePlayback();
    activeVoiceTurnIdRef.current = null;
    voiceAnswerBufferRef.current = "";
    voiceAudioChunkPartsRef.current = [];
    voiceChunkCountRef.current = 0;
    voiceFinalTranscriptRef.current = "";
    voiceHadAudioChunksRef.current = false;
    voiceLivePlaybackFailedRef.current = false;
    voiceTimingRef.current = {};
    setActiveVoiceTurnId(null);
    setIsListening(false);
    setVoiceConnectionState("idle");
    setVoicePartialTranscript("");
    void cleanupBackendVoiceSessions("local-close");
  }, [cleanupBackendVoiceSessions, stopVoicePlayback, stopWaitingTone]);

  useEffect(() => {
    return () => {
      closeVoiceSession();
      void Speech.stop();
    };
  }, [closeVoiceSession]);

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
      if (FULL_DUPLEX_VOICE_ENABLED && VOICE_PROVIDER === "elevenlabs") {
        logVoiceProductionCheck("device TTS blocked", {
          reason: "ElevenLabs production voice test is enabled.",
          textLength: text.trim().length,
        });
        setVoiceError(
          "ElevenLabs voice mode is enabled. Please use the mic button to hear the backend voice."
        );
        return;
      }

      const textToSpeak = text.trim();

      if (!textToSpeak) {
        return;
      }

      try {
        await Speech.stop();
        setIsSpeaking(true);
        Speech.speak(textToSpeak, {
          language: getSpeechLanguage(),
          pitch: 1,
          rate: Platform.OS === "ios" ? 0.48 : 0.9,
          onDone: () => setIsSpeaking(false),
          onError: (error) => {
            logVoiceDebug("Expo speech speak failed", {
              error: typeof error === "string" ? error : String(error),
            });
            setIsSpeaking(false);
          },
          onStopped: () => setIsSpeaking(false),
        });
      } catch (error) {
        setIsSpeaking(false);
        logVoiceDebug("Expo speech start crashed", {
          error: error instanceof Error ? error.message : String(error),
        });
        Alert.alert(
          "Speak reply",
          "Voice playback is not available right now. Please read the reply on screen."
        );
        return;
      }

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

    let speaking = false;

    try {
      speaking = await Speech.isSpeakingAsync();
    } catch (error) {
      logVoiceDebug("Expo speech status failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    if (speaking || isSpeaking) {
      try {
        await Speech.stop();
      } catch (error) {
        logVoiceDebug("Expo speech stop from button failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      setIsSpeaking(false);
      return;
    }

    await speakText(answer);
  }, [answer, isSpeaking, speakText]);

  const startConnectedVoiceStreaming = useCallback(async () => {
    const pendingStart = pendingVoiceStartRef.current;

    if (!pendingStart || pendingStart.hasStarted) {
      return;
    }

    if (pendingStart.socketClient.readyState !== WebSocket.OPEN) {
      setVoiceConnectionState("error");
      setVoiceError("Voice connection closed before listening could start.");
      return;
    }

    pendingStart.hasStarted = true;

    if (voiceConnectedTimeoutRef.current) {
      clearTimeout(voiceConnectedTimeoutRef.current);
      voiceConnectedTimeoutRef.current = null;
    }

    setIsListening(true);
    setVoiceConnectionState("listening");
    voiceTimingRef.current.startedAt = Date.now();

    logVoiceDebug("Sending start event and starting mic stream", {
      audio: {
        channels: pendingStart.audioChannels,
        chunkMs: pendingStart.audioChunkMs,
        format: "pcm_s16le",
        sampleRate: pendingStart.audioSampleRate,
      },
      msSinceTap:
        voiceTimingRef.current.tapAt
          ? Date.now() - voiceTimingRef.current.tapAt
          : undefined,
      turnId: pendingStart.turnId,
    });

    pendingStart.socketClient.send({
      audio: {
        channels: pendingStart.audioChannels,
        chunkMs: pendingStart.audioChunkMs,
        format: "pcm_s16le",
        sampleRate: pendingStart.audioSampleRate,
      },
      turnId: pendingStart.turnId,
      type: "start",
    });

    audioChunkSubscriptionRef.current?.remove();
    audioErrorSubscriptionRef.current?.remove();

    audioChunkSubscriptionRef.current =
      pendingStart.audioStream.addAudioChunkListener(
        (event: SaiAudioStreamChunkEvent) => {
          if (
            activeVoiceTurnIdRef.current !== pendingStart.turnId ||
            pendingStart.socketClient.readyState !== WebSocket.OPEN
          ) {
            return;
          }

          pendingStart.socketClient.send({
            data: event.data,
            encoding: "base64",
            turnId: pendingStart.turnId,
            type: "audio_chunk",
          });

          voiceChunkCountRef.current += 1;

          if (!voiceTimingRef.current.firstMicChunkAt) {
            voiceTimingRef.current.firstMicChunkAt = Date.now();
            logVoiceDebug("First mic chunk sent", {
              bytesBase64: event.data.length,
              msSinceStart:
                voiceTimingRef.current.startedAt
                  ? Date.now() - voiceTimingRef.current.startedAt
                  : undefined,
              sequence: event.sequence,
              turnId: pendingStart.turnId,
            });
          } else if (voiceChunkCountRef.current % 10 === 0) {
            logVoiceDebug("Mic chunks streaming", {
              chunksSent: voiceChunkCountRef.current,
              lastSequence: event.sequence,
              turnId: pendingStart.turnId,
            });
          }
        }
      );

    audioErrorSubscriptionRef.current =
      pendingStart.audioStream.addAudioErrorListener(
        (event: SaiAudioStreamErrorEvent) => {
          logVoiceDebug("Native audio stream error", {
            code: event.code,
            message: event.message,
            turnId: pendingStart.turnId,
          });
          setVoiceConnectionState("error");
          setVoiceError(event.message);
          void pendingStart.audioStream.stopSaiAudioStreamAsync();
        }
      );

    await pendingStart.audioStream.startSaiAudioStreamAsync({
      chunkMs: pendingStart.audioChunkMs,
      sampleRate: pendingStart.audioSampleRate,
    });
  }, []);

  const handleVoiceServerEvent = useCallback(
    (event: DevoteeAiVoiceServerEvent) => {
      const eventTurnId = "turnId" in event ? event.turnId : undefined;

      logVoiceDebug("Server event received", {
        eventType: event.type,
        state: event.type === "state" ? event.state : undefined,
        textLength: "text" in event ? event.text.length : undefined,
        turnId: eventTurnId,
      });

      if (
        eventTurnId &&
        activeVoiceTurnIdRef.current &&
        eventTurnId !== activeVoiceTurnIdRef.current
      ) {
        logVoiceDebug("Ignoring stale server event", {
          activeTurnId: activeVoiceTurnIdRef.current,
          eventTurnId,
          eventType: event.type,
        });
        return;
      }

      switch (event.type) {
        case "state":
          if (event.state === "connected") {
            voiceTimingRef.current.connectedAt = Date.now();
            logVoiceDebug("Backend confirmed connected", {
              msSinceTap:
                voiceTimingRef.current.tapAt
                  ? Date.now() - voiceTimingRef.current.tapAt
                  : undefined,
              msSinceSocketOpen:
                voiceTimingRef.current.socketOpenedAt
                  ? Date.now() - voiceTimingRef.current.socketOpenedAt
                  : undefined,
              turnId: event.turnId,
            });
            setVoiceConnectionState("connected");
            void startConnectedVoiceStreaming();
          } else {
            setVoiceConnectionState(event.state);
          }
          break;

        case "transcript_partial":
          if (!voiceTimingRef.current.firstTranscriptAt) {
            voiceTimingRef.current.firstTranscriptAt = Date.now();
            logVoiceDebug("First transcript received", {
              msSinceTap:
                voiceTimingRef.current.tapAt
                  ? Date.now() - voiceTimingRef.current.tapAt
                  : undefined,
              textLength: event.text.length,
              turnId: event.turnId,
            });
          }
          setVoicePartialTranscript(event.text);
          setVoiceConnectionState("listening");
          break;

        case "transcript_final":
          if (!voiceTimingRef.current.firstTranscriptAt) {
            voiceTimingRef.current.firstTranscriptAt = Date.now();
          }

          logVoiceDebug("Final transcript received", {
            msSinceTap:
              voiceTimingRef.current.tapAt
                ? Date.now() - voiceTimingRef.current.tapAt
                : undefined,
            textLength: event.text.length,
            turnId: event.turnId,
          });
          voiceFinalTranscriptRef.current = event.text;
          setVoiceFinalTranscript(event.text);
          setVoicePartialTranscript("");
          setQuestion(event.text);
          setIsListening(false);
          void getSaiAudioStreamModule()
            .then((audioStream) => audioStream.stopSaiAudioStreamAsync())
            .catch(() => {
              // The native stream module may be unavailable in Expo Go.
            });
          setVoiceConnectionState("thinking");
          break;

        case "answer_delta":
          if (!voiceTimingRef.current.firstAnswerAt) {
            voiceTimingRef.current.firstAnswerAt = Date.now();
            logVoiceDebug("First answer delta received", {
              msSinceTap:
                voiceTimingRef.current.tapAt
                  ? Date.now() - voiceTimingRef.current.tapAt
                  : undefined,
              textLength: event.text.length,
              turnId: event.turnId,
            });
          }
          voiceAnswerBufferRef.current += event.text;
          setAnswer(voiceAnswerBufferRef.current);
          setVoiceConnectionState("speaking");
          break;

        case "audio_chunk":
          if (!voiceTimingRef.current.firstAudioChunkAt) {
            voiceTimingRef.current.firstAudioChunkAt = Date.now();
            logVoiceDebug("First response audio chunk received", {
              dataLength: event.data.length,
              format: event.format,
              msSinceTap:
                voiceTimingRef.current.tapAt
                  ? Date.now() - voiceTimingRef.current.tapAt
                  : undefined,
              turnId: event.turnId,
            });
          }
          enqueueVoiceAudioChunk(event);
          setVoiceConnectionState("speaking");
          break;

        case "stop_playback":
          void stopWaitingTone();
          void stopSpeech();
          setVoiceConnectionState("interrupted");
          break;

        case "turn_complete": {
          const finalQuestion = voiceFinalTranscriptRef.current || question;
          const finalAnswer = voiceAnswerBufferRef.current.trim();

          logVoiceDebug("Turn complete", {
            backendLatency: event.latency,
            chunksSent: voiceChunkCountRef.current,
            finalAnswerLength: finalAnswer.length,
            finalQuestionLength: finalQuestion.length,
            frontendLatency: {
              connectedMs:
                voiceTimingRef.current.tapAt &&
                voiceTimingRef.current.connectedAt
                  ? voiceTimingRef.current.connectedAt -
                    voiceTimingRef.current.tapAt
                  : undefined,
              firstAnswerMs:
                voiceTimingRef.current.tapAt &&
                voiceTimingRef.current.firstAnswerAt
                  ? voiceTimingRef.current.firstAnswerAt -
                    voiceTimingRef.current.tapAt
                  : undefined,
              firstAudioMs:
                voiceTimingRef.current.tapAt &&
                voiceTimingRef.current.firstAudioChunkAt
                  ? voiceTimingRef.current.firstAudioChunkAt -
                    voiceTimingRef.current.tapAt
                  : undefined,
              firstMicChunkMs:
                voiceTimingRef.current.tapAt &&
                voiceTimingRef.current.firstMicChunkAt
                  ? voiceTimingRef.current.firstMicChunkAt -
                    voiceTimingRef.current.tapAt
                  : undefined,
              firstTranscriptMs:
                voiceTimingRef.current.tapAt &&
                voiceTimingRef.current.firstTranscriptAt
                  ? voiceTimingRef.current.firstTranscriptAt -
                    voiceTimingRef.current.tapAt
                  : undefined,
              totalMs: voiceTimingRef.current.tapAt
                ? Date.now() - voiceTimingRef.current.tapAt
                : undefined,
            },
            turnId: event.turnId,
          });

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

          if (
            VOICE_PROVIDER === "elevenlabs" &&
            voiceAudioChunkPartsRef.current.length > 0
          ) {
            void playBufferedVoiceAudio(event.turnId);
          } else if (finalAnswer && !voiceHadAudioChunksRef.current) {
            void speakText(finalAnswer);
          } else {
            void stopWaitingTone();
          }

          activeVoiceTurnIdRef.current = null;
          setActiveVoiceTurnId(null);
          setVoiceConnectionState("idle");
          void cleanupBackendVoiceSessions("turn-complete");
          void loadConversations();
          break;
        }

        case "error":
          logVoiceDebug("Server error event", {
            code: event.code,
            message: event.message,
            turnId: event.turnId,
          });
          setVoiceConnectionState("error");
          setVoiceError(getVoiceErrorMessage(event.code, event.message));
          void stopWaitingTone();
          void cleanupBackendVoiceSessions("server-error");
          break;
      }
    },
    [
      cleanupBackendVoiceSessions,
      conversationId,
      enqueueVoiceAudioChunk,
      loadConversations,
      playBufferedVoiceAudio,
      question,
      speakText,
      startConnectedVoiceStreaming,
      stopSpeech,
      stopWaitingTone,
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
            const transcript = selectBestSpeechTranscript(event.results);

            if (!transcript) {
              return;
            }

            setQuestion(transcript);
            setVoiceError("");
            setVoicePartialTranscript(event.isFinal ? "" : transcript);

            if (event.isFinal) {
              setIsListening(false);
              setVoiceFinalTranscript(transcript);
              voiceFinalTranscriptRef.current = transcript;
              setVoiceConnectionState("idle");
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
  }, []);

  const startSpeechRecognitionFallback = useCallback(
    async () => {
      try {
        const ExpoSpeechRecognitionModule =
          await getSpeechRecognitionModule();

        const permissions =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!permissions.granted) {
          setVoiceConnectionState("error");
          setVoiceError(
            "Please allow microphone and speech recognition permissions to ask by voice."
          );
          return false;
        }

        if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
          setVoiceConnectionState("error");
          setVoiceError(
            "Voice input is not available on this device. Please type your question."
          );
          return false;
        }

        setVoiceConnectionState("idle");
        setVoiceError("");
        setVoicePartialTranscript("");
        setVoiceFinalTranscript("");
        voiceFinalTranscriptRef.current = "";
        setIsListening(true);
        ExpoSpeechRecognitionModule.start({
          addsPunctuation: true,
          contextualStrings: [
            "Sai Baba",
            "Om Sai Ram",
            "Shraddha",
            "Saburi",
            "mandir",
            "darshan",
            "seva",
            "bhajan",
          ],
          continuous: true,
          interimResults: true,
          lang: getSpeechLanguage(),
          maxAlternatives: 3,
          requiresOnDeviceRecognition: false,
        });

        return true;
      } catch (error) {
        logVoiceDebug("Speech recognition fallback failed", {
          error: error instanceof Error ? error.message : String(error),
        });
        setVoiceConnectionState("error");
        setVoiceError(
          "Voice input needs a fresh development build. Please type your question for now."
        );
        return false;
      }
    },
    []
  );

  const handleVoiceQuestion = useCallback(async () => {
    logVoiceDebug("Voice button pressed", {
      fullDuplexEnabled: FULL_DUPLEX_VOICE_ENABLED,
      isListening,
      provider: VOICE_PROVIDER,
      socketReadyState: voiceSocketRef.current?.readyState,
      state: voiceConnectionState,
    });

    if (
      FULL_DUPLEX_VOICE_ENABLED &&
      (voiceSocketRef.current || voiceConnectionState !== "idle")
    ) {
      if (!voiceSocketRef.current) {
        logVoiceDebug("Resetting stale voice state without socket", {
          state: voiceConnectionState,
        });

        pendingVoiceStartRef.current = null;
        activeVoiceTurnIdRef.current = null;
        setActiveVoiceTurnId(null);
        setIsListening(false);
        setVoiceConnectionState("idle");
        setVoiceError("");
        return;
      }

      const activeTurnId = activeVoiceTurnIdRef.current;

      if (
        activeTurnId &&
        voiceSocketRef.current?.readyState === WebSocket.OPEN
      ) {
        logVoiceDebug("Sending end_input", {
          chunksSent: voiceChunkCountRef.current,
          turnId: activeTurnId,
        });

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
        voiceTimingRef.current = {
          tapAt: Date.now(),
        };
        voiceChunkCountRef.current = 0;

        logVoiceDebug("Starting full-duplex voice flow", {
          conversationId,
          provider: VOICE_PROVIDER,
        });
        logVoiceProductionCheck("voice provider env", {
          env: process.env.EXPO_PUBLIC_AI_VOICE_PROVIDER,
          resolvedProvider: VOICE_PROVIDER,
        });

        setVoiceError("");
        setVoiceConnectionState("connecting");
        setVoicePartialTranscript("");
        setVoiceFinalTranscript("");
        voiceFinalTranscriptRef.current = "";
        voiceAnswerBufferRef.current = "";
        voiceAudioChunkPartsRef.current = [];
        voiceHadAudioChunksRef.current = false;
        voiceLivePlaybackFailedRef.current = false;

        const audioStream = await getSaiAudioStreamModule();
        logVoiceDebug("Native audio module loaded");

        if (!audioStream.isSaiAudioStreamAvailable()) {
          logVoiceDebug("Native audio module unavailable; falling back to speech recognition");
          setVoiceError(
            "Live voice streaming needs a fresh development build. Using speech recognition fallback for now."
          );

          await startSpeechRecognitionFallback();
          return;
        }

        const permissions =
          await audioStream.requestSaiAudioStreamPermissionsAsync();

        logVoiceDebug("Microphone permission result", {
          granted: permissions.granted,
        });

        if (!permissions.granted) {
          setVoiceConnectionState("error");
          setVoiceError(
            "Please allow microphone permission to ask Sai by voice."
          );
          return;
        }

        await cleanupBackendVoiceSessions("before-create");

        logVoiceDebug("Creating voice session", {
          conversationId,
          hasTtsVoiceId: Boolean(ELEVENLABS_VOICE_ID),
          provider: VOICE_PROVIDER,
        });

        const voiceSessionPayload = {
          conversationId,
          locale: "hi-IN" as const,
          pillar: "experiences" as const,
          secondaryLocale: "en-IN" as const,
          ttsVoiceId: ELEVENLABS_VOICE_ID,
          voiceProvider: VOICE_PROVIDER,
        };

        let session: DevoteeAiVoiceSession;

        try {
          session = await createDevoteeAiVoiceSession(voiceSessionPayload);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          if (!errorMessage.toLowerCase().includes("already active")) {
            throw error;
          }

          logVoiceDebug("Create session found active backend session; cleaning and retrying", {
            error: errorMessage,
          });

          await cleanupBackendVoiceSessions("already-active-retry");
          session = await createDevoteeAiVoiceSession(voiceSessionPayload);
        }

        voiceTimingRef.current.sessionCreatedAt = Date.now();

        logVoiceProductionCheck("voice session providers", {
          providers: session.providers,
        });
        logVoiceProductionCheck("voice output format", {
          outputFormat: session.audio?.outputFormat,
        });
        logVoiceProductionCheck("voice websocket url", {
          isProductionWss: session.webSocketUrl.startsWith(
            "wss://saifamily.sustaininsight.com/api/ai/voice/ws"
          ),
          webSocketUrl: session.webSocketUrl.replace(
            /([?&]token=)[^&]+/,
            "$1***"
          ),
        });

        logVoiceDebug("Voice session created", {
          audio: session.audio,
          conversationId: session.conversationId,
          outputFormat: session.audio?.outputFormat,
          msSinceTap:
            voiceTimingRef.current.tapAt
              ? Date.now() - voiceTimingRef.current.tapAt
              : undefined,
          providers: session.providers,
          sessionId: session.sessionId,
          status: session.status,
          webSocketUrl: session.webSocketUrl.replace(
            /([?&]token=)[^&]+/,
            "$1***"
          ),
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
            logVoiceDebug("WebSocket closed", {
              chunksSent: voiceChunkCountRef.current,
              state: voiceConnectionState,
              turnId,
            });

            if (voiceConnectedTimeoutRef.current) {
              clearTimeout(voiceConnectedTimeoutRef.current);
              voiceConnectedTimeoutRef.current = null;
            }

            void audioStream.stopSaiAudioStreamAsync().catch(() => {
              // Recording may already be stopped.
            });
            audioChunkSubscriptionRef.current?.remove();
            audioErrorSubscriptionRef.current?.remove();
            audioChunkSubscriptionRef.current = null;
            audioErrorSubscriptionRef.current = null;
            pendingVoiceStartRef.current = null;
            voiceSocketRef.current = null;
            activeVoiceTurnIdRef.current = null;
            setActiveVoiceTurnId(null);
            setIsListening(false);
            setVoiceConnectionState((currentState) =>
              currentState === "error" ? "error" : "idle"
            );
          },
          onError: () => {
            logVoiceDebug("WebSocket error", {
              state: voiceConnectionState,
              turnId,
            });

            if (voiceConnectedTimeoutRef.current) {
              clearTimeout(voiceConnectedTimeoutRef.current);
              voiceConnectedTimeoutRef.current = null;
            }

            void audioStream.stopSaiAudioStreamAsync().catch(() => {
              // Recording may already be stopped.
            });
            pendingVoiceStartRef.current = null;
            setIsListening(false);
            setVoiceConnectionState("error");
            setVoiceError(
              "Voice connection failed. Please try again or type your question."
            );
          },
          onEvent: handleVoiceServerEvent,
          onOpen: () => {
            voiceTimingRef.current.socketOpenedAt = Date.now();
            logVoiceDebug("WebSocket opened", {
              msSinceTap:
                voiceTimingRef.current.tapAt
                  ? Date.now() - voiceTimingRef.current.tapAt
                  : undefined,
              turnId,
            });

            setVoiceConnectionState("connecting");
            setVoiceError("Voice socket opened. Waiting for backend...");

            if (voiceConnectedTimeoutRef.current) {
              clearTimeout(voiceConnectedTimeoutRef.current);
            }

            voiceConnectedTimeoutRef.current = setTimeout(() => {
              const pendingStart = pendingVoiceStartRef.current;

              if (pendingStart && !pendingStart.hasStarted) {
                logVoiceDebug("Backend connected timeout", {
                  msSinceSocketOpen:
                    voiceTimingRef.current.socketOpenedAt
                      ? Date.now() - voiceTimingRef.current.socketOpenedAt
                      : undefined,
                  turnId: pendingStart.turnId,
                });

                pendingVoiceStartRef.current = null;
                setVoiceConnectionState("error");
                setVoiceError(
                  "Voice backend did not confirm connection. Please try again."
                );
                pendingStart.socketClient.close();
              }
            }, 8000);
          },
        });

        if (!socketClient) {
          throw new Error("Voice socket could not be created.");
        }

        voiceSocketRef.current = socketClient;
        pendingVoiceStartRef.current = {
          audioChannels,
          audioChunkMs,
          audioSampleRate,
          audioStream,
          hasStarted: false,
          socketClient,
          turnId,
        };
        setVoiceError(
          session.providers?.stt === "mock"
            ? "Voice session created in mock mode. Waiting for backend connection..."
            : "Voice session created. Waiting for backend connection..."
        );
        trackProductEvent("Devotee Voice Session Started", {
          pillar: "experiences",
          provider: session.providers?.tts || VOICE_PROVIDER,
        });
        return;
      }

      await startSpeechRecognitionFallback();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logVoiceDebug("Voice flow failed", {
        error: errorMessage,
        provider: VOICE_PROVIDER,
        state: voiceConnectionState,
      });

      if (voiceConnectedTimeoutRef.current) {
        clearTimeout(voiceConnectedTimeoutRef.current);
        voiceConnectedTimeoutRef.current = null;
      }

      pendingVoiceStartRef.current = null;
      voiceSocketRef.current = null;
      activeVoiceTurnIdRef.current = null;
      setActiveVoiceTurnId(null);
      setIsListening(false);
      setVoiceConnectionState("idle");

      if (errorMessage.toLowerCase().includes("already active")) {
        setVoiceError(
          "A previous voice session is still active on the backend. Please wait a moment, then tap mic again."
        );
        return;
      }

      setVoiceError(
        errorMessage ||
          "Voice input needs a custom development build. Please type your question for now."
      );
    }
  }, [
    cleanupBackendVoiceSessions,
    conversationId,
    handleVoiceServerEvent,
    isListening,
    startSpeechRecognitionFallback,
    stopSpeech,
    voiceConnectionState,
  ]);

  const openVoiceModal = useCallback(() => {
    setIsVoiceModalVisible(true);

    if (!isVoiceControlActive && !isSubmitting) {
      void handleVoiceQuestion();
    }
  }, [handleVoiceQuestion, isSubmitting, isVoiceControlActive]);

  const submitVoiceModal = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (FULL_DUPLEX_VOICE_ENABLED && voiceSocketRef.current) {
      startWaitingTone();
      await handleVoiceQuestion();
      return;
    }

    const fallbackQuestion = (
      voiceFinalTranscript ||
      voicePartialTranscript ||
      question
    ).trim();

    if (fallbackQuestion.length >= 3) {
      startWaitingTone();
      try {
        await submitQuestion(fallbackQuestion, { speak: false });
      } finally {
        await stopWaitingTone();
      }
    } else {
      Alert.alert(
        "Speak your question",
        "Please speak or write a little more before submitting."
      );
    }
  }, [
    handleVoiceQuestion,
    isSubmitting,
    question,
    startWaitingTone,
    stopWaitingTone,
    submitQuestion,
    voiceFinalTranscript,
    voicePartialTranscript,
  ]);

  const closeVoiceModal = useCallback(async () => {
    setIsVoiceModalVisible(false);
    await stopWaitingTone();
    closeVoiceSession();
  }, [closeVoiceSession, stopWaitingTone]);

  const updateVoiceTranscript = useCallback((nextTranscript: string) => {
    setQuestion(nextTranscript);
    setVoiceFinalTranscript(nextTranscript);
    setVoicePartialTranscript("");
    voiceFinalTranscriptRef.current = nextTranscript;
  }, []);

  const listenAgainFromModal = useCallback(async () => {
    await stopWaitingTone();
    setAnswer("");
    setVoiceError("");
    setVoicePartialTranscript("");
    setVoiceFinalTranscript("");
    setQuestion("");
    voiceFinalTranscriptRef.current = "";

    if (isListening) {
      try {
        const ExpoSpeechRecognitionModule =
          await getSpeechRecognitionModule();
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // Listener cleanup is best effort.
      }
    }

    if (FULL_DUPLEX_VOICE_ENABLED) {
      closeVoiceSession();
      setTimeout(() => {
        setIsVoiceModalVisible(true);
        void handleVoiceQuestion();
      }, 260);
      return;
    }

    await startSpeechRecognitionFallback();
  }, [
    closeVoiceSession,
    handleVoiceQuestion,
    isListening,
    startSpeechRecognitionFallback,
    stopWaitingTone,
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

  const modalTranscript =
    voicePartialTranscript || voiceFinalTranscript || question;
  const hasModalTranscript = modalTranscript.trim().length >= 3;
  const isVoiceThinking =
    voiceConnectionState === "thinking" ||
    (isWaitingToneActive && !isSpeaking);
  const isVoiceSubmitDisabled =
    isSubmitting ||
    isSpeaking ||
    isVoiceThinking ||
    voiceConnectionState === "connecting" ||
    (!FULL_DUPLEX_VOICE_ENABLED && !hasModalTranscript);
  const canListenAgain =
    !isVoiceThinking &&
    !isSpeaking &&
    voiceConnectionState !== "connecting";
  const voiceModalTitle = isSpeaking
    ? "Sai Baba is replying"
    : isVoiceThinking
      ? "Preparing guidance"
      : isListening
        ? "Speak from your heart"
        : "Ask Sai by voice";
  const voiceModalSubtitle = isSpeaking
    ? "Listen peacefully to the guidance."
    : isVoiceThinking
      ? "A soft tone will continue until the reply is ready."
      : "Share your problem, prayer, or question. Tap Submit when you finish.";

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
                  {voiceSession.audio?.outputFormat || "mp3_44100_128"}
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
                onPress={openVoiceModal}
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

      <Modal
        animationType="fade"
        onRequestClose={closeVoiceModal}
        transparent
        visible={isVoiceModalVisible}
      >
        <View style={styles.voiceModalBackdrop}>
          <Pressable
            onPress={closeVoiceModal}
            style={styles.voiceModalBackdropPress}
          />
          <View
            style={[
              styles.voiceModalCard,
              { paddingBottom: insets.bottom + 18 },
            ]}
          >
            <View style={styles.voiceModalHandle} />
            <View style={styles.voiceModalHeader}>
              <View style={styles.voiceModalIcon}>
                {isSpeaking ? (
                  <Volume2 color="#FFFFFF" size={24} strokeWidth={2.5} />
                ) : (
                  <Mic color="#FFFFFF" size={24} strokeWidth={2.5} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceModalTitle}>
                  {voiceModalTitle}
                </Text>
                <Text style={styles.voiceModalSubtitle}>
                  {voiceModalSubtitle}
                </Text>
              </View>
            </View>

            <View style={styles.voiceWavePanel}>
              <View
                style={[
                  styles.voiceWaveDot,
                  isListening && styles.voiceWaveDotActive,
                ]}
              />
              <View
                style={[
                  styles.voiceWaveDot,
                  styles.voiceWaveDotTall,
                  (isListening || isWaitingToneActive) &&
                    styles.voiceWaveDotActive,
                ]}
              />
              <View
                style={[
                  styles.voiceWaveDot,
                  (isSpeaking || isWaitingToneActive) &&
                    styles.voiceWaveDotActive,
                ]}
              />
            </View>

            {isWaitingToneActive ? (
              <View style={styles.waitingToneCard}>
                <ActivityIndicator color="#B45309" size="small" />
                <Text style={styles.waitingToneText}>
                  Soft tone playing while Sai prepares the reply...
                </Text>
              </View>
            ) : null}

            <View style={styles.voiceModalTranscriptBox}>
              <Text style={styles.voiceModalTranscriptLabel}>
                {modalTranscript ? "Review your words" : "Listening area"}
              </Text>
              <TextInput
                editable={!isVoiceThinking && !isSpeaking}
                multiline
                onChangeText={updateVoiceTranscript}
                placeholder="Speak naturally. You can share your problem, prayer, or question."
                placeholderTextColor="#9A8265"
                returnKeyType="done"
                style={styles.voiceModalTranscriptInput}
                textAlignVertical="top"
                value={modalTranscript}
              />
            </View>

            {canListenAgain ? (
              <Pressable
                onPress={listenAgainFromModal}
                style={({ pressed }) => [
                  styles.voiceModalRetryButton,
                  pressed && styles.pressed,
                ]}
              >
                <RotateCcw
                  color="#B45309"
                  size={16}
                  strokeWidth={2.5}
                />
                <Text style={styles.voiceModalRetryText}>
                  Listen again
                </Text>
              </Pressable>
            ) : null}

            {answer && isSpeaking ? (
              <View style={styles.voiceModalAnswerBox}>
                <Text style={styles.voiceModalTranscriptLabel}>
                  Sai assistant
                </Text>
                <Text numberOfLines={4} style={styles.voiceModalAnswerText}>
                  {answer}
                </Text>
              </View>
            ) : null}

            {voiceError ? (
              <Text style={styles.voiceModalError}>{voiceError}</Text>
            ) : null}

            <View style={styles.voiceModalActions}>
              <Pressable
                onPress={closeVoiceModal}
                style={({ pressed }) => [
                  styles.voiceModalSecondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.voiceModalSecondaryText}>
                  {isSpeaking ? "Close" : "Cancel"}
                </Text>
              </Pressable>

              <Pressable
                disabled={isVoiceSubmitDisabled}
                onPress={submitVoiceModal}
                style={({ pressed }) => [
                  styles.voiceModalPrimaryButton,
                  isVoiceSubmitDisabled && styles.voiceModalPrimaryDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {isVoiceThinking ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.voiceModalPrimaryText}>
                      Submit
                    </Text>
                    <Send color="#FFFFFF" size={17} strokeWidth={2.5} />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  voiceModalBackdrop: {
    backgroundColor: "rgba(31, 18, 8, 0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  voiceModalBackdropPress: {
    flex: 1,
  },
  voiceModalCard: {
    backgroundColor: "#FFFDF8",
    borderColor: "#F3E1BE",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: "#7C2D12",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },
  voiceModalHandle: {
    alignSelf: "center",
    backgroundColor: "#E7D3B4",
    borderRadius: 100,
    height: 5,
    marginBottom: 18,
    width: 46,
  },
  voiceModalHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  voiceModalIcon: {
    alignItems: "center",
    backgroundColor: "#B45309",
    borderRadius: 22,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  voiceModalTitle: {
    color: "#23201D",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  voiceModalSubtitle: {
    color: "#6B5A45",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4,
  },
  voiceWavePanel: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#F1DEC0",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 86,
    justifyContent: "center",
    marginBottom: 14,
  },
  voiceWaveDot: {
    backgroundColor: "#FED7AA",
    borderRadius: 999,
    height: 28,
    width: 12,
  },
  voiceWaveDotTall: {
    height: 52,
  },
  voiceWaveDotActive: {
    backgroundColor: "#B45309",
  },
  waitingToneCard: {
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  waitingToneText: {
    color: "#92400E",
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  voiceModalTranscriptBox: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DFC6",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 106,
    padding: 14,
  },
  voiceModalAnswerBox: {
    backgroundColor: "#F7FBFF",
    borderColor: "#DBEAFE",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  voiceModalTranscriptLabel: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  voiceModalTranscriptText: {
    color: "#2F2A24",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 25,
  },
  voiceModalTranscriptInput: {
    color: "#2F2A24",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 27,
    minHeight: 112,
    padding: 0,
  },
  voiceModalRetryButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginBottom: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  voiceModalRetryText: {
    color: "#B45309",
    fontSize: 13,
    fontWeight: "900",
  },
  voiceModalAnswerText: {
    color: "#26384F",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
  },
  voiceModalError: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
    marginBottom: 12,
  },
  voiceModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  voiceModalSecondaryButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F0DFC6",
    borderRadius: 16,
    borderWidth: 1,
    flex: 0.42,
    height: 54,
    justifyContent: "center",
  },
  voiceModalSecondaryText: {
    color: "#7C2D12",
    fontSize: 16,
    fontWeight: "900",
  },
  voiceModalPrimaryButton: {
    alignItems: "center",
    backgroundColor: "#B45309",
    borderRadius: 16,
    flex: 0.58,
    flexDirection: "row",
    gap: 8,
    height: 54,
    justifyContent: "center",
  },
  voiceModalPrimaryDisabled: {
    opacity: 0.7,
  },
  voiceModalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});
