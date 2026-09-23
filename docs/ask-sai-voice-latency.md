# Ask Sai Voice Latency Changes

Status: sentence streaming is implemented locally but NOT requested by the mobile client after reported auto-send/playback regressions. The default is the existing full-reply ElevenLabs MP3 flow. Device verification is pending.

## Recovery Changes

- Removed `audioDelivery: "sentence_mp3"` from the mobile `start` request. No backend deployment is required for this fallback when the existing voice API is running.
- Silence deadlines are checked every 100 ms while native capture is ready. Continued speech extends the deadline; two seconds of detected silence submits automatically. The timer is removed when the capture modal closes.
- Audio activity uses a bounded recent noise estimate instead of the previous fixed low threshold. Repeated identical STT partials do not reset the deadline. This remains amplitude-based detection, not a guarantee for every noisy environment.
- Submit, final transcript and socket cleanup share one native stop promise per capture. Playback waits for that promise, avoiding repeated iOS session deactivation during the reply.
- Current mobile checks: 12 silence/capture-stop/queue tests passed; TypeScript passed; targeted lint has no errors (existing unused-code warnings remain).
- Verify on a phone: speak continuously for 15 seconds, pause for two seconds, confirm automatic submission, then confirm ElevenLabs audio and repeat for a second question. Test quiet and fan-noise conditions. Do not re-enable sentence streaming until these tests and Stop/replay tests pass.

## What Changes

The optional protocol below uses `audioDelivery: "sentence_mp3"` in the WebSocket `start` event; mobile currently omits it. When requested, the backend streams actual Azure Chat Completions or OpenAI Responses text and emits normalized, personalized complete sentences. Short sentences may be grouped to avoid excessive TTS calls. While the model generates the rest, ElevenLabs synthesizes the first sentence group. Each group is sent as a complete MP3 and played sequentially on mobile.

Old clients that do not advertise this capability keep their existing full-answer audio flow. The new client still accepts the legacy fragmented MP3 response from an old backend.

The AI model, voice ID and selected Hindi/English language are unchanged. This change does not guarantee a particular response time or improve model accuracy by itself.

The text-only POST flow is unchanged. Streaming removes full-answer buffering from the opted-in voice flow; it cannot remove a long wait for the provider's first token. If `firstTokenMs` remains high, investigate provider/deployment latency before attributing that wait to mobile playback.

## Additive WebSocket Contract

Client start event, in addition to existing turnId and audio input settings:

```json
{ "type": "start", "turnId": "turn-example", "audioDelivery": "sentence_mp3" }
```

Server audio event:

```json
{
  "type": "audio_chunk",
  "turnId": "turn-example",
  "encoding": "base64",
  "format": "mp3_44100_128",
  "data": "<complete MP3 for this sentence group>",
  "completeSegment": true,
  "segmentIndex": 0
}
```

Indices start at zero and increase in playback order. `turn_complete` includes `audioSegments`, the total number sent. It means generation and delivery are complete, not that the user has finished listening. Mobile marks playback complete only after its queue drains.

Stop, route exit, and replacement turns abort the queue and dispose of players/cache files. The backend aborts its LLM and TTS calls on socket close or barge-in. TTS errors retain the available text. Retries after partial output are not automatic, to avoid repeating spoken sentences.

## Release And Verify

These steps apply to a future opt-in sentence-streaming test, not the currently restored default flow.

1. Deploy the backend changes first. Confirm existing clients still get their usual response.
2. Load the updated mobile JavaScript in a development build with the existing expo-audio module. No new native package was introduced by this change.
3. Ask a Hindi question, then an English question. Confirm name greeting occurs once, sentences play in order, and text matches spoken content.
4. Watch `[AskSaiVoiceProd] First sentence playback started`. `beforeTurnComplete: true` demonstrates early playback on that turn. Very short answers may finish generating before playback begins.
5. Compare `afterSpeechMs` across the same questions and network before/after. This measures from sending `end_input` to the native player reporting playback, not acoustic output measured with external equipment. Do not compare total mic-tap time, which includes the user's speech.
6. Stop during the first sentence, immediately ask another question, and verify old audio never resumes. Repeat while audio is loading, after generation ends but audio is still playing, and while navigating away.
7. Test audio replay, a TTS failure, network disconnect, and both iOS/Android audio routes. Ensure no automatic device TTS substitutes for ElevenLabs.
8. Measure multiple turns under representative concurrency. Sentence TTS requests can add per-request overhead and small playback gaps; evaluate voice continuity and cost before broad rollout.

## Verification Scope

Automated checks cover split UTF-8/SSE frames, provider events, sentence boundaries, early audio delivery, ordering, duplicate suppression, cancellation and playback errors. Real provider latency and speaker output require a device test; mocked tests do not certify them.

Local verification (2026-09-22):

- Backend: 22 tests passed across streaming, sentence audio, prompt and personalization suites; TypeScript build passed.
- Mobile: 8 queue/silence tests passed; TypeScript check passed.
- Targeted lint: no errors; existing unused-code/import warnings remain in Ask Sai and the API service.
- No production deployment or paid Azure/ElevenLabs call was performed. iOS/Android speaker output, audio gaps, interruption behavior and real latency remain release checks.

Provider references: [OpenAI streaming](https://developers.openai.com/api/docs/guides/streaming-responses), [ElevenLabs stream speech](https://elevenlabs.io/docs/api-reference/text-to-speech/stream).
