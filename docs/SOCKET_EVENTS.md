# Socket.io Events

Clients join with `user:join({ username })`. Messages use `message:send({ text, clientMessageId })` with a callback acknowledgement. The server persists before emitting `message:new` to connected clients.

Presence is emitted as `user:presence({ users, count })`. Typing events carry no user-controlled username; the server derives it from the joined socket. Delivery and read events are best-effort acknowledgements.
