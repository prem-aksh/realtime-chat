# Architecture

The app is a single-room chat. The Expo client uses REST for history and Socket.io for realtime delivery. The backend uses Express routes and Socket.io handlers over one HTTP server. Both entry points call the same message service and repository.

Presence is held in memory per server process. Messages are durable in MongoDB. A clientMessageId provides safe retry idempotency.
