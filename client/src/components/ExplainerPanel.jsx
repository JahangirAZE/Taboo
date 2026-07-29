import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import GlassCard from "./GlassCard.jsx";

export default function ExplainerPanel({ room, controllerWord }) {
    const isSetup = room.status === "setup";
    const isActive = room.status === "active";

    const [guessLog, setGuessLog] = useState([]);

    useEffect(() => {
        // In case the word push was missed (e.g. late join/reconnect mid-turn), ask for it.
        if (isActive && !controllerWord) {
            socket.emit("requestControllerWord", { code: room.code });
        }
    }, [room.status]);

    // Fresh log every turn — clear out whenever we're not mid-turn.
    useEffect(() => {
        if (!isActive) setGuessLog([]);
    }, [isActive]);

    useEffect(() => {
        function onGuessAttempt(entry) {
            setGuessLog((prev) => [entry, ...prev].slice(0, 20));
        }
        socket.on("guessAttempt", onGuessAttempt);
        return () => socket.off("guessAttempt", onGuessAttempt);
    }, []);

    return (
        <GlassCard solid className="w-full text-center">
            <span className="label-eyebrow text-teal-soft">You're explaining</span>

            {isSetup && (
                <h3 className="font-display text-2xl font-bold mt-2 mb-3">
                    Get ready — the controller is picking your word
                </h3>
            )}

            {isActive && controllerWord ? (
                <div className="rounded-xl border border-teal-soft/30 bg-teal-soft/[0.06] p-6 mt-3 mb-2">
                    <p className="font-display text-3xl font-bold text-center mb-4">
                        {controllerWord.word}
                    </p>
                    <div className="space-y-1.5">
                        {controllerWord.taboo.map((t) => (
                            <div
                                key={t}
                                className="flex items-center gap-2 text-coral/90 font-medium justify-center"
                            >
                                <span className="text-coral">🚫</span>
                                <span className="line-through decoration-coral/60">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                isActive && (
                    <p className="text-slate-400 text-sm mt-3 mb-2">Loading word…</p>
                )
            )}

            {room.wordMeta && (
                <p className="text-slate-400 text-sm font-mono uppercase tracking-wide">
                    Category hint: {room.wordMeta.category} · {room.wordMeta.difficulty}
                </p>
            )}

            {isActive && (
                <div className="mt-4 text-left">
                    <span className="label-eyebrow text-slate-400">Guesses so far</span>
                    <div className="mt-2 h-40 overflow-y-auto rounded-xl border border-white/10 bg-black/10 px-3 py-2 space-y-1.5">
                        {guessLog.length === 0 ? (
                            <p className="text-slate-500 text-xs text-center mt-3">
                                Guesses will show up here as they come in…
                            </p>
                        ) : (
                            guessLog.map((g, i) => (
                                <div
                                    key={`${g.at}-${i}`}
                                    className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 ${
                                        g.correct
                                            ? "bg-teal-soft/10 text-teal-soft"
                                            : "bg-white/[0.03] text-slate-300"
                                    }`}
                                >
                                    <span className="shrink-0">{g.correct ? "✅" : "❌"}</span>
                                    <span className="font-semibold shrink-0 truncate max-w-[35%]">
                    {g.guesserName}
                  </span>
                                    <span className="truncate flex-1 text-slate-400">
                    {g.guess}
                  </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <p className="text-slate-500 text-xs mt-4">
                Don't say the word or any of the taboo words out loud — everyone else
                is racing to guess it.
            </p>
        </GlassCard>
    );
}
