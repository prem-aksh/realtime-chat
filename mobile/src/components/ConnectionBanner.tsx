import {StyleSheet, Text, View} from "react-native";
import type {ConnectionState} from "../types/chat";

export const ConnectionBanner = ({state}: {state: ConnectionState}) => {
  const label = state === "connected" ? "Connected" : state === "connecting" ? "Connecting…" : "Offline — messages will retry";
  return <View style={[styles.container, state === "connected" ? styles.connected : styles.disconnected]}><Text style={styles.text}>{label}</Text></View>;
};
const styles = StyleSheet.create({container: {paddingVertical: 5, alignItems: "center"}, connected: {backgroundColor: "#dcfce7"}, disconnected: {backgroundColor: "#fef3c7"}, text: {fontSize: 12, color: "#334155"}});
