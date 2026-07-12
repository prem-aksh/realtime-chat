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


