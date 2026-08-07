import React, { useState } from "react";
import { socket } from "../socket";
import GlassCard from "../components/GlassCard.jsx";

function getRoomCodeFromUrl() {
  return new URLSearchParams(window.location.search).get("room") || "";
}

export default function Landing({ onJoined }) {
  const invitedCode = getRoomCodeFromUrl().toUpperCase();
  const [mode, setMode] = useState(invitedCode ? "join" : "create"); // create | join
  const [name, setName] = useState("");
  const [code, setCode] = useState(invitedCode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter your name first.");
    setError("");
    setLoading(true);
    socket.emit("createRoom", { name }, (res) => {
      setLoading(false);
      if (res?.ok) onJoined(res.room);
      else setError(res?.error || "Could not create room.");
    });
  }

  function handleJoin(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter your name first.");
    if (!code.trim()) return setError("Enter the room code.");
    setError("");
    setLoading(true);
    socket.emit(
        "joinRoom",
        { name, code: code.trim().toUpperCase() },
        (res) => {
          setLoading(false);
          if (res?.ok) onJoined(res.room);
          else setError(res?.error || "Could not join room.");
        }
    );
  }

  return (
      <div className="w-full max-w-xl flex flex-col items-center gap-8 mt-4 md:mt-10 animate-floatSlow">
        <div className="text-center space-y-3">
          <span className="label-eyebrow">Real-time word duel</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Explain it. Guess it.{" "}
            <span className="bg-gradient-to-r from-teal to-violet-soft bg-clip-text text-transparent">
            Never say it.
          </span>
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Gather your club, split into an explainer, a controller, and a room
            full of guessers. One code gets everyone in.
          </p>
        </div>

        <GlassCard className="w-full">
          {invitedCode && (
              <p className="text-center text-sm text-teal-soft font-medium mb-4">
                You've been invited to room <span className="font-mono tracking-[0.2em]">{invitedCode}</span> — just add your name and join in.
              </p>
          )}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
            <TabButton active={mode === "create"} onClick={() => setMode("create")}>
              Create a room
            </TabButton>
            <TabButton active={mode === "join"} onClick={() => setMode("join")}>
              Join a room
            </TabButton>
          </div>

          <form
              onSubmit={mode === "create" ? handleCreate : handleJoin}
              className="space-y-4"
          >
            <div>
              <label className="label-eyebrow block mb-2">Your name</label>
              <input
                  className="input-field"
                  placeholder="e.g. Leyla"
                  value={name}
                  maxLength={10}
                  onChange={(e) => setName(e.target.value)}
              />
            </div>

            {mode === "join" && (
                <div>
                  <label className="label-eyebrow block mb-2">Room code</label>
                  <input
                      className="input-field font-mono tracking-[0.3em] uppercase"
                      placeholder="ABCDE"
                      value={code}
                      maxLength={6}
                      onChange={(e) => setCode(e.target.value)}
                  />
                </div>
            )}

            {error && <p className="text-coral text-sm font-medium">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading
                  ? "One moment…"
                  : mode === "create"
                      ? "Create room"
                      : "Join room"}
            </button>
          </form>
        </GlassCard>

        <p className="text-xs text-slate-500 text-center max-w-sm">
          As moderator you'll be able to set turn time, player limits, and word
          difficulty before the game begins.
        </p>
      </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
      <button
          type="button"
          onClick={onClick}
          className={`flex-1 py-2.5 rounded-lg font-display text-sm font-semibold transition ${
              active
                  ? "bg-white/10 text-slate-50 shadow-glow"
                  : "text-slate-400 hover:text-slate-200"
          }`}
      >
        {children}
      </button>
  );
}
