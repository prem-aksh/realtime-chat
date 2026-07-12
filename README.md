# Realtime Chat

Production-style single-room mobile chat built with Expo/React Native, TypeScript, Express, Socket.io, MongoDB, and Mongoose.

## Features

- Dummy username session persisted with AsyncStorage
- REST history loading with cursor pagination
- Socket.io message delivery, acknowledgements, presence, and typing indicators
- MongoDB persistence with client-message idempotency
- Optimistic mobile sends with REST fallback
- Validation, centralized errors, Helmet, CORS, rate limiting, structured logging, and graceful shutdown
- Backend and mobile-focused automated tests
- EAS preview APK configuration

## Architecture

`mobile` uses REST for history and Socket.io for realtime events. `server` runs Express and Socket.io on one HTTP server. REST controllers and socket handlers share `MessageService`, which uses `MessageRepository` and Mongoose. `shared` contains wire contracts and event constants.

## Prerequisites

- Node.js 20.19.4 or newer
- npm 10 or newer
- MongoDB 7+ locally or a MongoDB Atlas database
- Expo Go, Android Studio/emulator, or a physical Android device

The selected Expo SDK 54 / React Native toolchain requires Node 20.19.4 or newer. Upgrade Node before running Expo validation if your local version is older.

## Setup

```bash
npm install
Copy-Item server/.env.example server/.env
Copy-Item mobile/.env.example mobile/.env
```

For macOS/Linux, use `cp` instead of `Copy-Item`.

Start local MongoDB, or set `MONGODB_URI` to an Atlas connection string. Never commit `.env` files.

## Environment

Server variables are `NODE_ENV`, `PORT`, `MONGODB_URI`, `CLIENT_ORIGINS`, `MESSAGE_HISTORY_DEFAULT_LIMIT`, and `MESSAGE_HISTORY_MAX_LIMIT`.

Mobile variables are `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL`. A physical device cannot normally reach `localhost` on your computer; use the computer's LAN IP, such as `http://192.168.x.x:5000`, or a deployed HTTPS backend. The LAN IP belongs only in your local `.env`, not source code.

## Run locally

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:mobile
```

For the Android emulator, `10.0.2.2` normally maps to the host machine, so set both mobile URLs to `http://10.0.2.2:5000`. For a physical device, use the computer's LAN IP and ensure both devices share the same network.

## REST API

- `GET /api/health`
- `GET /api/messages?limit=50&cursor=...`
- `POST /api/messages` with `{ "username": "Prem", "text": "Hello", "clientMessageId": "uuid" }`

Responses use `{ success, data }` or `{ success: false, error }`. New messages return `201`; idempotent retries return the existing message without rebroadcasting.

## Socket.io

Client events: `user:join`, `user:typing`, `user:stop_typing`, `message:send`, `message:delivered`, `message:read`.

Server events: `message:new`, `message:ack`, `user:presence`, `user:typing`, `user:stop_typing`, `socket:error`.

The server persists before broadcasting. Socket acknowledgements are structured and malformed payloads do not crash the process.

## Database schema

Messages contain `username`, `text`, optional unique sparse `clientMessageId`, and Mongoose `createdAt`/`updatedAt` timestamps. Indexes support history ordering and idempotency lookup.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run mobile:validate
```

`npm run mobile:validate` validates Expo configuration. `npm run build` builds shared contracts and the backend. `npm run build --workspace mobile` exports the Android JavaScript bundle when the selected Expo environment supports it.

The repository's local verification suite covers linting, strict TypeScript checks, REST and Socket.io integration tests, MongoDB persistence/idempotency, and mobile utility tests. The GitHub repository is published; an EAS APK, deployed backend, and remaining public submission links have not been claimed as completed.

## APK build

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

The `preview` profile is configured to produce an installable APK. EAS login and cloud build are external steps and are not claimed as completed here.

## Deployment

Build the backend with `npm run build --workspace server`, then start it with `npm start --workspace server`. Render or Railway should use the same production start command, expose `PORT`, configure `MONGODB_URI` with a MongoDB Atlas URI, and set `CLIENT_ORIGINS` to the mobile/web origins that need access. The health endpoint is suitable for platform checks, and Socket.io runs on the same HTTP server so the platform must allow WebSocket upgrades.

## Testing

Backend tests use MongoDB Memory Server and cover REST validation, health, persistence, pagination, idempotency, and Socket.io acknowledgements. Mobile tests cover username/message validation, deduplication, sorting, and timestamp formatting.

## Assumptions and limitations

This is a shared room with demo username identity, not secure authentication. Presence and delivery/read signals are in-memory and best-effort. There are no private rooms, media, push notifications, or durable per-user read receipts. Multi-process deployment would require a Socket.io adapter for shared presence/broadcast state.

## Submission placeholders

- GitHub repository: https://github.com/prem-aksh/realtime-chat
- Deployed backend: pending Render/Railway deployment.
- APK Google Drive: pending EAS build and upload.
- Screen recording Google Drive: pending recording and upload.

## Troubleshooting

- If MongoDB fails, verify `MONGODB_URI` and that the database is reachable.
- If a device cannot connect, replace `localhost` with the host LAN IP and open port 5000.
- If Socket.io connects but messages fail, verify `CLIENT_ORIGINS` and that API/socket URLs point to the same backend.
- If Expo reports an engine mismatch, upgrade Node to the required version.
