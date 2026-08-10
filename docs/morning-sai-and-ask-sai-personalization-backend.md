# Morning Sai And Ask Sai Personalization

## Frontend Status

- Morning alarm time and enabled state are stored locally.
- The app schedules 30 personalized local notifications and refreshes them before expiry.
- Notification taps open Ask Sai.
- Ask Sai sends `devoteeName` with text questions and voice-session creation.
- The UI prevents duplicate name prefixes when the backend already personalizes an answer.

## Required Backend Behavior

The backend must treat the authenticated profile as the source of truth. Do not trust a
client-provided name without comparing it with the authenticated user profile.

### Ask Sai Text

`POST /api/ai/devotee-question` may receive:

```json
{
  "question": "How should I live today?",
  "devoteeName": "Devesh Kumar Singh"
}
```

Before returning and storing the final answer, prepend the authenticated profile name once:

```text
Devesh Kumar Singh, ...
```

### Ask Sai Voice

`POST /api/ai/voice/sessions` may receive `devoteeName`. The resolved authenticated profile
name must be included in the LLM instruction before ElevenLabs TTS begins. This ensures the
displayed text and spoken audio contain the same personalized opening.

### Dynamic Morning Guidance

The current frontend uses reviewed offline guidance. For fresh server-generated guidance,
add authenticated endpoints:

```http
GET /api/ai/morning-guidance/today
PUT /api/users/me/morning-guidance-settings
```

Suggested response:

```json
{
  "date": "2026-08-10",
  "devoteeName": "Devesh Kumar Singh",
  "line1": "Begin today with patience and faith.",
  "line2": "Let every action bring peace to another person.",
  "locale": "en-IN"
}
```

For exact daily content, the backend should schedule an Expo push using the user timezone,
configured local time, and registered Expo push token. Cache one approved message per user,
date, and locale. Apply safety review and never include sensitive profile fields in prompts,
logs, analytics, or notification payloads.

## Platform Limitation

Expo local notifications provide a morning reminder with the default notification sound.
They are not guaranteed to behave like the native Clock alarm when the device is muted,
powered off, or restricted by the operating system.

