import {useEffect, useState} from "react";
import {ActivityIndicator, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NavigationContainer} from "@react-navigation/native";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import {AppNavigator} from "./src/navigation/AppNavigator";
import {ErrorBoundary} from "./src/components/ErrorBoundary";

const USERNAME_KEY = "realtime-chat.username";

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void AsyncStorage.getItem(USERNAME_KEY).then(setUsername).finally(() => setLoading(false)); }, []);
  const login = (next: string) => { setUsername(next); void AsyncStorage.setItem(USERNAME_KEY, next); };
  const logout = () => { setUsername(null); void AsyncStorage.removeItem(USERNAME_KEY); };
  if (loading) return <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}><ActivityIndicator /></View>;
  return <ErrorBoundary><SafeAreaProvider><NavigationContainer><StatusBar style="dark" /><AppNavigator username={username} onLogin={login} onLogout={logout} /></NavigationContainer></SafeAreaProvider></ErrorBoundary>;
}
