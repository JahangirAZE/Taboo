import React, { useEffect } from "react";
import { socket } from "../socket";
import GlassCard from "./GlassCard.jsx";

export default function ControllerPanel({ room, controllerWord }) {
  const isSetup = room.status === "setup";
  const isActive = room.status === "active";

  useEffect(() => {
    // In case a controllerWord push was missed (e.g. late join), ask for it.
    if (!controllerWord) socket.emit("requestControllerWord", { code: room.code });
  }, [room.status]);

  function shuffle(difficulty) {
    socket.emit("shuffleWord", { code: room.code, difficulty });
  }
  function begin() {
    socket.emit("beginTurn", { code: room.code });
  }
  function flagTaboo() {
    socket.emit("flagTaboo", { code: room.code });
  }
  function pass() {
    socket.emit("passWord", { code: room.code });
  }

  return (
    <GlassCard solid className="w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="label-eyebrow text-violet-soft">You are the Controller</span>
        {controllerWord && (
          <span className="text-xs font-mono uppercase text-slate-400">
            {controllerWord.category} · {controllerWord.difficulty}
          </span>
        )}
      </div>

      {controllerWord ? (
        <div className="rounded-xl border border-violet-soft/30 bg-violet-soft/[0.06] p-6 mb-5">
          <p className="font-display text-3xl font-bold text-center mb-4">
            {controllerWord.word}
          </p>
          <div className="space-y-1.5">
            {controllerWord.taboo.map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 text-coral/90 font-medium"
              >
                <span className="text-coral">🚫</span>
                <span className="line-through decoration-coral/60">{t}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-sm mb-5">Loading word…</p>
      )}

      {isSetup && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {["easy", "medium", "hard", "mixed"].map((d) => (
              <button
                key={d}
                onClick={() => shuffle(d)}
                className="py-2 rounded-lg text-xs font-display font-semibold capitalize bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => shuffle()} className="btn-ghost flex-1">
              🔀 Shuffle word
            </button>
            <button onClick={begin} className="btn-primary flex-1">
              Reveal & start turn
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Only you can see this word. Make sure the explainer is ready before
            you start the timer.
          </p>
        </div>
      )}

      {isActive && (
        <div className="flex gap-3">
          <button onClick={flagTaboo} className="btn-danger flex-1">
            🚫 Taboo used!
          </button>
          <button onClick={pass} className="btn-ghost flex-1">
            ⏭ Pass
          </button>
        </div>
      )}
    </GlassCard>
  );
}
