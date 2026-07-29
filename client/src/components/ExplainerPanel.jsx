import React, { useEffect } from "react";
import { socket } from "../socket";
import GlassCard from "./GlassCard.jsx";

export default function ExplainerPanel({ room, controllerWord }) {
    const isSetup = room.status === "setup";
    const isActive = room.status === "active";

    useEffect(() => {
        // In case the word push was missed (e.g. late join/reconnect mid-turn), ask for it.
        if (isActive && !controllerWord) {
            socket.emit("requestControllerWord", { code: room.code });
        }
    }, [room.status]);

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
            <p className="text-slate-500 text-xs mt-4">
                Don't say the word or any of the taboo words out loud — everyone else
                is racing to guess it.
            </p>
        </GlassCard>
    );
}
