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
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
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

const BACKEND_MOCK_TRANSCRIPT =
  "Sai Baba mujhe mushkil samay mein dhairya kaise rakhna chahiye?";
const VOICE_PRIMARY_LOCALE = "hi-IN" as const;
const VOICE_SECONDARY_LOCALE = "en-IN" as const;
const AI_REPLY_LOCALE = "hi-IN" as const;

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
const SAI_RAM_CYCLE_MS = 1800;

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

const getSpeechLanguage = () => AI_REPLY_LOCALE;

const detectTranscriptLanguage = (text: string) => {
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;

  if (devanagariCount === 0 && latinCount === 0) {
    return null;
  }

  return devanagariCount >= latinCount ? "Hindi" : "English";
};

const appendUniqueMessages = (
  currentMessages: DevoteeAiMessage[],
  nextMessages: DevoteeAiMessage[]
) => {
  const existingIds = new Set(currentMessages.map((message) => message.id));
  const uniqueMessages = nextMessages.filter(
    (message) => !existingIds.has(message.id)
  );

  return [...currentMessages, ...uniqueMessages].slice(-40);
};

const formatWaitingTime = (elapsedMs: number) => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

function SaiRamWaitingCard({
  active,
  compact = false,
}: {
  active: boolean;
  compact?: boolean;
}) {
  const startedAtRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active) {
      startedAtRef.current = null;
      setElapsedMs(0);
      return;
    }

    const startedAt = Date.now();
    startedAtRef.current = startedAt;
    setElapsedMs(0);

    const timer = setInterval(() => {
      if (startedAtRef.current) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, [active]);

  if (!active) {
    return null;
  }

  const completedCount = Math.floor(elapsedMs / SAI_RAM_CYCLE_MS);
  const cycleProgress =
    (elapsedMs % SAI_RAM_CYCLE_MS) / SAI_RAM_CYCLE_MS;
  const progressWidth = `${Math.max(4, cycleProgress * 100)}%` as `${number}%`;

  return (
    <MotiView
      accessibilityLabel={`Preparing Sai guidance. Sai Ram count ${completedCount}. Waiting ${formatWaitingTime(elapsedMs)}.`}
      accessible
      animate={{ opacity: 1, translateY: 0 }}
      from={{ opacity: 0, translateY: 8 }}
      style={[
        styles.saiRamWaitingCard,
        compact && styles.saiRamWaitingCardCompact,
      ]}
      transition={{ duration: 280, type: "timing" }}
    >
      <View style={styles.saiRamCounterCircle}>
        <MotiView
          key={completedCount}
          animate={{ opacity: 1, scale: 1 }}
          from={{ opacity: 0.35, scale: 0.8 }}
          transition={{ duration: 420, type: "timing" }}
        >
          <Text style={styles.saiRamCounterValue}>{completedCount}</Text>
        </MotiView>
        <Text style={styles.saiRamCounterLabel}>COUNT</Text>
      </View>

      <View style={styles.saiRamWaitingContent}>
        <MotiView
          key={`name-${completedCount}`}
          animate={{ opacity: 1, translateY: 0 }}
          from={{ opacity: 0.45, translateY: 5 }}
          transition={{ duration: 420, type: "timing" }}
        >
          <Text style={styles.saiRamWaitingName}>Om Sai Ram</Text>
        </MotiView>
        <Text style={styles.saiRamWaitingMessage}>
          Your guidance is being prepared with care
        </Text>

        <View style={styles.saiRamMeterTrack}>
          <MotiView
            animate={{ width: progressWidth }}
            style={styles.saiRamMeterFill}
            transition={{ duration: 220, type: "timing" }}
          />
        </View>

        <View style={styles.saiRamWaitingMeta}>
          <Text style={styles.saiRamWaitingMetaText}>
            Names completed: {completedCount}
          </Text>
          <Text style={styles.saiRamWaitingTime}>
            {formatWaitingTime(elapsedMs)}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

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

const combineBase64Chunks = (chunks: string[]) => {
  const decodedChunks = chunks.map(
    (chunk) => new Uint8Array(base64ToArrayBuffer(chunk))
  );
  const totalBytes = decodedChunks.reduce(
    (total, chunk) => total + chunk.byteLength,
    0
  );
  const combinedBytes = new Uint8Array(totalBytes);
  let writeOffset = 0;

  decodedChunks.forEach((chunk) => {
    combinedBytes.set(chunk, writeOffset);
    writeOffset += chunk.byteLength;
  });

  return combinedBytes;
};

const bytesToBase64 = (bytes: Uint8Array) => {
  const binaryParts: string[] = [];
  const chunkSize = 32_768;

  for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
    const chunk = bytes.subarray(
      offset,
      Math.min(offset + chunkSize, bytes.byteLength)
    );
    let binaryChunk = "";

    for (let index = 0; index < chunk.byteLength; index += 1) {
      binaryChunk += String.fromCharCode(chunk[index]);
    }

    binaryParts.push(binaryChunk);
  }

  return globalThis.btoa(binaryParts.join(""));
};

type VoicePlaybackStage =
  | "idle"
  | "waiting"
  | "buffering"
  | "playing"
  | "completed"
  | "failed";

type VoicePlayerStatus = {
  didJustFinish: boolean;
  isLoaded: boolean;
  playing: boolean;
};

type VoicePlayer = {
  addListener: (
    eventName: "playbackStatusUpdate",
    listener: (status: VoicePlayerStatus) => void
  ) => { remove: () => void };
  isLoaded: boolean;
  pause: () => void;
  play: () => void;
  playing: boolean;
  remove?: () => void;
  seekTo?: (seconds: number) => Promise<void> | void;
};

const waitForVoicePlayer = (
  player: VoicePlayer,
  predicate: (status: VoicePlayerStatus) => boolean,
  timeoutMs: number
) =>
  new Promise<void>((resolve, reject) => {
    let subscription: { remove: () => void } | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const finish = (error?: Error) => {
      subscription?.remove();

      if (timeout) {
        clearTimeout(timeout);
      }

      if (error) {
        reject(error);
        return;
      }

      resolve();
    };

    const currentStatus: VoicePlayerStatus = {
      didJustFinish: false,
      isLoaded: player.isLoaded,
      playing: player.playing,
    };

    if (predicate(currentStatus)) {
      resolve();
      return;
    }

    subscription = player.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (predicate(status)) {
          finish();
        }
      }
    );

    const statusAfterSubscription: VoicePlayerStatus = {
      didJustFinish: false,
      isLoaded: player.isLoaded,
      playing: player.playing,
    };

    if (predicate(statusAfterSubscription)) {
      finish();
      return;
    }

    timeout = setTimeout(() => {
      finish(new Error("Voice audio player did not become ready in time."));
    }, timeoutMs);
  });

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
  const { height: windowHeight } = useWindowDimensions();
  const mainScrollRef = useRef<ScrollView>(null);
  const voiceModalScrollRef = useRef<ScrollView>(null);
  const questionCardYRef = useRef(0);
  const voiceTranscriptYRef = useRef(0);
  const voiceSocketRef =
    useRef<ReturnType<typeof createDevoteeAiVoiceSocket> | null>(null);
  const voiceSessionRef = useRef<DevoteeAiVoiceSession | null>(null);
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
  const completedVoiceTurnIdRef = useRef<string | null>(null);
  const completedVoiceAssistantMessageIdRef = useRef<string | null>(null);
  const voiceAnswerBufferRef = useRef("");
  const voiceAudioChunkPartsRef = useRef<string[]>([]);
  const voiceChunkCountRef = useRef(0);
  const voiceResponseChunkCountRef = useRef(0);
  const voiceFallbackAudioFileUriRef = useRef<string | null>(null);
  const voiceFallbackAudioPlayerRef = useRef<VoicePlayer | null>(null);
  const voicePlaybackStatusSubscriptionRef = useRef<{
    remove: () => void;
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
  const [voicePlaybackStage, setVoicePlaybackStage] =
    useState<VoicePlaybackStage>("idle");
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
        return "Try again";
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
      voicePlaybackStatusSubscriptionRef.current?.remove();
      voiceFallbackAudioPlayerRef.current?.pause();
      voiceFallbackAudioPlayerRef.current?.remove?.();
    } catch {
      // Cached playback may already be released.
    }

    voicePlaybackStatusSubscriptionRef.current = null;
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
    setVoicePlaybackStage("idle");
  }, []);

  const stopWaitingTone = useCallback(async () => {
    if (waitingToneTimerRef.current) {
      clearInterval(waitingToneTimerRef.current);
      waitingToneTimerRef.current = null;
    }

    setIsWaitingToneActive(false);
  }, []);

  const startWaitingTone = useCallback(() => {
    if (waitingToneTimerRef.current) {
      return;
    }

    setIsWaitingToneActive(true);
    setVoicePlaybackStage("waiting");

    const playWaitingPulse = () => {
      void Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {
        // Haptics are optional on unsupported devices.
      });
    };

    playWaitingPulse();
    waitingToneTimerRef.current = setInterval(playWaitingPulse, 1800);

    logVoiceDebug("Waiting feedback started");
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
    const audioChunks = [...voiceAudioChunkPartsRef.current];

    if (audioChunks.length === 0) {
      setVoicePlaybackStage("failed");
      logVoiceProductionCheck("buffered audio skipped", {
        reason: "No backend audio chunks collected.",
        turnId,
      });
      return false;
    }

    try {
      setVoicePlaybackStage("buffering");
      const [{ createAudioPlayer, setAudioModeAsync }, FileSystem] =
        await Promise.all([
        import("expo-audio"),
        import("expo-file-system/legacy"),
      ]);
      const audioBytes = combineBase64Chunks(audioChunks);

      if (audioBytes.byteLength === 0) {
        throw new Error("Backend ElevenLabs audio was empty.");
      }

      if (!FileSystem.cacheDirectory) {
        throw new Error("The device audio cache directory is unavailable.");
      }

      const safeTurnId = turnId.replace(/[^a-zA-Z0-9_-]/g, "");
      const audioFileUri =
        `${FileSystem.cacheDirectory}sai-elevenlabs-${safeTurnId}.mp3`;

      if (voiceFallbackAudioFileUriRef.current) {
        await FileSystem.deleteAsync(
          voiceFallbackAudioFileUriRef.current,
          { idempotent: true }
        );
      }

      await FileSystem.writeAsStringAsync(
        audioFileUri,
        bytesToBase64(audioBytes),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      await setAudioModeAsync({
        allowsRecording: false,
        interruptionMode: "doNotMix",
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });

      voicePlaybackStatusSubscriptionRef.current?.remove();
      voiceFallbackAudioPlayerRef.current?.pause();
      voiceFallbackAudioPlayerRef.current?.remove?.();

      const player = createAudioPlayer(audioFileUri, {
        keepAudioSessionActive: false,
      }) as VoicePlayer;

      voiceFallbackAudioFileUriRef.current = audioFileUri;
      voiceFallbackAudioPlayerRef.current = player;

      await waitForVoicePlayer(
        player,
        (status) => status.isLoaded,
        6000
      );

      voicePlaybackStatusSubscriptionRef.current = player.addListener(
        "playbackStatusUpdate",
        (status) => {
          if (!status.didJustFinish) {
            return;
          }

          voicePlaybackStatusSubscriptionRef.current?.remove();
          voicePlaybackStatusSubscriptionRef.current = null;
          setIsSpeaking(false);
          setVoiceConnectionState("idle");
          setVoicePlaybackStage("completed");
          logVoiceProductionCheck("ElevenLabs playback finished", {
            turnId,
          });
        }
      );

      await player.seekTo?.(0);
      await stopWaitingTone();
      player.play();

      await waitForVoicePlayer(
        player,
        (status) => status.playing,
        3000
      );

      setIsSpeaking(true);
      setVoiceConnectionState("speaking");
      setVoicePlaybackStage("playing");

      if (voicePlaybackCompletionTimerRef.current) {
        clearTimeout(voicePlaybackCompletionTimerRef.current);
      }

      const estimatedDurationMs = Math.max(
        2500,
        Math.min(
          45000,
          Math.ceil((audioBytes.byteLength / 16000) * 1000) + 3000
        )
      );

      voicePlaybackCompletionTimerRef.current = setTimeout(() => {
        setIsSpeaking(false);
        setVoicePlaybackStage((currentStage) =>
          currentStage === "playing" ? "completed" : currentStage
        );
        setVoiceConnectionState((currentState) =>
          currentState === "speaking" ? "idle" : currentState
        );
      }, estimatedDurationMs);

      logVoiceProductionCheck("buffered ElevenLabs MP3 playback started", {
        byteLength: audioBytes.byteLength,
        fileUri: audioFileUri,
        parts: audioChunks.length,
        turnId,
      });

      return true;
    } catch (error) {
      setIsSpeaking(false);
      setVoiceConnectionState("error");
      setVoicePlaybackStage("failed");
      setVoiceError(
        "Your text reply is ready, but voice playback did not start. Tap Try voice again."
      );
      await stopWaitingTone();
      logVoiceProductionCheck("buffered ElevenLabs MP3 playback failed", {
        error: error instanceof Error ? error.message : String(error),
        parts: audioChunks.length,
        turnId,
      });
      return false;
    }
  }, [stopWaitingTone]);

  const enqueueVoiceAudioChunk = useCallback(
    (event: Extract<DevoteeAiVoiceServerEvent, { type: "audio_chunk" }>) => {
      if (
        activeVoiceTurnIdRef.current &&
        event.turnId !== activeVoiceTurnIdRef.current
      ) {
        return;
      }

      voiceResponseChunkCountRef.current += 1;
      const responseChunkNumber = voiceResponseChunkCountRef.current;
      const shouldLogChunk =
        responseChunkNumber === 1 || responseChunkNumber % 50 === 0;

      if (shouldLogChunk) {
        logVoiceProductionCheck("audio_chunk", {
          base64Length: event.data?.length ?? 0,
          format: event.format,
          hasData: Boolean(event.data),
          responseChunkNumber,
          turnId: event.turnId,
        });
      }

      if (!event.data) {
        voiceLivePlaybackFailedRef.current = true;
        return;
      }

      if (event.format.startsWith("mp3")) {
        voiceAudioChunkPartsRef.current.push(event.data);
        voiceHadAudioChunksRef.current = true;
        setVoicePlaybackStage("buffering");

        if (shouldLogChunk) {
          logVoiceProductionCheck("buffering mp3 audio chunk", {
            parts: voiceAudioChunkPartsRef.current.length,
            reason:
              "MP3 stream fragments are stored separately and combined as binary bytes.",
            turnId: event.turnId,
          });
        }
        return;
      }

      voiceAudioDecodeQueueRef.current = voiceAudioDecodeQueueRef.current
        .then(async () => {
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
          setVoicePlaybackStage("playing");
        })
        .catch((error) => {
          voiceLivePlaybackFailedRef.current = true;
          setVoicePlaybackStage("failed");
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

    if (
      voiceFallbackAudioPlayerRef.current ||
      voiceAudioContextRef.current ||
      voiceAudioQueueRef.current
    ) {
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
    voiceSessionRef.current = null;
    void stopVoicePlayback();
    activeVoiceTurnIdRef.current = null;
    completedVoiceTurnIdRef.current = null;
    completedVoiceAssistantMessageIdRef.current = null;
    voiceAnswerBufferRef.current = "";
    voiceAudioChunkPartsRef.current = [];
    voiceChunkCountRef.current = 0;
    voiceResponseChunkCountRef.current = 0;
    voiceFinalTranscriptRef.current = "";
    voiceHadAudioChunksRef.current = false;
    voiceLivePlaybackFailedRef.current = false;
    voiceTimingRef.current = {};
    setActiveVoiceTurnId(null);
    setVoiceSession(null);
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

    if (FULL_DUPLEX_VOICE_ENABLED && VOICE_PROVIDER === "elevenlabs") {
      if (isSpeaking) {
        await stopVoicePlayback();
        setVoiceConnectionState("idle");
        setVoicePlaybackStage("completed");
        return;
      }

      if (voiceAudioChunkPartsRef.current.length === 0) {
        Alert.alert(
          "Voice reply",
          "This answer was requested as text. Use Speak for a new question to receive an ElevenLabs voice reply."
        );
        return;
      }

      setVoiceError("");
      await playBufferedVoiceAudio(`replay-${Date.now()}`);
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
      setVoiceConnectionState("idle");
      setVoicePlaybackStage("completed");
      return;
    }

    await speakText(answer);
  }, [
    answer,
    isSpeaking,
    playBufferedVoiceAudio,
    speakText,
    stopVoicePlayback,
  ]);

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

      if (event.type !== "audio_chunk") {
        logVoiceDebug("Server event received", {
          eventType: event.type,
          state: event.type === "state" ? event.state : undefined,
          textLength: "text" in event ? event.text.length : undefined,
          turnId: eventTurnId,
        });
      }

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
          } else if (event.state === "speaking") {
            setVoiceConnectionState("thinking");
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

        case "transcript_final": {
          const transcriptElapsedMs = voiceTimingRef.current.startedAt
            ? Date.now() - voiceTimingRef.current.startedAt
            : undefined;

          if (
            event.text.trim().toLocaleLowerCase() ===
              BACKEND_MOCK_TRANSCRIPT.toLocaleLowerCase() &&
            typeof transcriptElapsedMs === "number" &&
            transcriptElapsedMs < 2500
          ) {
            logVoiceProductionCheck("mock STT transcript rejected", {
              elapsedMs: transcriptElapsedMs,
              provider: voiceSessionRef.current?.providers?.stt,
              turnId: event.turnId,
            });
            setIsListening(false);
            setVoiceConnectionState("error");
            setVoicePlaybackStage("failed");
            setVoiceError(
              "Real speech recognition is not active on the server yet. Please type your question for now."
            );
            setVoicePartialTranscript("");
            setVoiceFinalTranscript("");
            setQuestion("");
            voiceFinalTranscriptRef.current = "";
            void getSaiAudioStreamModule()
              .then((audioStream) => audioStream.stopSaiAudioStreamAsync())
              .catch(() => {
                // Recording cleanup is best effort.
              });
            voiceSocketRef.current?.close();
            voiceSocketRef.current = null;
            void cleanupBackendVoiceSessions("mock-stt-detected");
            break;
          }

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
        }

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

          if (completedVoiceTurnIdRef.current === event.turnId) {
            const completedAssistantMessageId =
              completedVoiceAssistantMessageIdRef.current;

            setMessages((currentMessages) => {
              if (!completedAssistantMessageId) {
                return currentMessages;
              }

              const hasAssistantMessage = currentMessages.some(
                (message) => message.id === completedAssistantMessageId
              );

              if (!hasAssistantMessage) {
                return appendUniqueMessages(currentMessages, [
                  {
                    content: voiceAnswerBufferRef.current,
                    id: completedAssistantMessageId,
                    role: "assistant",
                  },
                ]);
              }

              return currentMessages.map((message) =>
                message.id === completedAssistantMessageId
                  ? {
                      ...message,
                      content: voiceAnswerBufferRef.current,
                    }
                  : message
              );
            });
            logVoiceDebug("Applied late answer delta after turn_complete", {
              textLength: event.text.length,
              turnId: event.turnId,
            });
          } else {
            setVoiceConnectionState("thinking");
          }
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
          setVoiceConnectionState("thinking");
          break;

        case "stop_playback":
          void stopWaitingTone();
          void stopSpeech();
          setVoiceConnectionState("interrupted");
          setVoicePlaybackStage("completed");
          break;

        case "turn_complete": {
          completedVoiceTurnIdRef.current = event.turnId;
          const finalQuestion = voiceFinalTranscriptRef.current || question;
          const finalAnswer = voiceAnswerBufferRef.current.trim();
          const assistantMessageId =
            event.messageId || `${event.turnId}-assistant`;
          completedVoiceAssistantMessageIdRef.current = assistantMessageId;

          logVoiceDebug("Turn complete", {
            backendLatency: event.latency,
            chunksSent: voiceChunkCountRef.current,
            responseAudioChunks: voiceResponseChunkCountRef.current,
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
            setMessages((currentMessages) =>
              appendUniqueMessages(currentMessages, [
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
                        id: assistantMessageId,
                        latencyMs: event.latency?.totalMs,
                        role: "assistant" as const,
                      },
                    ]
                  : []),
              ])
            );
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

          setQuestion("");
          setVoicePartialTranscript("");
          setVoiceFinalTranscript("");
          voiceFinalTranscriptRef.current = "";

          if (
            VOICE_PROVIDER === "elevenlabs" &&
            voiceAudioChunkPartsRef.current.length > 0
          ) {
            setVoicePlaybackStage("buffering");
            setVoiceConnectionState("thinking");
            void playBufferedVoiceAudio(event.turnId).then((didPlay) => {
              if (!didPlay) {
                setVoiceConnectionState("error");
                setVoiceError(
                  "ElevenLabs replied, but its audio could not be played. Please try again."
                );
                void stopWaitingTone();
              }
            });
          } else if (VOICE_PROVIDER === "elevenlabs") {
            setVoiceConnectionState("error");
            setVoicePlaybackStage("failed");
            setVoiceError(
              "The backend returned text but no ElevenLabs audio. Please try again."
            );
            void stopWaitingTone();
          } else if (finalAnswer && !voiceHadAudioChunksRef.current) {
            void speakText(finalAnswer);
          } else {
            void stopWaitingTone();
            setVoiceConnectionState("idle");
          }

          activeVoiceTurnIdRef.current = null;
          setActiveVoiceTurnId(null);
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
          setVoicePlaybackStage("failed");
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
        voiceAudioChunkPartsRef.current = [];
        voiceHadAudioChunksRef.current = false;
        setVoicePlaybackStage("idle");
        setIsSubmitting(true);
        setAnswer("");
        setFeedbackMessageId(null);
        setLastResponse(null);
        setSafetyNote("");
        const response = await askDevoteeQuestion({
          conversationId,
          locale: AI_REPLY_LOCALE,
          pillar: "experiences",
          question: questionToAsk,
          voice: false,
        });

        setQuestion("");
        setAnswer(response.answer);
        setConversationId(response.conversationId || conversationId);
        setFeedbackMessageId(response.messageId || null);
        setLastResponse(response);
        const completedAt = Date.now();
        setMessages((currentMessages) =>
          appendUniqueMessages(currentMessages, [
            {
              content: questionToAsk,
              id: `${completedAt}-user`,
              role: "user",
            },
            {
              cached: response.cached,
              content: response.answer,
              id: response.messageId || `${completedAt}-assistant`,
              latencyMs: response.latencyMs,
              model: response.model,
              role: "assistant",
            },
          ])
        );
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

      try {
        const audioStream = await getSaiAudioStreamModule();
        await audioStream.stopSaiAudioStreamAsync();
      } catch {
        // Native stream may already be stopped or unavailable.
      }

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
        setVoicePlaybackStage("idle");
        setVoiceConnectionState("connecting");
        setVoicePartialTranscript("");
        setVoiceFinalTranscript("");
        voiceFinalTranscriptRef.current = "";
        voiceAnswerBufferRef.current = "";
        voiceAudioChunkPartsRef.current = [];
        voiceResponseChunkCountRef.current = 0;
        completedVoiceTurnIdRef.current = null;
        completedVoiceAssistantMessageIdRef.current = null;
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
          locale: VOICE_PRIMARY_LOCALE,
          pillar: "experiences" as const,
          secondaryLocale: VOICE_SECONDARY_LOCALE,
          ttsVoiceId: ELEVENLABS_VOICE_ID,
          voiceProvider: VOICE_PROVIDER,
        };

        logVoiceProductionCheck("voice language contract", {
          answerLocale: AI_REPLY_LOCALE,
          primarySpeechLocale: VOICE_PRIMARY_LOCALE,
          secondarySpeechLocale: VOICE_SECONDARY_LOCALE,
        });

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

        const sttProvider = session.providers?.stt?.toLowerCase();

        if (!sttProvider || sttProvider.includes("mock")) {
          throw new Error(
            "Real speech recognition is not enabled on the server yet. Please type your question for now."
          );
        }

        if (VOICE_PROVIDER === "elevenlabs") {
          const ttsProvider = session.providers?.tts?.toLowerCase();
          const outputFormat = session.audio?.outputFormat?.toLowerCase();

          if (ttsProvider !== "elevenlabs") {
            throw new Error(
              `Voice backend returned TTS provider "${ttsProvider || "unknown"}" instead of ElevenLabs.`
            );
          }

          if (!outputFormat?.startsWith("mp3")) {
            throw new Error(
              `Voice backend returned "${outputFormat || "unknown"}" instead of ElevenLabs MP3 audio.`
            );
          }

          if (
            process.env.EXPO_PUBLIC_API_BASE_URL ===
              "https://saifamily.sustaininsight.com" &&
            !session.webSocketUrl.startsWith(
              "wss://saifamily.sustaininsight.com/api/ai/voice/ws"
            )
          ) {
            throw new Error(
              "Voice backend returned an unexpected production WebSocket URL."
            );
          }
        }

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
        voiceSessionRef.current = session;
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
              currentState === "error" || currentState === "speaking"
                ? currentState
                : "idle"
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
            setVoicePlaybackStage("failed");
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
            setVoiceError("");

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
        setVoiceError("");
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
      setVoicePlaybackStage("failed");
      void cleanupBackendVoiceSessions("voice-start-failed");

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
      await handleVoiceQuestion();
      startWaitingTone();
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
    const activeTurnId = activeVoiceTurnIdRef.current;

    if (
      activeTurnId &&
      voiceSocketRef.current?.readyState === WebSocket.OPEN
    ) {
      voiceSocketRef.current.send({
        turnId: activeTurnId,
        type: "barge_in",
      });
      logVoiceDebug("Voice reply interrupted by user", {
        turnId: activeTurnId,
      });
    }

    await stopWaitingTone();
    await stopSpeech();
    setAnswer("");
    setVoiceError("");
    setVoicePlaybackStage("idle");
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
    stopSpeech,
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
  const detectedTranscriptLanguage = detectTranscriptLanguage(
    voicePartialTranscript || voiceFinalTranscript
  );
  const hasModalTranscript = modalTranscript.trim().length >= 3;
  const isVoiceThinking =
    voiceConnectionState === "thinking" ||
    voicePlaybackStage === "waiting" ||
    voicePlaybackStage === "buffering" ||
    (isWaitingToneActive && !isSpeaking);
  const isVoicePlaying =
    voicePlaybackStage === "playing" && isSpeaking;
  const isVoiceFinished = voicePlaybackStage === "completed";
  const hasVoiceFailed =
    voicePlaybackStage === "failed" || voiceConnectionState === "error";
  const canInterruptVoiceReply = isVoicePlaying || isVoiceThinking;
  const isVoiceSubmitDisabled =
    isSubmitting ||
    voiceConnectionState === "connecting" ||
    (!FULL_DUPLEX_VOICE_ENABLED && !hasModalTranscript);
  const canListenAgain =
    !isListening &&
    !isVoiceThinking &&
    !isVoicePlaying &&
    voiceConnectionState !== "connecting" &&
    (hasVoiceFailed || isVoiceFinished || hasModalTranscript);
  const voiceModalTitle = isVoicePlaying
    ? "Sai guidance is playing"
    : voicePlaybackStage === "buffering"
      ? "Preparing the voice"
    : isVoiceThinking
      ? "Preparing guidance"
      : isListening
        ? "I am listening"
        : hasVoiceFailed
          ? "Voice could not play"
          : isVoiceFinished
            ? "Guidance complete"
        : "Ask Sai by voice";
  const voiceModalSubtitle = isVoicePlaying
    ? "ElevenLabs voice is playing. Turn up media volume if needed."
    : voicePlaybackStage === "buffering"
      ? "Your answer is ready. Audio will begin shortly."
    : isVoiceThinking
      ? "Please wait while the written reply and voice are prepared."
      : isListening
        ? "Speak clearly, then tap Finish & Ask."
        : hasVoiceFailed
          ? answer
            ? "Your written reply is safe below. You can try voice again."
            : "The voice connection stopped. Please try once more."
          : isVoiceFinished
            ? "You can read the answer or ask another question."
            : "Speak in Hindi or English. Your reply will come in Hindi.";
  const voicePrimaryLabel = isListening
    ? "Finish & Ask"
    : isVoicePlaying
      ? "Stop & ask again"
      : isVoiceThinking
        ? "Cancel & ask again"
        : hasVoiceFailed
          ? "Try again"
          : isVoiceFinished
            ? "Ask another"
            : "Start listening";
  const latestConversationMessage = messages[messages.length - 1];
  const hasCurrentAnswerInMessages =
    Boolean(answer.trim()) &&
    latestConversationMessage?.role === "assistant" &&
    latestConversationMessage.content === answer;
  const previousConversationMessages =
    hasCurrentAnswerInMessages && messages.length >= 2
      ? messages.slice(0, -2)
      : messages;
  const revealQuestionInput = () => {
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({
        animated: true,
        y: Math.max(0, questionCardYRef.current - 12),
      });
    }, 120);
  };
  const revealVoiceTranscript = () => {
    setTimeout(() => {
      voiceModalScrollRef.current?.scrollTo({
        animated: true,
        y: Math.max(0, voiceTranscriptYRef.current - 12),
      });
    }, 120);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          ref={mainScrollRef}
          bounces
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 28 },
          ]}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
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

          <View
            onLayout={(event) => {
              questionCardYRef.current = event.nativeEvent.layout.y;
            }}
            style={styles.card}
          >
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
              onFocus={revealQuestionInput}
              onSubmitEditing={Keyboard.dismiss}
              placeholder="Write your question here..."
              placeholderTextColor="#A8A29E"
              returnKeyType="done"
              style={styles.input}
              submitBehavior="blurAndSubmit"
              textAlignVertical="top"
              value={question}
            />
            <View style={styles.voiceModeHint}>
              <Volume2 color="#B45309" size={16} strokeWidth={2.3} />
              <Text style={styles.voiceModeHintText}>
                Speak naturally in Hindi or English. Your words stay in the
                detected language, and Sai guidance replies in Hindi.
              </Text>
            </View>
            {/* just remove */}
            {/* <SaiRamWaitingCard
                  active={isWaitingToneActive}
                  compact
                /> */}

            <SaiRamWaitingCard
              active={isSubmitting && !isVoiceModalVisible}
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
                  {detectedTranscriptLanguage
                    ? ` in ${detectedTranscriptLanguage}`
                    : ""}
                </Text>
                <Text style={styles.voiceTranscriptText}>
                  {voicePartialTranscript || voiceFinalTranscript}
                </Text>
              </View>
            ) : null}

            {__DEV__ && voiceSession ? (
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

          {answer ? (
            <View style={styles.answerCard}>
              <View style={styles.answerHeader}>
                <View>
                  <Text style={styles.answerEyebrow}>REPLY</Text>
                  <Text style={styles.answerTitle}>Sai assistant says</Text>
                </View>
                {voiceHadAudioChunksRef.current ||
                !FULL_DUPLEX_VOICE_ENABLED ||
                VOICE_PROVIDER !== "elevenlabs" ? (
                  <Pressable
                    accessibilityLabel={
                      isSpeaking ? "Stop voice reply" : "Play voice reply"
                    }
                    onPress={speakAnswer}
                    style={({ pressed }) => [
                      styles.speakButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    {isSpeaking ? (
                      <>
                        <Pause color="#FFFFFF" size={18} fill="#FFFFFF" />
                        <Text style={styles.speakButtonText}>Stop</Text>
                      </>
                    ) : (
                      <Volume2
                        color="#FFFFFF"
                        size={18}
                        strokeWidth={2.4}
                      />
                    )}
                  </Pressable>
                ) : null}
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

          {previousConversationMessages.length > 0 ? (
            <View style={styles.threadCard}>
              <Text style={styles.threadTitle}>Earlier in this conversation</Text>
              {previousConversationMessages.map((message) => (
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
        </ScrollView>
      </LinearGradient>

      <Modal
        animationType="fade"
        onRequestClose={closeVoiceModal}
        transparent
        visible={isVoiceModalVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.voiceModalKeyboardView}
        >
          <View style={styles.voiceModalBackdrop}>
            <Pressable
              onPress={closeVoiceModal}
              style={styles.voiceModalBackdropPress}
            />
            <View
              style={[
                styles.voiceModalCard,
                { maxHeight: windowHeight * 0.9 },
              ]}
            >
              <ScrollView
                ref={voiceModalScrollRef}
                bounces={false}
                contentContainerStyle={styles.voiceModalScrollContent}
                keyboardDismissMode={
                  Platform.OS === "ios" ? "interactive" : "on-drag"
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.voiceModalHandle} />
                <View style={styles.voiceModalHeader}>
                  <View style={styles.voiceModalIcon}>
                    {isVoicePlaying ? (
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
                      (isListening || isVoicePlaying) &&
                        styles.voiceWaveDotActive,
                    ]}
                  />
                  <View
                    style={[
                      styles.voiceWaveDot,
                      styles.voiceWaveDotTall,
                      (isListening ||
                        isWaitingToneActive ||
                        isVoicePlaying) &&
                        styles.voiceWaveDotActive,
                    ]}
                  />
                  <View
                    style={[
                      styles.voiceWaveDot,
                      (isVoicePlaying || isWaitingToneActive) &&
                        styles.voiceWaveDotActive,
                    ]}
                  />
                </View>

                <SaiRamWaitingCard
                  active={isWaitingToneActive}
                  compact
                />

                <View
                  onLayout={(event) => {
                    voiceTranscriptYRef.current = event.nativeEvent.layout.y;
                  }}
                  style={styles.voiceModalTranscriptBox}
                >
                  <Text style={styles.voiceModalTranscriptLabel}>
                    {modalTranscript
                      ? `${detectedTranscriptLanguage || "Speech"} detected · Review your words`
                      : "Hindi + English listening"}
                  </Text>
                  <TextInput
                    editable={!isVoiceThinking && !isVoicePlaying}
                    multiline
                    onChangeText={updateVoiceTranscript}
                    onFocus={revealVoiceTranscript}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Speak naturally. You can share your problem, prayer, or question."
                    placeholderTextColor="#9A8265"
                    returnKeyType="done"
                    style={styles.voiceModalTranscriptInput}
                    submitBehavior="blurAndSubmit"
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

                {answer &&
                (isVoicePlaying || isVoiceFinished || hasVoiceFailed) ? (
                  <View style={styles.voiceModalAnswerBox}>
                    <Text style={styles.voiceModalTranscriptLabel}>
                      {hasVoiceFailed
                        ? "Written reply"
                        : isVoicePlaying
                          ? "Now playing"
                          : "Sai assistant"}
                    </Text>
                    <Text
                      numberOfLines={4}
                      style={styles.voiceModalAnswerText}
                    >
                      {answer}
                    </Text>
                  </View>
                ) : null}

                {voiceError ? (
                  <Text style={styles.voiceModalError}>{voiceError}</Text>
                ) : null}
              </ScrollView>

              <View
                style={[
                  styles.voiceModalActions,
                  { paddingBottom: Math.max(insets.bottom, 12) },
                ]}
              >
                <Pressable
                  onPress={closeVoiceModal}
                  style={({ pressed }) => [
                    styles.voiceModalSecondaryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.voiceModalSecondaryText}>
                    {isVoicePlaying || isVoiceFinished ? "Close" : "Cancel"}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={isVoiceSubmitDisabled}
                  onPress={
                    canInterruptVoiceReply ||
                    hasVoiceFailed ||
                    isVoiceFinished
                      ? listenAgainFromModal
                      : submitVoiceModal
                  }
                  style={({ pressed }) => [
                    styles.voiceModalPrimaryButton,
                    isVoiceSubmitDisabled && styles.voiceModalPrimaryDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  {isVoiceThinking ? (
                    <>
                      <RotateCcw
                        color="#FFFFFF"
                        size={17}
                        strokeWidth={2.5}
                      />
                      <Text style={styles.voiceModalPrimaryText}>
                        {voicePrimaryLabel}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.voiceModalPrimaryText}>
                        {voicePrimaryLabel}
                      </Text>
                      {isVoicePlaying ? (
                        <Pause
                          color="#FFFFFF"
                          size={17}
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Send color="#FFFFFF" size={17} strokeWidth={2.5} />
                      )}
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  voiceModeHint: {
    alignItems: "flex-start",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  voiceModeHintText: {
    color: "#7C2D12",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
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
    flexDirection: "row",
    gap: 7,
    height: 44,
    justifyContent: "center",
    minWidth: 44,
    paddingHorizontal: 13,
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
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
  voiceModalKeyboardView: {
    flex: 1,
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
    flexShrink: 1,
    overflow: "hidden",
    paddingHorizontal: 20,
    shadowColor: "#7C2D12",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },
  voiceModalScrollContent: {
    paddingBottom: 4,
    paddingTop: 10,
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
  saiRamWaitingCard: {
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderColor: "#F4D58D",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
    padding: 14,
  },
  saiRamWaitingCardCompact: {
    marginBottom: 12,
    marginTop: 0,
    padding: 12,
  },
  saiRamCounterCircle: {
    alignItems: "center",
    backgroundColor: "#f39954",
    borderColor: "#FDE68A",
    borderRadius: 38,
    borderWidth: 3,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  saiRamCounterValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 29,
    textAlign: "center",
  },
  saiRamCounterLabel: {
    color: "#FDE68A",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 1,
  },
  saiRamWaitingContent: {
    flex: 1,
    minWidth: 0,
  },
  saiRamWaitingName: {
    color: "#c93909",
    fontSize: 21,
    fontWeight: "900",
  },
  saiRamWaitingMessage: {
    color: "#785B3D",
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 13,
    marginTop: 2,
  },
  saiRamMeterTrack: {
    backgroundColor: "#F7E6B5",
    borderRadius: 999,
    height: 7,
    marginTop: 10,
    overflow: "hidden",
    width: "100%",
  },
  saiRamMeterFill: {
    backgroundColor: "#B45309",
    borderRadius: 999,
    height: "100%",
  },
  saiRamWaitingMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  saiRamWaitingMetaText: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "800",
  },
  saiRamWaitingTime: {
    color: "#7C2D12",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
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
    backgroundColor: "#FFFDF8",
    borderTopColor: "#F3E1BE",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
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
