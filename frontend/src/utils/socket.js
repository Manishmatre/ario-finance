import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://SSKfinance-backend.onrender.com";

export const socket = io(SOCKET_URL, {
  withCredentials: true
});
