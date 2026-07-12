import type {ChatMessage} from "@realtime-chat/shared";

export const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] => {
  const byKey = new Map<string, ChatMessage>();
  [...current, ...incoming].forEach((message) => {
    const key = message.clientMessageId || message.id || `${message.username}:${message.createdAt}:${message.text}`;
    const previous = byKey.get(key);
    byKey.set(key, previous ? {...previous, ...message} : message);
  });
  return [...byKey.values()].sort((a, b) => {
    const time = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return time || a.id.localeCompare(b.id);
  });
};

export const formatTimestamp = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {hour: "numeric", minute: "2-digit"}).format(new Date(value));
