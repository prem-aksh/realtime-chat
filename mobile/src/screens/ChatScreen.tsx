import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageBubble } from "../components/MessageBubble";
import { ConnectionBanner } from "../components/ConnectionBanner";
import { useChat } from "../context/ChatContext";

export const ChatScreen = () => {
  const {
    messages,
    username,
    connection,
    onlineUsers,
    typingUsers,
    historyLoading,
    historyError,
    draft,
    sendError,
    sending,
    setDraft,
    send,
    retryHistory,
    logout,
  } = useChat();
  const rendered = useMemo(() => [...messages].reverse(), [messages]);
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Realtime Chat</Text>
            <Text style={styles.subtitle}>
              {onlineUsers.length} online · You are {username}
            </Text>
          </View>
          <Pressable onPress={logout}>
            <Text style={styles.logout}>Change</Text>
          </Pressable>
        </View>
        <ConnectionBanner state={connection} />
        {historyError && (
          <Pressable style={styles.retry} onPress={() => void retryHistory()}>
            <Text style={styles.retryText}>{historyError} Tap to retry.</Text>
          </Pressable>
        )}
        {historyLoading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading messages…</Text>
          </View>
        ) : (
          <FlatList
            data={rendered}
            inverted
            keyExtractor={(item) =>
              item.id ||
              item.clientMessageId ||
              `${item.createdAt}-${item.username}`
            }
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isMine={item.username === username}
              />
            )}
            contentContainerStyle={
              rendered.length ? styles.list : styles.emptyList
            }
            ListEmptyComponent={
              <Text style={styles.muted}>
                No messages yet. Start the conversation.
              </Text>
            }
          />
        )}
        {typingUsers.length > 0 && (
          <Text style={styles.typing}>
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
            typing…
          </Text>
        )}
        {sendError && <Text style={styles.sendError}>{sendError}</Text>}
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message…"
            multiline
            maxLength={2000}
            style={styles.input}
            onSubmitEditing={() => void send()}
          />
          <Pressable
            style={[styles.send, (!draft.trim() || sending) && styles.disabled]}
            onPress={() => void send()}
            disabled={!draft.trim() || sending}
          >
            <Text style={styles.sendText}>{sending ? "…" : "Send"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1 },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: { fontSize: 21, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 3 },
  logout: { color: "#1e3a8a", fontWeight: "700" },
  retry: { backgroundColor: "#fee2e2", padding: 10, alignItems: "center" },
  retryText: { color: "#991b1b" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  muted: { color: "#64748b", textAlign: "center", padding: 20 },
  list: { paddingVertical: 12 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  typing: {
    fontSize: 12,
    color: "#64748b",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  sendError: {
    fontSize: 12,
    color: "#b91c1c",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  composer: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 11,
    fontSize: 16,
    backgroundColor: "#f8fafc",
  },
  send: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
  },
  disabled: { opacity: 0.5 },
  sendText: { color: "white", fontWeight: "700" },
});
