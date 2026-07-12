# Repository Guidance

## Commands

- `npm install` installs all workspaces.
- `npm run dev:server` starts the API and Socket.io server.
- `npm run dev:mobile` starts Expo.
- `npm run lint`, `npm run typecheck`, and `npm test` run repository checks.
- `npm run build` builds the shared package and backend.

## Architecture rules

- Keep REST controllers and Socket.io handlers thin.
- Route all message creation through `MessageService`.
- Never broadcast a message before persistence succeeds.
- Treat `clientMessageId` as the idempotency key.
- Validate all external input with Zod.
- Do not commit `.env` files or real service URLs.
- Socket listeners must be registered once and removed during cleanup.

## Runtime assumptions

- Node.js 20.19 or newer is required for the selected Expo SDK 54 toolchain.
- MongoDB is provided through a local instance or MongoDB Atlas.
- The username flow is demo identity only and is not authentication.
