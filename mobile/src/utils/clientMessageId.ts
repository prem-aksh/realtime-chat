import * as Crypto from "expo-crypto";

const fallbackUuid = (): string => {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  return `client-${seed}`;
};

/**
 * Native Expo builds normally provide Crypto.randomUUID(). The fallback keeps
 * message submission usable in Expo clients where the native crypto module is
 * unavailable or stale, while still producing a sufficiently unique retry key.
 */
export const createClientMessageId = (): string => {
  try {
    if (typeof Crypto.randomUUID === "function") {
      const id = Crypto.randomUUID();
      if (typeof id === "string" && id.length > 0) return id;
    }
  } catch (error) {
    console.warn("[chat] native UUID generation unavailable; using fallback", error);
  }
  return fallbackUuid();
};
