import React, { useEffect, useState, useCallback } from "react";
import { socket } from "./socket";
import Landing from "./pages/Landing.jsx";
import Lobby from "./pages/Lobby.jsx";
import Game from "./pages/Game.jsx";
import Results from "./pages/Results.jsx";
import Toast from "./components/Toast.jsx";
import { copyInviteLink } from "./utils/inviteLink.js";

export default function App() {
  const [myId, setMyId] = useState(socket.id);
  const [room, setRoom] = useState(null);
  const [controllerWord, setControllerWord] = useState(null);
  const [toast, setToastMsg] = useState(null);
  const [turnResult, setTurnResult] = useState(null);

  useEffect(() => {
    function onConnect() {
      setMyId(socket.id);
    }
    function onRoomUpdate(r) {
      setRoom(r);
    }
    function onTimer({ timeLeft }) {
      setRoom((prev) => (prev ? { ...prev, timeLeft } : prev));
    }
    function onControllerWord(data) {
      setControllerWord(data);
    }
    function onTurnEnded({ result, room: r }) {
      setRoom(r);
      setTurnResult(result);
      setTimeout(() => setTurnResult(null), 3200);
    }
    function onGameOver({ room: r }) {
      setRoom(r);
      setControllerWord(null);
    }
    function onError(msg) {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3500);
    }

    socket.on("connect", onConnect);
    socket.on("roomUpdate", onRoomUpdate);
    socket.on("timer", onTimer);
    socket.on("controllerWord", onControllerWord);
    socket.on("turnEnded", onTurnEnded);
    socket.on("gameOver", onGameOver);
    socket.on("errorMessage", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("roomUpdate", onRoomUpdate);
      socket.off("timer", onTimer);
      socket.off("controllerWord", onControllerWord);
      socket.off("turnEnded", onTurnEnded);
      socket.off("gameOver", onGameOver);
      socket.off("errorMessage", onError);
    };
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (room?.code) {
      if (url.searchParams.get("room") !== room.code) {
        url.searchParams.set("room", room.code);
        window.history.replaceState(null, "", url);
      }
    } else if (url.searchParams.has("room")) {
      url.searchParams.delete("room");
      window.history.replaceState(null, "", url);
    }
  }, [room?.code]);

  const leaveRoom = useCallback(() => {
    socket.emit("leaveRoom");
    setRoom(null);
    setControllerWord(null);
  }, []);

  const copyLink = useCallback((code) => {
    copyInviteLink(code).then((ok) => {
      setToastMsg(ok ? "Invite link copied!" : "Couldn't copy the link.");
      setTimeout(() => setToastMsg(null), 2500);
    });
  }, []);

  let view = "landing";
  if (room) {
    if (room.status === "lobby") view = "lobby";
    else if (room.status === "finished") view = "results";
    else view = "game";
  }

  return (
      <div className="min-h-screen w-full flex flex-col items-center px-4 py-8 md:py-12">
        <Header room={room} onLeave={room ? leaveRoom : null} onCopyLink={copyLink} />
        <main className="w-full max-w-5xl flex-1 flex flex-col items-center">
          {view === "landing" && <Landing onJoined={setRoom} />}
          {view === "lobby" && <Lobby room={room} myId={myId} />}
          {view === "game" && (
              <Game
                  room={room}
                  myId={myId}
                  controllerWord={controllerWord}
                  turnResult={turnResult}
              />
          )}
          {view === "results" && <Results room={room} myId={myId} />}
        </main>
        <Toast message={toast} />
      </div>
  );
}

function Header({ room, onLeave, onCopyLink }) {
  return (
      <header className="w-full max-w-5xl flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-violet-soft shadow-glow flex items-center justify-center font-display font-bold text-ink">
            T!
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight tracking-tight">
              Taboo Club
            </h1>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400">
              Say anything but that
            </p>
          </div>
        </div>
        {room && (
            <div className="flex items-center gap-3">
              <button
                  onClick={() => onCopyLink(room.code)}
                  className="glass px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition"
                  title="Copy invite link"
              >
                <span className="label-eyebrow">Room</span>
                <span className="font-mono font-semibold tracking-[0.3em] text-teal-soft">
              {room.code}
            </span>
              </button>
              <button onClick={onLeave} className="btn-ghost !px-4 !py-2 text-sm">
                Leave
              </button>
            </div>
        )}
      </header>
  );
}
