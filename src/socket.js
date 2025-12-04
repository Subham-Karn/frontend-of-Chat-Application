import { io } from "socket.io-client";

let socket = null;

export const createSocketDeferred = () => {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    reconnectionAttempts: 5,
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect error", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

export const connectSocket = (token, name) => {
  if (!token) return null;
  if (!socket) createSocketDeferred();

  // if already connected and same auth, return existing socket
  if (socket.connected && socket.auth?.token === token) {
    return socket;
  }

  // set auth and connect (without force-disconnecting)
  socket.auth = { token, name };
  if (!socket.connected) socket.connect();

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
