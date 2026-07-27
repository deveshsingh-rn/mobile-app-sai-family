# Ask Sai Multilingual Backend Requirements

## Goal

Ask Sai must accept typed and spoken questions in the language selected by the
devotee, preserve the original transcript, and answer in that same language.

The mobile frontend now supports:

- Hindi: `hi-IN`
- English: `en-IN`
- Marathi: `mr-IN`
- Bengali: `bn-IN`
- Gujarati: `gu-IN`
- Punjabi: `pa-IN`
- Tamil: `ta-IN`
- Telugu: `te-IN`
- Kannada: `kn-IN`
- Malayalam: `ml-IN`
- Odia: `or-IN`
- Assamese: `as-IN`
- Urdu: `ur-IN`
- Nepali: `ne-NP`

## Required API Changes

### Text Question

`POST /api/ai/devotee-question`

Accept every locale listed above in `locale`. The LLM system instruction must
answer in the requested locale unless safety content requires otherwise.

### Voice Session

`POST /api/ai/voice/sessions`

Current validation only documents `hi-IN` and `en-IN`. Expand `locale` and
`secondaryLocale` to the supported locale enum above.

Example:

```json
{
  "pillar": "experiences",
  "locale": "mr-IN",
  "secondaryLocale": "en-IN",
  "voiceProvider": "elevenlabs"
}
```

The selected locale must be passed to Azure Speech streaming STT. English is
kept as the secondary locale so devotees can naturally mix common English
words.

## WebSocket Events

Include the detected locale when available:

```json
{
  "type": "transcript_final",
  "turnId": "turn-123",
  "text": "मला कठीण काळात धैर्य कसे ठेवावे?",
  "locale": "mr-IN"
}
```

Persist both the transcript and locale with the conversation message.

## LLM And TTS

- Pass the requested locale into the GPT system instruction.
- Do not translate the devotee's stored transcript.
- Generate the answer in the requested language.
- Use an ElevenLabs multilingual model that supports the requested language.
- Return a clear `VOICE_LANGUAGE_UNSUPPORTED` error when the configured TTS
  model cannot synthesize a requested locale.
- Keep MP3 output as `mp3_44100_128`.

## Performance

- Cache Azure recognizer configuration by locale.
- Cache stable LLM language instructions.
- Reuse provider clients; do not create SDK clients for every audio chunk.
- Stream answer sentences to ElevenLabs as soon as sentence boundaries are
  available.
- Limit concurrent active voice sessions per user and always release provider
  streams on disconnect.

## Acceptance Tests

For every supported locale:

1. Create a voice session without a validation error.
2. Speak a native-language sentence and verify the transcript script.
3. Verify the GPT response uses the selected language.
4. Verify ElevenLabs returns playable MP3 audio.
5. Verify Hindi/English code-switching still works.
6. Verify reconnect, interruption, timeout, and active-session cleanup.

