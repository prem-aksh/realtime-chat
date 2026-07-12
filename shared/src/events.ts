export const CLIENT_EVENTS = {
  join: "user:join",
  typing: "user:typing",
  stopTyping: "user:stop_typing",
  sendMessage: "message:send",
  delivered: "message:delivered",
  read: "message:read"
} as const;

export const SERVER_EVENTS = {
  newMessage: "message:new",
  messageAck: "message:ack",
  presence: "user:presence",
  typing: "user:typing",
  stopTyping: "user:stop_typing",
  error: "socket:error"
} as const;
