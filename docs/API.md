# REST API

## `GET /api/health`

Returns `{ success, message, timestamp }`.

## `GET /api/messages`

Query parameters: `limit` (1-100, default 50) and optional opaque `cursor`. Returns `{ success: true, data: { messages, nextCursor } }` in chronological order.

## `POST /api/messages`

Body: `{ username, text, clientMessageId? }`. A new message returns HTTP 201. An idempotent replay returns the existing message without a second broadcast.
