import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_ENDPOINT =
  process.env.REACT_APP_WS_URL ||
  "http://ec2-3-110-55-80.ap-south-1.compute.amazonaws.com:8080/ws";

let client = null;
let connectPromise = null;
let connectResolve = null;

function ensureClient() {
  if (client && client.connected) return client;

  client = new Client({
    webSocketFactory: () => new SockJS(WS_ENDPOINT),
    reconnectDelay: 5000,
    debug: (str) => {
      // Suppress deprecation warnings from sockjs-client
      if (
        str.includes("Unload event listeners") ||
        str.includes("beforeunload")
      ) {
        return;
      }
      console.log(str);
    },
  });

  // Optional: attach session headers (commented out for simpler local testing)
  // const sessionId = localStorage.getItem("sessionId") || "";
  // const userId = localStorage.getItem("userId") || "";
  // client.connectHeaders = { sessionId, userId };

  client.onConnect = () => {
    console.log("[chatService] connected");
    if (connectResolve) {
      connectResolve(true);
      connectResolve = null;
      connectPromise = null;
    }
  };

  client.onStompError = (frame) => {
    console.error("[chatService] Stomp error", frame);
  };

  client.activate();
  return client;
}

function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuf(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Simplified encryption helpers - basic AES-GCM with session-derived key
// For production, use proper E2E encryption with key exchange
async function deriveSimpleKey() {
  const sessionId = localStorage.getItem("sessionId") || "demo-session";
  const userId = localStorage.getItem("userId") || "1";
  const data = new TextEncoder().encode(`${sessionId}:${userId}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptContentSimple(plainText) {
  // TEMPORARY: Disable encryption for testing
  // Once WebSocket is working, we can re-enable encryption
  return plainText;

  /* Original encryption code - commented out for testing
  try {
    const key = await deriveSimpleKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plainText)
    );
    return JSON.stringify({
      iv: bufToBase64(iv),
      data: bufToBase64(encrypted),
    });
  } catch (e) {
    console.warn("[chatService] encryption failed, sending plaintext", e);
    return plainText; // fallback to plaintext
  }
  */
}

export async function decryptContentSimple(payloadStr) {
  // TEMPORARY: Disable decryption for testing
  // Return the content as-is
  return payloadStr;

  /* Original decryption code - commented out for testing
  try {
    const key = await deriveSimpleKey();
    const parsed =
      typeof payloadStr === "string" ? JSON.parse(payloadStr) : payloadStr;
    if (!parsed.iv || !parsed.data) return payloadStr; // already plaintext
    const iv = base64ToBuf(parsed.iv);
    const data = base64ToBuf(parsed.data);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.warn("[chatService] decryption failed, returning as-is", e);
    return payloadStr; // return plaintext if decrypt fails
  }
  */
}

export function connect() {
  // ensureClient sets up client; return a promise that resolves when connected
  const c = ensureClient();
  if (c && c.connected) return Promise.resolve(true);
  if (!connectPromise) {
    connectPromise = new Promise((resolve) => {
      connectResolve = resolve;
      // resolve will be called in onConnect
    });
  }
  return connectPromise;
}

export async function subscribeConversation(conversationId, onMessage) {
  // wait for connection before subscribing
  await connect();
  const c = ensureClient();
  if (!c || !c.connected) throw new Error("STOMP client not connected");
  const dest = `/topic/messages/${conversationId}`;
  return c.subscribe(dest, async (message) => {
    if (message.body) {
      const payload = JSON.parse(message.body);
      // decrypt content if encrypted
      try {
        payload.decryptedContent = await decryptContentSimple(payload.content);
      } catch (e) {
        console.warn("[chatService] decrypt failed for incoming message", e);
        payload.decryptedContent = payload.content; // use as-is
      }
      onMessage(payload);
    }
  });
}

export async function sendConversationMessage(conversationId, messageText) {
  await connect();
  const c = ensureClient();
  if (!c || !c.connected)
    throw new Error("There is no underlying STOMP connection");
  const userId = Number(localStorage.getItem("userId") || 0);
  // optional: encrypt content (or send plaintext for simple testing)
  const content = await encryptContentSimple(messageText);
  const payload = JSON.stringify({
    type: "CHAT",
    conversationId: conversationId,
    senderId: userId,
    content: content,
    createdAt: Date.now(),
  });
  c.publish({ destination: "/app/chat.send", body: payload });
}

export async function editConversationMessage(
  conversationId,
  messageId,
  newMessageText
) {
  await connect();
  const c = ensureClient();
  if (!c || !c.connected)
    throw new Error("There is no underlying STOMP connection");
  const userId = Number(localStorage.getItem("userId") || 0);
  const content = await encryptContentSimple(newMessageText);
  const payload = JSON.stringify({
    type: "EDIT",
    messageId: messageId,
    conversationId: conversationId,
    senderId: userId,
    content: content,
    updatedAt: Date.now(),
  });
  c.publish({ destination: "/app/chat.edit", body: payload });
}

export async function deleteConversationMessage(conversationId, messageId) {
  await connect();
  const c = ensureClient();
  if (!c || !c.connected)
    throw new Error("There is no underlying STOMP connection");
  const userId = Number(localStorage.getItem("userId") || 0);
  const payload = JSON.stringify({
    type: "DELETE",
    messageId: messageId,
    conversationId: conversationId,
    senderId: userId,
  });
  c.publish({ destination: "/app/chat.delete", body: payload });
}

export function disconnect() {
  if (client) {
    try {
      client.deactivate();
      client = null;
      connectPromise = null;
      connectResolve = null;
    } catch (e) {
      console.warn("[chatService] disconnect error", e);
    }
  }
}

// Cleanup function to be called when component unmounts
export function cleanup() {
  disconnect();
}
