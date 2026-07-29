import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { customAlphabet } from "nanoid";
import { Room } from "./Room.js";

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.get("/health", (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

/** @type {Map<string, Room>} */
const rooms = new Map();

// socket.id -> { roomCode, name }
const socketMeta = new Map();

function getRoomOrFail(socket, code) {
  const room = rooms.get(code);
  if (!room) {
    socket.emit("errorMessage", "That room code doesn't exist.");
    return null;
  }
  return room;
}

io.on("connection", (socket) => {
  socket.on("createRoom", ({ name }, ack) => {
    const code = nanoid();
    const room = new Room(code, socket.id);
    room.addPlayer(socket.id, name?.trim() || "Moderator");
    rooms.set(code, room);
    socket.join(code);
    socketMeta.set(socket.id, { roomCode: code, name });
    ack?.({ ok: true, room: room.toPublicState() });
  });

  socket.on("joinRoom", ({ code, name }, ack) => {
    const room = getRoomOrFail(socket, code);
    if (!room) return ack?.({ ok: false, error: "Room not found." });

    if (room.status !== "lobby") {
      // Allow reconnecting mid-game if the name matches an existing player.
      const existing = room.players.find(
          (p) => p.name.toLowerCase() === name?.trim().toLowerCase()
      );
      if (existing) {
        existing.id = socket.id;
        existing.connected = true;
        socket.join(code);
        socketMeta.set(socket.id, { roomCode: code, name });
        io.to(code).emit("roomUpdate", room.toPublicState());
        return ack?.({ ok: true, room: room.toPublicState(), rejoined: true });
      }
      return ack?.({ ok: false, error: "Game already in progress." });
    }

    if (room.activePlayers.length >= room.settings.maxPlayers) {
      return ack?.({ ok: false, error: "Room is full." });
    }

    room.addPlayer(socket.id, name?.trim() || "Player");
    socket.join(code);
    socketMeta.set(socket.id, { roomCode: code, name });
    io.to(code).emit("roomUpdate", room.toPublicState());
    ack?.({ ok: true, room: room.toPublicState() });
  });

  socket.on("updateSettings", ({ code, settings }) => {
    const room = getRoomOrFail(socket, code);
    if (!room || !room.isModerator(socket.id) || room.status !== "lobby") return;
    room.updateSettings(settings);
    io.to(code).emit("roomUpdate", room.toPublicState());
  });

  socket.on("startGame", ({ code }) => {
    const room = getRoomOrFail(socket, code);
    if (!room || !room.isModerator(socket.id)) return;
    if (room.activePlayers.length < 3) {
      return socket.emit("errorMessage", "You need at least 3 players to start.");
    }
    room.startGame();
    io.to(code).emit("roomUpdate", room.toPublicState());
    sendControllerWord(room);
  });

  socket.on("requestControllerWord", ({ code }) => {
    const room = getRoomOrFail(socket, code);
    if (!room) return;
    const roles = room.getRoles();
    if (!roles) return;
    // Controller can always see the word while it's their turn to hold it.
    if (roles.controller.id === socket.id) {
      socket.emit("controllerWord", room.toControllerState());
    } else if (roles.explainer.id === socket.id && room.status === "active") {
      // Explainer only gets to see it once the turn is actually live.
      socket.emit("controllerWord", room.toControllerState());
    }
  });

  socket.on("shuffleWord", ({ code, difficulty }) => {
    const room = getRoomOrFail(socket, code);
    if (!room || room.status !== "setup") return;
    const roles = room.getRoles();
    if (!roles || roles.controller.id !== socket.id) return;
    room.shuffleWord(difficulty);
    sendControllerWord(room);
  });

  socket.on("customizeWord", ({ code, word, taboo }) => {
    const room = getRoomOrFail(socket, code);
    if (!room || room.status !== "setup") return;
    const roles = room.getRoles();
    if (!roles || roles.controller.id !== socket.id) return;
    const ok = room.setCustomWord({ word, taboo });
    if (!ok) {
      return socket.emit("errorMessage", "Enter a word before saving your custom card.");
    }
    sendControllerWord(room);
    io.to(code).emit("roomUpdate", room.toPublicState());
  });

  socket.on("beginTurn", ({ code }) => {
    const room = getRoomOrFail(socket, code);
    if (!room || room.status !== "setup") return;
    const roles = room.getRoles();
    if (!roles || roles.controller.id !== socket.id) return;
    room.beginTurn(io);
    sendControllerWord(room);
    sendExplainerWord(room);
    io.to(code).emit("roomUpdate", room.toPublicState());
  });

  socket.on("submitGuess", ({ code, guess }) => {
    const room = getRoomOrFail(socket, code);
    if (!room) return;
    const result = room.submitGuess(io, socket.id, guess);
    if (result) socket.emit("guessResult", result);
  });

  socket.on("flagTaboo", ({ code }) => {
    const room = getRoomOrFail(socket, code);
    if (!room) return;
    const roles = room.getRoles();
    if (!roles || roles.controller.id !== socket.id) return;
    room.flagTaboo(io);
  });

  socket.on("passWord", ({ code }) => {
    const room = getRoomOrFail(socket, code);
    if (!room) return;
    const roles = room.getRoles();
    if (!roles || roles.controller.id !== socket.id) return;
    room.passWord(io);
  });

  socket.on("playAgain", ({ code }) => {
    const room = getRoomOrFail(socket, code);
    if (!room || !room.isModerator(socket.id)) return;
    room.status = "lobby";
    io.to(code).emit("roomUpdate", room.toPublicState());
  });

  socket.on("leaveRoom", () => handleDisconnect(socket));
  socket.on("disconnect", () => handleDisconnect(socket));

  function handleDisconnect(sock) {
    const meta = socketMeta.get(sock.id);
    if (!meta) return;
    const room = rooms.get(meta.roomCode);
    if (room) {
      room.removePlayer(sock.id);
      io.to(meta.roomCode).emit("roomUpdate", room.toPublicState());
      if (room.activePlayers.length === 0) {
        rooms.delete(meta.roomCode);
      }
    }
    socketMeta.delete(sock.id);
  }
});

// Whenever a new word is drawn, privately tell only the controller what it is.
function sendControllerWord(room) {
  const roles = room.getRoles();
  if (!roles) return;
  io.to(roles.controller.id).emit("controllerWord", room.toControllerState());
}

// Once the turn actually goes live, the explainer also needs to see the
// word and taboo list (only the controller sees it during setup/shuffling).
function sendExplainerWord(room) {
  const roles = room.getRoles();
  if (!roles) return;
  io.to(roles.explainer.id).emit("controllerWord", room.toControllerState());
}

httpServer.listen(PORT, () => {
  console.log(`Taboo game server listening on port ${PORT}`);
});
