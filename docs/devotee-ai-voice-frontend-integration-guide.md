# Devotee AI Voice Assistant Frontend Integration Guide

This document is for React Native frontend integration of the Sai Family voice AI assistant.

Goal:

```text
User speaks -> backend transcribes -> GPT-5 answers -> backend streams voice audio -> app plays response
```

The backend owns all Azure/OpenAI/ElevenLabs keys. The mobile app must never store provider credentials.

## Current Backend Status

Implemented now:

```http
POST /api/ai/voice/sessions
```

This creates a short-lived voice session and returns the WebSocket URL/token.

Next backend step:

```text
/api/ai/voice/ws
```

The WebSocket will stream mic audio up and state/transcript/audio events down.

## Required Mobile Runtime

Expo Go is not enough for production voice streaming because we need raw mic PCM chunks.

Use:

```text
Expo Dev Client
EAS dev/prod builds
Native audio streaming module
Native chunked audio playback module
```

Current build-safe packages:

```bash
npx expo install expo-dev-client
npm install react-native-audio-api
npm install ./modules/sai-audio-stream
```

Do not install `@siteed/expo-audio-stream` on Expo SDK 54 at this time.
It is deprecated and now only re-exports `@siteed/audio-studio`, which failed
Android compilation in this project.

Deprecated package message:

```text
Deprecated: use @siteed/audio-studio instead. This compatibility shim only re-exports @siteed/audio-studio.
```

`@siteed/audio-studio@3.2.1` failed with Expo SDK 54 Android Kotlin errors
around `Promise.reject`, so it is not currently build-safe for this app.

Possible mic package to investigate separately:

```bash
npm install react-native-live-audio-stream
```

Do not install the alternative blindly; first confirm it supports React Native
0.81, Expo SDK 54, Android, iOS, and New Architecture.

## Current Mobile Mic Implementation

This app now uses a local Expo module instead of a third-party recording shim:

```text
modules/sai-audio-stream
```

Why:

- We need raw PCM chunks for low-latency voice AI.
- Expo Go cannot provide this native streaming path.
- `@siteed/expo-audio-stream` is deprecated.
- `@siteed/audio-studio@3.2.1` failed Android compilation on Expo SDK 54.

The local module emits `pcm_s16le` mic chunks as base64:

```ts
import {
  addAudioChunkListener,
  requestSaiAudioStreamPermissionsAsync,
  startSaiAudioStreamAsync,
  stopSaiAudioStreamAsync,
} from "sai-audio-stream";
```

Runtime settings should come from `POST /api/ai/voice/sessions`:

```ts
await startSaiAudioStreamAsync({
  sampleRate: session.audio.sampleRate, // normally 16000
  channels: session.audio.channels, // 1
  chunkMs: session.audio.chunkMs, // 100
});
```

Each chunk is sent to the backend WebSocket as:

```json
{
  "type": "audio_chunk",
  "encoding": "base64",
  "data": "<pcm_s16le_base64>",
  "turnId": "<current_turn_id>"
}
```

Build requirement:

```text
Use Expo development build or production build. This will not work in Expo Go.
```

## Environment Variables

Frontend should only know backend URLs:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.9:8000
EXPO_PUBLIC_AI_VOICE_ENABLED=true
```

Do not add:

```text
AZURE_SPEECH_KEY
AZURE_OPENAI_API_KEY
ELEVENLABS_API_KEY
```

## Auth Requirement

All voice APIs require normal user login.

Send:

```http
Authorization: Bearer <accessToken>
```

If API returns `401`, refresh token using existing auth flow, then retry once.

## Step 1: Create Voice Session

Request:

```http
POST /api/ai/voice/sessions
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Body for current local testing:

```json
{
  "pillar": "experiences",
  "locale": "hi-IN",
  "secondaryLocale": "en-IN",
  "voiceProvider": "mock"
}
```

Body for real provider later:

```json
{
  "pillar": "experiences",
  "locale": "hi-IN",
  "secondaryLocale": "en-IN",
  "voiceProvider": "elevenlabs"
}
```

Response:

```json
{
  "sessionId": "cm-voice-session-123",
  "sessionToken": "short-lived-opaque-token",
  "conversationId": "cm-ai-conv-123",
  "expiresAt": "2026-07-13T10:30:00.000Z",
  "webSocketUrl": "ws://localhost:8000/api/ai/voice/ws?sessionId=cm-voice-session-123&token=short-lived-opaque-token",
  "status": "active",
  "audio": {
    "inputFormat": "pcm_s16le",
    "outputFormat": "mp3_44100",
    "sampleRate": 16000,
    "channels": 1,
    "chunkMs": 100
  },
  "providers": {
    "stt": "mock",
    "llm": "azure_openai",
    "tts": "mock"
  },
  "limits": {
    "maxSessionSeconds": 600,
    "maxTurnsPerSession": 30,
    "bargeInEnabled": true
  }
}
```

Frontend should store in memory:

```ts
export type VoiceSession = {
  sessionId: string;
  sessionToken: string;
  conversationId: string;
  expiresAt: string;
  webSocketUrl: string;
  status: "active" | "ended" | "failed";
  audio: {
    inputFormat: "pcm_s16le";
    outputFormat: "mp3_44100";
    sampleRate: number;
    channels: number;
    chunkMs: number;
  };
  providers: {
    stt: "mock" | "azure_speech";
    llm: "openai" | "azure_openai";
    tts: "mock" | "elevenlabs";
  };
  limits: {
    maxSessionSeconds: number;
    maxTurnsPerSession: number;
    bargeInEnabled: boolean;
  };
};
```

Do not persist `sessionToken` permanently. It is short-lived.

## Voice State Machine

Use a strict state machine so UI does not become confused.

```ts
export type VoiceAiState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "error";
```

State meaning:

| State | Meaning |
| --- | --- |
| `idle` | No active voice session |
| `connecting` | Creating session or opening socket |
| `listening` | Mic is active and streaming |
| `thinking` | User speech ended; waiting for AI |
| `speaking` | Audio response is playing |
| `interrupted` | User barged in or playback stopped |
| `error` | Recoverable error shown to user |

## Recommended Frontend Folder Structure

Use feature-based structure:

```text
src/features/devotee-ai-voice/
  api/
    voiceAiApi.ts
  hooks/
    useVoiceAiSession.ts
    useVoiceAiSocket.ts
    useVoiceRecorder.ts
    useVoicePlaybackQueue.ts
  components/
    VoiceAssistantButton.tsx
    VoiceAssistantSheet.tsx
    VoiceWaveform.tsx
    VoiceTranscript.tsx
    VoiceErrorBanner.tsx
  state/
    voiceAi.types.ts
    voiceAi.reducer.ts
  utils/
    turnId.ts
    audioFormat.ts
```

## API Layer

Example:

```ts
export type CreateVoiceSessionInput = {
  pillar?: "experiences" | "events" | "directory" | "sangha";
  locale?: "hi-IN" | "en-IN";
  secondaryLocale?: "hi-IN" | "en-IN";
  voiceProvider?: "mock" | "elevenlabs";
  conversationId?: string;
};

export async function createVoiceSession(
  input: CreateVoiceSessionInput,
  accessToken: string,
): Promise<VoiceSession> {
  const response = await fetch(`${API_BASE_URL}/api/ai/voice/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      pillar: input.pillar ?? "experiences",
      locale: input.locale ?? "hi-IN",
      secondaryLocale: input.secondaryLocale ?? "en-IN",
      voiceProvider: input.voiceProvider ?? "mock",
      conversationId: input.conversationId,
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new VoiceAiApiError(json.error?.code, json.error?.message);
  }

  return json as VoiceSession;
}
```

## WebSocket Contract

Backend WebSocket URL comes from `createVoiceSession.webSocketUrl`.

Open:

```ts
const socket = new WebSocket(session.webSocketUrl);
```

### Client -> Server Events

Start turn:

```json
{
  "type": "start",
  "turnId": "turn-001",
  "audio": {
    "format": "pcm_s16le",
    "sampleRate": 16000,
    "channels": 1,
    "chunkMs": 100
  }
}
```

Audio chunk fallback JSON format:

```json
{
  "type": "audio_chunk",
  "turnId": "turn-001",
  "encoding": "base64",
  "data": "<base64-pcm-chunk>"
}
```

Preferred production format:

```text
Binary PCM chunks every ~100ms
```

End input:

```json
{
  "type": "end_input",
  "turnId": "turn-001"
}
```

Barge-in:

```json
{
  "type": "barge_in",
  "turnId": "turn-002"
}
```

### Server -> Client Events

State:

```json
{
  "type": "state",
  "sessionId": "cm-voice-session-123",
  "turnId": "turn-001",
  "state": "listening"
}
```

Partial transcript:

```json
{
  "type": "transcript_partial",
  "turnId": "turn-001",
  "text": "Sai Baba mujhe"
}
```

Final transcript:

```json
{
  "type": "transcript_final",
  "turnId": "turn-001",
  "text": "Sai Baba mujhe mushkil samay mein dhairya kaise rakhna chahiye?"
}
```

Text delta:

```json
{
  "type": "answer_delta",
  "turnId": "turn-001",
  "text": "Om Sai Ram. "
}
```

Audio chunk:

```json
{
  "type": "audio_chunk",
  "turnId": "turn-001",
  "format": "mp3_44100",
  "encoding": "base64",
  "data": "<base64-audio-chunk>"
}
```

Stop playback:

```json
{
  "type": "stop_playback",
  "turnId": "turn-001",
  "reason": "barge_in"
}
```

Turn complete:

```json
{
  "type": "turn_complete",
  "turnId": "turn-001",
  "conversationId": "cm-ai-conv-123",
  "messageId": "cm-ai-msg-456",
  "latency": {
    "speechEndpointMs": 620,
    "firstTokenMs": 480,
    "firstAudioMs": 310,
    "totalMs": 2400
  }
}
```

Error:

```json
{
  "type": "error",
  "turnId": "turn-001",
  "code": "VOICE_TTS_FAILED",
  "message": "Voice response is unavailable right now."
}
```

## WebSocket Hook Behavior

`useVoiceAiSocket` should:

- Open socket after session creation.
- Send `start` when socket opens and mic is ready.
- Send audio chunks while state is `listening`.
- Parse all server JSON events.
- Ignore events whose `turnId` is not the active turn.
- Close socket when session ends.
- Cleanup on screen unmount.
- Retry only on safe connection failures, not auth failures.

Pseudo API:

```ts
export function useVoiceAiSocket(params: {
  session: VoiceSession | null;
  activeTurnId: string | null;
  onEvent: (event: VoiceServerEvent) => void;
}) {
  return {
    connect,
    disconnect,
    sendStartTurn,
    sendAudioChunk,
    sendEndInput,
    sendBargeIn,
    readyState,
  };
}
```

## Mic Recording Requirements

Production input format:

```text
PCM signed 16-bit little-endian
16 kHz
mono
100ms chunks
```

Frontend must:

- Request microphone permission before starting.
- Show permission denied UI if rejected.
- Stop recorder on unmount.
- Stop recorder when socket closes.
- Avoid storing raw audio on device.
- Send chunks immediately, not after full recording.

## Playback Queue Requirements

The backend sends audio chunks as base64 MP3.

Frontend should:

- Convert base64 chunk to playable audio buffer.
- Push chunks into a FIFO queue.
- Start playback after about 200ms of buffered audio.
- Drop chunks from stale `turnId`.
- Stop immediately on `stop_playback`.
- Clear queue on barge-in.

Avoid using `expo-av` for chunked streaming if it causes gaps. Prefer a lower-level audio API/player that can append buffers.

## Barge-In Behavior

When user speaks while AI is speaking:

1. Stop audio playback immediately.
2. Clear playback queue.
3. Create a new `turnId`.
4. Send `barge_in` with new turn ID.
5. Switch UI to `listening`.
6. Resume mic streaming.

This is required for a natural assistant experience.

## UX Requirements

The voice assistant screen/sheet should show:

- Calm idle CTA.
- Listening animation.
- Partial transcript while user speaks.
- Thinking animation after final transcript.
- Speaking animation while audio plays.
- Error banner with retry action.
- Stop button.
- Optional text fallback button.

Do not show technical provider errors directly to users.

User-facing error examples:

| Backend Code | UI Message |
| --- | --- |
| `UNAUTHENTICATED` | Please login again. |
| `VOICE_AI_DISABLED` | Voice assistant is not available right now. |
| `VOICE_SESSION_RATE_LIMITED` | Please try again after some time. |
| `VOICE_SESSION_ALREADY_ACTIVE` | Another voice session is already active. |
| `VOICE_STT_NOT_CONFIGURED` | Voice assistant is not ready yet. |
| `VOICE_TTS_NOT_CONFIGURED` | Voice response is not ready yet. |
| `VOICE_TTS_FAILED` | Voice response failed. Please try again. |

## React Query Integration

Use mutation for session creation:

```ts
const createSessionMutation = useMutation({
  mutationFn: (input: CreateVoiceSessionInput) =>
    createVoiceSession(input, accessToken),
});
```

Do not cache `sessionToken`.

Invalidate AI conversation queries after `turn_complete`:

```ts
queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
queryClient.invalidateQueries({ queryKey: ["ai", "conversation", conversationId] });
```

## Redux/Local State

Voice streaming state changes quickly. Prefer local reducer inside the feature unless global UI needs it.

Recommended reducer state:

```ts
export type VoiceAiReducerState = {
  state: VoiceAiState;
  session: VoiceSession | null;
  activeTurnId: string | null;
  partialTranscript: string;
  finalTranscript: string;
  answerText: string;
  errorCode?: string;
  errorMessage?: string;
};
```

## Production Rollout Plan

### Phase 1: Session API Only

Frontend:

- Call `POST /api/ai/voice/sessions`.
- Use `voiceProvider=mock`.
- Confirm response shape.
- Store `webSocketUrl`.

Backend needed:

- DB migration applied.
- `VOICE_AI_ENABLED=true` in local/dev.

### Phase 2: WebSocket Mock

Frontend:

- Connect to `webSocketUrl`.
- Send `start`.
- Render mock `state`, `transcript_partial`, `transcript_final`, `answer_delta`, `turn_complete`.

Backend:

- Adds `/api/ai/voice/ws` mock gateway.

### Phase 3: Mic Streaming

Frontend:

- Integrate native mic stream.
- Send PCM chunks.
- Validate chunk frequency and size.

Backend:

- Accept chunks.
- Still mock STT response if Azure Speech is not ready.

### Phase 4: Azure Speech

Frontend:

- Show real partial transcripts.
- Tune endpointing UX.

Backend:

- Streams chunks to Azure Speech.

### Phase 5: ElevenLabs Playback

Frontend:

- Play streamed audio chunks.
- Implement playback queue.
- Handle `stop_playback`.

Backend:

- Streams GPT text to ElevenLabs TTS.

### Phase 6: Barge-In

Frontend:

- Detect speech during playback.
- Stop playback and start new turn.

Backend:

- Cancels old STT/GPT/TTS streams.

## Testing Checklist

Session API:

- Login and get access token.
- Create voice session with `mock`.
- Missing token returns `401`.
- `VOICE_AI_ENABLED=false` returns `503`.
- Response contains valid `webSocketUrl`.

WebSocket:

- Socket connects.
- `start` event is accepted.
- State updates render correctly.
- Stale `turnId` events are ignored.
- Socket cleanup works on unmount.

Mic:

- Permission denied flow works.
- Permission granted flow starts chunks.
- Chunks stop on end/cancel.
- App background stops recording.

Playback:

- Audio queue starts quickly.
- Stale chunks are dropped.
- Barge-in clears playback.
- Network interruption does not crash UI.

Real-world QA:

- Hindi only.
- English only.
- Hindi-English mixed.
- Slow speech.
- Noisy room.
- User interrupts AI.
- App goes background/foreground.
- Poor network.

## Security Checklist

- No provider API keys in frontend.
- No raw audio stored.
- Session token stored only in memory.
- WebSocket closes on logout.
- App clears session on auth refresh failure.
- User can stop voice session anytime.

## Performance Targets

| Metric | Target |
| --- | ---: |
| Session creation | under 500ms local, under 1s production |
| Mic chunk interval | 100ms |
| Playback buffer before start | 150-250ms |
| First AI audio after speech end | 1.2s-1.8s target |
| Max session duration | 10 minutes |

## Open Frontend Decisions

- Final voice assistant UI entry point.
- Bottom sheet vs full screen.
- Audio visualizer design.
- Whether transcript stays visible after answer.
- Whether user can switch Hindi/English manually.
- Whether text fallback appears automatically after voice errors.

## Backend Files To Track

Current backend implementation:

```text
src/controllers/voice-ai.controller.ts
src/services/voice-ai.service.ts
src/services/voice-session-token.service.ts
src/repositories/voice-ai.repository.ts
prisma/migrations/20260713120000_add_devotee_ai_voice_assistant/migration.sql
docs/postman/backend-sai-family.postman_collection.json
docs/postman/backend-sai-family.postman_environment.json
```

Implementation plan:

```text
docs/devotee-ai-voice-assistant-implementation-plan.md
```
