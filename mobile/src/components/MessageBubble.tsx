import {StyleSheet, Text, View} from "react-native";
import type {ChatMessage} from "@realtime-chat/shared";
import {formatTimestamp} from "../utils/messages";

export const MessageBubble = ({message, isMine}: {message: ChatMessage; isMine: boolean}) => (
  <View style={[styles.row, isMine && styles.mineRow]}>
    <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
      {!isMine && <Text style={styles.sender}>{message.username}</Text>}
      <Text style={[styles.text, isMine && styles.mineText]}>{message.text}</Text>
      <Text style={[styles.meta, isMine && styles.mineMeta]}>{formatTimestamp(message.createdAt)}{isMine && message.status ? ` · ${message.status}` : ""}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({row: {marginVertical: 4, paddingHorizontal: 16, alignItems: "flex-start"}, mineRow: {alignItems: "flex-end"}, bubble: {maxWidth: "82%", padding: 11, borderRadius: 16}, mine: {backgroundColor: "#1e3a8a", borderBottomRightRadius: 4}, theirs: {backgroundColor: "#e5e7eb", borderBottomLeftRadius: 4}, sender: {fontSize: 12, fontWeight: "700", color: "#334155", marginBottom: 3}, text: {fontSize: 16, color: "#0f172a"}, mineText: {color: "#ffffff"}, meta: {fontSize: 11, color: "#64748b", marginTop: 5, textAlign: "right"}, mineMeta: {color: "#bfdbfe"}});
