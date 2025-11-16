import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: {}, // { [id]: { messages: [], unseenCount: 0, lastMessage: null } }
    currentConversationId: null,
    loading: false,
    connected: false,
  },
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setConnected(state, action) {
      state.connected = action.payload;
    },
    setConversations(state, action) {
      state.conversations = action.payload;
    },
    setMessages(state, action) {
      const { conversationId, messages } = action.payload;
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = { messages: [], unseenCount: 0 };
      }
      state.conversations[conversationId].messages = messages;
    },
    addMessage(state, action) {
      const { conversationId, message } = action.payload;
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = { messages: [], unseenCount: 0 };
      }
      state.conversations[conversationId].messages.push(message);
      state.conversations[conversationId].lastMessage = message;
      // If not current conversation, increment unseen
      if (state.currentConversationId !== conversationId) {
        state.conversations[conversationId].unseenCount =
          (state.conversations[conversationId].unseenCount || 0) + 1;
      }
    },
    incrementUnseen(state, action) {
      const { conversationId } = action.payload;
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = { messages: [], unseenCount: 0 };
      }
      state.conversations[conversationId].unseenCount =
        (state.conversations[conversationId].unseenCount || 0) + 1;
    },
    resetUnseen(state, action) {
      const { conversationId } = action.payload;
      if (state.conversations[conversationId]) {
        state.conversations[conversationId].unseenCount = 0;
      }
    },
    setCurrentConversation(state, action) {
      state.currentConversationId = action.payload;
      // reset unseen for that conversation
      if (state.conversations[action.payload]) {
        state.conversations[action.payload].unseenCount = 0;
      }
    },
  },
});

export const {
  setLoading,
  setConnected,
  setConversations,
  setMessages,
  addMessage,
  incrementUnseen,
  resetUnseen,
  setCurrentConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
