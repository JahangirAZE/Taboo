import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import GlassCard from "./GlassCard.jsx";

export default function ControllerPanel({ room, controllerWord }) {
  const isSetup = room.status === "setup";
  const isActive = room.status === "active";

  const [editing, setEditing] = useState(false);
  const [draftWord, setDraftWord] = useState("");
  const [draftTaboo, setDraftTaboo] = useState([""]);

  useEffect(() => {
    // In case a controllerWord push was missed (e.g. late join), ask for it.
    if (!controllerWord) socket.emit("requestControllerWord", { code: room.code });
  }, [room.status]);

  // Leaving setup (turn started/ended) should always drop out of edit mode.
  useEffect(() => {
    if (!isSetup) setEditing(false);
  }, [isSetup]);

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

  function startEditing() {
    setDraftWord(controllerWord?.word || "");
    setDraftTaboo(
        controllerWord?.taboo?.length ? [...controllerWord.taboo] : [""]
    );
    setEditing(true);
  }
  function cancelEditing() {
    setEditing(false);
  }
  function updateTabooAt(index, value) {
    setDraftTaboo((prev) => prev.map((t, i) => (i === index ? value : t)));
  }
  function addTabooRow() {
    setDraftTaboo((prev) => (prev.length >= 8 ? prev : [...prev, ""]));
  }
  function removeTabooRow(index) {
    setDraftTaboo((prev) => prev.filter((_, i) => i !== index));
  }
  function saveCustomWord() {
    if (!draftWord.trim()) return;
    socket.emit("customizeWord", {
      code: room.code,
      word: draftWord.trim(),
      taboo: draftTaboo.map((t) => t.trim()).filter(Boolean),
    });
    setEditing(false);
  }

  return (
      <GlassCard solid className="w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="label-eyebrow text-violet-soft">You are the Controller</span>
          {controllerWord && !editing && (
              <span className="text-xs font-mono uppercase text-slate-400">
            {controllerWord.category} · {controllerWord.difficulty}
          </span>
          )}
        </div>

        {editing ? (
            <div className="rounded-xl border border-violet-soft/30 bg-violet-soft/[0.06] p-5 mb-5">
              <label className="label-eyebrow text-slate-400 block mb-1.5">
                Word to guess
              </label>
              <input
                  type="text"
                  value={draftWord}
                  onChange={(e) => setDraftWord(e.target.value)}
                  placeholder="Enter your own word"
                  maxLength={20}
                  autoFocus
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 font-display font-bold text-lg text-center mb-4 focus:outline-none focus:border-violet-soft/60"
              />

              <label className="label-eyebrow text-slate-400 block mb-1.5">
                Taboo words
              </label>
              <div className="space-y-2 mb-3">
                {draftTaboo.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-coral shrink-0">🚫</span>
                      <input
                          type="text"
                          value={t}
                          onChange={(e) => updateTabooAt(i, e.target.value)}
                          placeholder={`Taboo word ${i + 1}`}
                          maxLength={20}
                          className="flex-1 min-w-0 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-coral/60"
                      />
                      <button
                          type="button"
                          onClick={() => removeTabooRow(i)}
                          aria-label="Remove taboo word"
                          className="shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 active:scale-95 transition"
                      >
                        ✕
                      </button>
                    </div>
                ))}
              </div>

              {draftTaboo.length < 8 && (
                  <button
                      type="button"
                      onClick={addTabooRow}
                      className="btn-ghost w-full mb-4 !py-2 text-sm"
                  >
                    + Add taboo word
                  </button>
              )}

              <div className="flex gap-3">
                <button onClick={cancelEditing} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button
                    onClick={saveCustomWord}
                    disabled={!draftWord.trim()}
                    className="btn-primary flex-1 disabled:opacity-40"
                >
                  Save word
                </button>
              </div>
            </div>
        ) : controllerWord ? (
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

        {isSetup && !editing && (
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
                <button onClick={startEditing} className="btn-ghost flex-1">
                  ✏️ Edit word
                </button>
              </div>
              <button onClick={begin} className="btn-primary w-full">
                Reveal & start turn
              </button>
              <p className="text-xs text-slate-500 text-center">
                Not happy with the suggestion? Edit the word and taboo list
                yourself before you start the timer.
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
