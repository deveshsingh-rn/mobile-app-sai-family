# Devotee AI Real Speech-to-Text Backend Fix

## Current Status

ElevenLabs TTS is working. Real speech-to-text is not implemented.

The production backend currently:

1. Accepts PCM microphone chunks from the mobile WebSocket.
2. Increments `audioChunkCount`.
3. Discards the PCM bytes.
4. Calls `sendTranscriptSimulation()`.
5. Returns the fixed `MOCK_TRANSCRIPT`.

Affected backend file:

```text
src/services/voice-ai-websocket.service.ts
```

The session API currently reports `providers.stt: "azure_speech"` for an
ElevenLabs session, even though the WebSocket still uses mock STT. Provider
metadata must describe the implementation actually handling audio.

## Required Backend Work

Install the Azure Speech SDK:

```bash
npm install microsoft-cognitiveservices-speech-sdk
```

For each WebSocket turn:

1. Create an Azure `PushAudioInputStream` configured as PCM signed 16-bit,
   16 kHz, mono.
2. Create a `SpeechRecognizer` using the push stream.
3. Configure `hi-IN` as primary and `en-IN` as secondary language.
4. Forward every decoded client `audio_chunk.data` buffer into the push
   stream.
5. Emit Azure `recognizing` results as `transcript_partial`.
6. On `end_input`, close the push stream and allow recognition to finalize.
7. Emit the actual recognized text as `transcript_final`.
8. Start the LLM only after the real final transcript exists.
9. Close the recognizer, stream, and timers on completion, barge-in, socket
   close, timeout, or error.

Do not send a transcript or start the LLM on a fixed timer.

## Required Environment

```env
VOICE_AI_ENABLED=true
AZURE_SPEECH_KEY=<server-secret>
AZURE_SPEECH_REGION=<azure-resource-region>
AZURE_SPEECH_PRIMARY_LOCALE=hi-IN
AZURE_SPEECH_SECONDARY_LOCALE=en-IN
AZURE_SPEECH_END_SILENCE_TIMEOUT_MS=650
VOICE_AUDIO_SAMPLE_RATE=16000
VOICE_AUDIO_CHUNK_MS=100
```

Secrets must remain on the backend and must never use an
`EXPO_PUBLIC_` variable.

## Session Contract

Return:

```json
{
  "providers": {
    "stt": "azure_speech",
    "llm": "azure_openai",
    "tts": "elevenlabs"
  }
}
```

Return `stt: "azure_speech"` only when the WebSocket is using the Azure
recognizer. Otherwise return `stt: "mock"`.

## Correct Event Order

```text
connected
listening
transcript_partial (zero or more)
transcript_final (real user speech)
thinking
answer_delta (zero or more)
speaking
audio_chunk (one or more)
turn_complete (last event for the turn)
```

`turn_complete` must not be sent before pending `answer_delta` or
`audio_chunk` events.

## Error Handling

Use structured WebSocket errors:

```json
{
  "type": "error",
  "turnId": "turn-001",
  "code": "VOICE_STT_FAILED",
  "message": "Speech could not be recognized."
}
```

Recommended codes:

- `VOICE_STT_NOT_CONFIGURED`
- `VOICE_STT_NO_SPEECH`
- `VOICE_STT_FAILED`
- `VOICE_STT_TIMEOUT`
- `VOICE_INVALID_AUDIO`

## Acceptance Test

1. Ask three different questions in Hindi, English, and Hinglish.
2. Confirm each `transcript_final.text` matches the spoken question.
3. Confirm the fixed mock sentence never appears unless it was genuinely
   spoken.
4. Confirm more than a few PCM chunks are received for a multi-second
   question.
5. Confirm `turn_complete` is the final event.
6. Confirm the database stores the real transcript.
7. Confirm session cleanup releases the Azure recognizer and push stream.

Target latency:

- first partial transcript: under 800 ms
- final transcript after speech ends: under 1.5 seconds
- first LLM token: under 2.5 seconds
- first ElevenLabs audio: under 4 seconds total

