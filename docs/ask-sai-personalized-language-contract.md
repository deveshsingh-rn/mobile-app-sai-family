# Ask Sai Personalized Hindi/English Contract

## Implementation Status (2026-09-18)

Implemented in the local backend repository:

- Text and voice controller defaults are now `en-IN`.
- `ai.personalization.ts` adds one locale-specific greeting from the
  authenticated profile name, after answer normalization. Final answers
  remain capped at 400 characters.
- The same final answer is returned as text and sent to ElevenLabs.
- Prompt version is `devotee-v10-natural-spoken-hi-en`; guidance asks for a
  specific practical response without invented quotes or guarantees.
- Spoken output is one short plain-text paragraph, without markdown,
  headings, lists, emojis, SSML/audio tags, stage directions, or artificial
  pauses. The guidance body targets 260 to 300 characters to leave room
  for the server-added greeting. Normal punctuation supplies natural pauses.
- Cache keys include the authenticated user ID and selected locale;
  conversations with existing history bypass the generic-answer cache.
- Voice LLM failures emit `VOICE_ANSWER_FAILED` with a localized retry
  message instead of presenting fixed Hindi guidance as a real answer.
- Backend `npm run build` passed; `npm test` passed (11 tests, 4 files),
  including 6 greeting/cache-isolation and 3 spoken-prompt contract tests.

Not yet verified: production deployment, real Azure/ElevenLabs generation,
physical-device Stop behavior, and Hindi/English voice quality. The release
checks below remain pending until those tests are performed.

## Required Backend Alignment

The mobile screen defaults to `en-IN`. Selecting Hindi sends `hi-IN`.
Both POST `/api/ai/devotee-question` and POST `/api/ai/voice/sessions`
already receive `locale` and `devoteeName`.

- `en-IN`: recognize English and answer in natural English, not Hinglish.
- `hi-IN`: recognize Hindi and answer in Hindi Devanagari.
- Do not force all answers to Hindi or choose the reply language from the
  secondary STT locale. The selected primary locale controls the answer.
- Resolve the user's registered name from the authenticated profile. Treat
  any client-supplied name as untrusted display data, not prompt instructions.
- Begin English answers with "My child, {registered name}, ..." and Hindi
  answers with "बेटा {registered name}, ...". Use the greeting once per answer.
- Include this greeting in the generated answer before passing that same
  text to ElevenLabs. Adding a greeting only in mobile cannot change audio.
- Give specific, compassionate guidance grounded in the user's actual
  question and Sai teachings. Avoid generic guarantees, fabricated quotes,
  or presenting the assistant as the actual Sai Baba. Apply existing safety
  rules for crisis, medical, legal, and financial questions.
- Cache keys must account for selected reply locale and personalization;
  never reuse another user's name or conversation context.
- Preserve existing event wrappers and audio chunk protocol. No new
  endpoint or client-side translation is required.

## Stop Behavior

Mobile Stop cancels local playback and closes the active voice session,
triggering existing backend session cleanup. It preserves displayed text
and does not restart microphone capture. Backend must cancel pending LLM
and TTS generation when a session is closed/ended.

## Release Checks

- [ ] Fresh screen opens with English selected.
- [ ] English text and voice questions produce English text and audio.
- [ ] Hindi selection produces Hindi text and audio.
- [ ] Greeting uses the signed-in user's name once in text and audio.
- [ ] Changing language is disabled during an active turn or playback.
- [ ] Stop immediately silences playback without opening the microphone.
- [ ] Next question preserves conversation context after stopping.
- [ ] Test two accounts for cache/personalization isolation.

These checks require a running aligned backend and physical-device testing;
compile/lint success alone does not establish voice quality.
