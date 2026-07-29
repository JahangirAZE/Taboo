import { io } from "socket.io-client";

// Point this at your deployed backend URL in production, e.g. via
// a Vite env var: VITE_SERVER_URL=https://your-api.example.com
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
