# Deployment

The backend is ready for Render or Railway deployment. No deployment has been performed from this repository.

## Build and start

```bash
npm install
npm run build --workspace server
npm start --workspace server
```

The server listens on `0.0.0.0` and honors the platform-provided `PORT`. Express and Socket.io share the same HTTP server, so the hosting platform must support WebSocket upgrades.

## Required production variables

```env
NODE_ENV=production
PORT=<platform-provided-port>
MONGODB_URI=<MongoDB-Atlas-connection-string>
CLIENT_ORIGINS=<comma-separated-allowed-origins>
MESSAGE_HISTORY_DEFAULT_LIMIT=50
MESSAGE_HISTORY_MAX_LIMIT=100
```

MongoDB Atlas must allow the deployment network and the URI must remain in the host's secret environment, never in Git.

## Render or Railway steps

1. Create a Node service from the repository.
2. Set the build command to `npm install && npm run build --workspace server`.
3. Set the start command to `npm start --workspace server`.
4. Add the production variables above.
5. Configure the platform health check as `GET /api/health`.
6. Verify REST and Socket.io using the deployed HTTPS/WSS-compatible origin.

The mobile app must use the deployed backend URL in both `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL` before a submission APK is built.
