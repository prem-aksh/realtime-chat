# Implementation Plan

This repository implements a single-room realtime chat application with an Expo mobile client and a Node.js/MongoDB backend.

## Architecture

The root npm workspace contains `shared`, `server`, and `mobile`. Shared contracts define REST DTOs and Socket.io event payloads. Express and Socket.io run on the same HTTP server. REST controllers and socket handlers call the same message service, which uses a repository backed by Mongoose.

## Data flow

1. The mobile client loads persisted username state from AsyncStorage.
2. The chat screen loads history through `GET /api/messages`.
3. Socket.io connects and sends `user:join`.
4. A send creates an optimistic message with a UUID clientMessageId.
5. Socket.io persists and acknowledges the message; the server then broadcasts `message:new`.
6. If the socket is unavailable, the client uses `POST /api/messages` with the same clientMessageId.
7. REST history and socket messages are merged by server id or clientMessageId.

## REST API

- `GET /api/health`: health response with timestamp.
- `GET /api/messages?limit=50&cursor=...`: chronological history and next cursor.
- `POST /api/messages`: validates, persists, broadcasts, and returns one message.

## Socket events

Client events are `user:join`, `user:typing`, `user:stop_typing`, `message:send`, `message:delivered`, and `message:read`. Server events are `message:new`, `message:ack`, `user:presence`, `user:typing`, `user:stop_typing`, and `socket:error`.

## Database schema

Messages contain username, text, optional unique sparse clientMessageId, createdAt, and updatedAt. Indexes support chronological retrieval and idempotency lookups.

## Implementation phases

1. Workspace and documentation scaffolding.
2. Shared contracts.
3. Backend REST, persistence, validation, and errors.
4. Socket.io lifecycle and realtime behavior.
5. Mobile screens, persistence, API, socket service, and UI states.
6. Tests, linting, builds, and documentation verification.

## Testing strategy

Backend tests use Jest, Supertest, MongoDB Memory Server, and Socket.io clients. Mobile tests use jest-expo and React Native Testing Library for validation utilities, deduplication, formatting, and message rendering.

## Assumptions

This is a shared chat room with dummy username identity. There are no passwords, private rooms, media, push notifications, or durable per-user read receipts. Delivery/read notifications are best-effort socket state.
