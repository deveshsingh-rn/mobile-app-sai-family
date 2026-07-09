# OpenAI Devotee Assistant Backend Contract

The mobile app now includes an `Ask Sai` screen inside Experiences.

The app must not call OpenAI directly. The backend should own:

- OpenAI API key
- prompt policy
- safety instructions
- rate limiting
- abuse protection
- conversation storage, if needed

## Endpoint

Default route expected by the app:

```http
POST /api/ai/devotee-question
```

The route can be changed from the app with:

```bash
EXPO_PUBLIC_AI_ASSISTANT_ENDPOINT=/api/ai/devotee-question
```

## Auth

The mobile `apiClient` automatically attaches:

- `Authorization: Bearer <accessToken>` when available
- `x-user-id: <userId>` when available

Backend should require an authenticated user for production.

## Request Body

```json
{
  "question": "How can I keep faith during a difficult time?",
  "pillar": "experiences"
}
```

Validation:

- `question`: required, string, min 3, max 1000
- `pillar`: optional enum
  - `experiences`
  - `events`
  - `directory`
  - `sangha`

## Success Response

The frontend accepts any one of `answer`, `reply`, `text`, or `message`, but `answer` is preferred.

```json
{
  "answer": "Keep one small daily practice. Sit quietly, remember Sai, and take the next right step with patience.",
  "conversationId": "optional-conversation-id",
  "safetyNote": "For medical, legal, financial, or emergency matters, please contact a qualified professional."
}
```

## Error Response

Use the existing backend error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Question is required"
  }
}
```

Recommended error codes:

- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `RATE_LIMITED`
- `AI_PROVIDER_ERROR`
- `SAFETY_REFUSAL`

## Backend Safety Rules

- Never return harmful instructions.
- Do not provide medical, legal, financial, or emergency advice as final authority.
- Keep tone warm, respectful, and spiritually supportive.
- Do not claim to be Sai Baba.
- Do not invent temple/event/directory facts. If the question needs app data, query backend data first or say the app cannot confirm it.
- Keep answers concise for 40+ users.

## Performance Rules

- Rate limit per user.
- Add timeout around OpenAI calls.
- Log request id, user id, latency, and model status.
- Do not log full personal questions if logs are not protected.
- Cache repeated generic questions if useful.

## Mobile Integration Notes

Frontend files:

- `app/(tabs)/experiences/ask-sai.tsx`
- `services/devotee-ai.ts`

The app shows a friendly error if this endpoint is not ready yet.

