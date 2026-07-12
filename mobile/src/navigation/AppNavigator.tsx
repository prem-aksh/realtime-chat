import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {UsernameScreen} from "../screens/UsernameScreen";
import {ChatScreen} from "../screens/ChatScreen";
import {ChatProvider} from "../context/ChatContext";

const Stack = createNativeStackNavigator();

export const AppNavigator = ({username, onLogin, onLogout}: {username: string | null; onLogin: (username: string) => void; onLogout: () => void}) => username ? <ChatProvider username={username} logout={onLogout}><Stack.Navigator screenOptions={{headerShown: false}}><Stack.Screen name="Chat" component={ChatScreen} /></Stack.Navigator></ChatProvider> : <Stack.Navigator screenOptions={{headerShown: false}}><Stack.Screen name="Username">{() => <UsernameScreen onSubmit={onLogin} />}</Stack.Screen></Stack.Navigator>;
