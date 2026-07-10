# Devotee AI Assistant Frontend Integration Report

Last updated: 2026-07-10

## Status

Backend Phase 1 AI assistant integration is ready for frontend testing.

Implemented endpoint:

```http
POST /api/ai/devotee-question
```

Supporting endpoints:

```http
GET /api/ai/devotee-conversations?limit=20&offset=0
GET /api/ai/devotee-conversations/:conversationId
POST /api/ai/devotee-messages/:messageId/feedback
DELETE /api/ai/devotee-conversations/:conversationId
```

## Important Fix

Postman was returning:

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authenticated user is required"
  }
}
```

Cause:

- AI routes required authenticated user.
- The route was missing auth-token attachment middleware.
- Backend was not reading `Authorization: Bearer <accessToken>` for AI routes.

Fix:

- AI router now runs `attachUserFromHeader`.
- Bearer token now populates `req.user`.

## Model Config

Current configured model/deployment:

```env
AI_PROVIDER=azure_openai
AZURE_OPENAI_ENDPOINT=https://sai-family-openai.openai.azure.com
AZURE_OPENAI_API_VERSION=v1
AI_TEXT_MODEL=gpt-4o
AI_COMPLEX_TEXT_MODEL=gpt-4o
```

Important:

- For Azure OpenAI, `AI_TEXT_MODEL` must be the Azure deployment name.
- If Azure deployment name is not exactly `gpt-4o`, update env to the exact deployment name.
- API key must stay only in backend `.env`, Jenkins credentials, or Azure secret storage.

## Frontend Auth Flow

1. Login with mobile/email auth.
2. Store `tokens.accessToken`.
3. Send every AI request with:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Do not send OpenAI or Azure OpenAI keys from frontend.

Token lifetime:

- `accessToken` expires after `900` seconds, currently 15 minutes.
- `refreshToken` expires after `90` days.
- Frontend should call `POST /api/auth/refresh-token` before/after access token expiry and replace both tokens from the response.
- User should only be asked to login again when refresh token expires, is revoked, or logout is called.

## Ask Question Request

```http
POST /api/ai/devotee-question
```

```json
{
  "question": "How can I keep faith during a difficult time?",
  "pillar": "experiences",
  "conversationId": "",
  "locale": "en-IN",
  "voice": false
}
```

Notes:

- `conversationId` can be omitted or empty for a new conversation.
- Reuse `conversationId` to continue the same conversation.

## Ask Question Response

```json
{
  "answer": "A gentle way to begin is with one small prayer each morning. Sit quietly for two minutes, remember Sai, and choose one kind action for the day. Faith often grows through small steady practice, not pressure.",
  "conversationId": "cm-ai-conv-123",
  "messageId": "cm-ai-msg-456",
  "safetyNote": null,
  "model": "gpt-4o",
  "latencyMs": 840,
  "cached": false
}
```

Frontend should display `answer`.

## Conversation List Response

```json
{
  "items": [
    {
      "id": "cm-ai-conv-123",
      "title": "How can I keep faith during a difficult time?",
      "pillar": "experiences",
      "lastMessageAt": "2026-07-10T06:10:30.000Z",
      "messageCount": 2
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 1,
    "hasMore": false
  }
}
```

## Conversation Detail Response

```json
{
  "conversation": {
    "id": "cm-ai-conv-123",
    "title": "How can I keep faith during a difficult time?",
    "pillar": "experiences",
    "createdAt": "2026-07-10T06:09:50.000Z",
    "updatedAt": "2026-07-10T06:10:30.000Z"
  },
  "messages": [
    {
      "id": "cm-ai-msg-455",
      "role": "user",
      "content": "How can I keep faith during a difficult time?",
      "model": null,
      "latencyMs": null,
      "cached": false,
      "safetyStatus": "allowed",
      "createdAt": "2026-07-10T06:09:50.000Z"
    },
    {
      "id": "cm-ai-msg-456",
      "role": "assistant",
      "content": "A gentle way to begin is with one small prayer each morning.",
      "model": "gpt-4o",
      "latencyMs": 840,
      "cached": false,
      "safetyStatus": "allowed",
      "createdAt": "2026-07-10T06:10:30.000Z"
    }
  ]
}
```

## Feedback Request

```http
POST /api/ai/devotee-messages/:messageId/feedback
```

```json
{
  "rating": "helpful",
  "reason": "Helpful and easy to understand."
}
```

## Error Handling

Unauthenticated:

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authenticated user is required"
  }
}
```

AI not configured:

```json
{
  "error": {
    "code": "AI_NOT_CONFIGURED",
    "message": "AI assistant is not configured"
  }
}
```

Rate limited:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfterSeconds": 120
  }
}
```

## Postman

Updated Postman folder:

```text
AI Assistant API
```

Run order:

1. `POST /api/auth/user/mobile/verify-otp`
2. `POST /api/ai/devotee-question - Ask Sai Assistant`
3. `GET /api/ai/devotee-conversations - List Conversations`
4. `GET /api/ai/devotee-conversations/:conversationId - Detail`
5. `POST /api/ai/devotee-messages/:messageId/feedback`

## Verification

Backend verification passed:

```bash
npm run build
npm test
```
