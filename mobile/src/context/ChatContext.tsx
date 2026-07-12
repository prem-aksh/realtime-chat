import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef} from "react";
import type {ChatMessage} from "@realtime-chat/shared";
import {createMessage, fetchHistory} from "../api/client";
import {ChatSocketService} from "../services/socketService";
import {mergeMessages} from "../utils/messages";
import {validateMessage} from "../utils/validation";
import {createClientMessageId} from "../utils/clientMessageId";
import type {ChatState} from "../types/chat";

type Action =
  | {type: "history:start"} | {type: "history:success"; messages: ChatMessage[]} | {type: "history:error"; message: string}
  | {type: "messages:merge"; messages: ChatMessage[]} | {type: "message:status"; id: string; status: ChatMessage["status"]}
  | {type: "connection"; value: ChatState["connection"]} | {type: "presence"; users: string[]}
  | {type: "typing:add"; username: string} | {type: "typing:remove"; username: string}
  | {type: "draft"; value: string} | {type: "send:error"; message: string | null} | {type: "sending"; value: boolean};

const initialState: ChatState = {messages: [], onlineUsers: [], typingUsers: [], connection: "connecting", historyLoading: false, historyError: null, draft: "", sendError: null, sending: false};

const reducer = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case "history:start": return {...state, historyLoading: true, historyError: null};
    case "history:success": return {...state, historyLoading: false, messages: mergeMessages(state.messages, action.messages)};
    case "history:error": return {...state, historyLoading: false, historyError: action.message};
    case "messages:merge": return {...state, messages: mergeMessages(state.messages, action.messages)};
    case "message:status": return {...state, messages: state.messages.map((message) => message.id === action.id || message.clientMessageId === action.id ? {...message, status: action.status} : message)};
    case "connection": return {...state, connection: action.value};
    case "presence": return {...state, onlineUsers: action.users};
    case "typing:add": return state.typingUsers.includes(action.username) ? state : {...state, typingUsers: [...state.typingUsers, action.username]};
    case "typing:remove": return {...state, typingUsers: state.typingUsers.filter((username) => username !== action.username)};
    case "draft": return {...state, draft: action.value};
    case "send:error": return {...state, sendError: action.message};
    case "sending": return {...state, sending: action.value};
  }
};

type ChatContextValue = ChatState & {username: string; setDraft: (value: string) => void; send: () => Promise<void>; retryHistory: () => Promise<void>; socket: ChatSocketService; logout: () => void};
const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({username, logout, children}: {username: string; logout: () => void; children: React.ReactNode}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socket = useMemo(() => new ChatSocketService(), []);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef = useRef(false);

  const retryHistory = useCallback(async () => {
    dispatch({type: "history:start"});
    try { dispatch({type: "history:success", messages: (await fetchHistory()).messages}); }
    catch { dispatch({type: "history:error", message: "History could not be loaded."}); }
  }, []);

  useEffect(() => {
    void retryHistory();
    socket.connect(username, {
      onConnection: (value) => dispatch({type: "connection", value}),
      onMessage: (message) => { dispatch({type: "messages:merge", messages: [message]}); if (message.username !== username) socket.sendDelivered(message.id); },
      onPresence: (presence) => dispatch({type: "presence", users: presence.users}),
      onTyping: ({username: typingUsername}) => { if (typingUsername !== username) dispatch({type: "typing:add", username: typingUsername}); },
      onStopTyping: ({username: typingUsername}) => dispatch({type: "typing:remove", username: typingUsername}),
      onReceipt: ({messageId, status}) => dispatch({type: "message:status", id: messageId, status}),
      onError: (message) => dispatch({type: "send:error", message})
    });
    return () => { if (typingTimer.current) clearTimeout(typingTimer.current); socket.stopTyping(); socket.disconnect(); };
  }, [retryHistory, socket, username]);

  const setDraft = useCallback((value: string) => {
    dispatch({type: "draft", value});
    if (value.trim()) socket.sendTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.stopTyping(), 1200);
  }, [socket]);

  const send = useCallback(async () => {
    if (sendingRef.current) return;
    const error = validateMessage(state.draft);
    if (error) { dispatch({type: "send:error", message: error}); return; }
    sendingRef.current = true;
    dispatch({type: "sending", value: true});
    const text = state.draft.trim();
    let clientMessageId: string | null = null;
    try {
      clientMessageId = createClientMessageId();
      const optimistic: ChatMessage = {id: `local-${clientMessageId}`, clientMessageId, username, text, createdAt: new Date().toISOString(), status: "pending"};
      dispatch({type: "messages:merge", messages: [optimistic]});
      dispatch({type: "draft", value: ""});
      dispatch({type: "send:error", message: null});
      socket.stopTyping();
      let message: ChatMessage;
      if (socket.isConnected()) {
        const ack = await socket.sendMessage({text, clientMessageId});
        if (!ack.success) throw new Error(ack.error.message);
        message = ack.message;
      } else message = await createMessage({username, text, clientMessageId});
      dispatch({type: "messages:merge", messages: [{...message, status: "sent"}]});
    } catch (error) {
      console.error("[chat] send failed", error);
      if (!clientMessageId) {
        dispatch({type: "send:error", message: "Message setup failed. Please try again."});
        return;
      }
      try {
        const message = await createMessage({username, text, clientMessageId});
        dispatch({type: "messages:merge", messages: [{...message, status: "sent"}]});
      } catch { dispatch({type: "message:status", id: clientMessageId, status: "failed"}); dispatch({type: "send:error", message: "Message could not be sent. Please retry."}); }
    } finally {
      sendingRef.current = false;
      dispatch({type: "sending", value: false});
    }
  }, [socket, state.draft, username]);

  const value = useMemo(() => ({...state, username, setDraft, send, retryHistory, socket, logout}), [logout, retryHistory, send, setDraft, socket, state, username]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextValue => {
  const value = useContext(ChatContext);
  if (!value) throw new Error("useChat must be used inside ChatProvider");
  return value;
};
