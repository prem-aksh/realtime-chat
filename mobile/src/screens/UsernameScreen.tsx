import {useState} from "react";
import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import {validateUsername} from "../utils/validation";

export const UsernameScreen = ({onSubmit}: {onSubmit: (username: string) => void}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = () => { const validation = validateUsername(value); if (validation) setError(validation); else onSubmit(value.trim()); };
  return <View style={styles.container}>
    <Text style={styles.title}>Realtime Chat</Text><Text style={styles.subtitle}>Choose a display name to join the room.</Text>
    <TextInput value={value} onChangeText={(next) => {setValue(next); setError(null);}} placeholder="Display name" autoCapitalize="words" maxLength={32} style={styles.input} onSubmitEditing={submit} />
    {error && <Text style={styles.error}>{error}</Text>}
    <Pressable style={styles.button} onPress={submit}><Text style={styles.buttonText}>Join chat</Text></Pressable>
  </View>;
};
const styles = StyleSheet.create({container: {flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f8fafc"}, title: {fontSize: 32, fontWeight: "800", color: "#0f172a", marginBottom: 8}, subtitle: {fontSize: 16, color: "#475569", marginBottom: 24}, input: {backgroundColor: "white", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, padding: 14, fontSize: 16}, error: {color: "#b91c1c", marginTop: 8}, button: {marginTop: 18, backgroundColor: "#1e3a8a", padding: 15, borderRadius: 10, alignItems: "center"}, buttonText: {color: "white", fontWeight: "700", fontSize: 16}});
