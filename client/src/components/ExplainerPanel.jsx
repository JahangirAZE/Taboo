import React from "react";
import GlassCard from "./GlassCard.jsx";

export default function ExplainerPanel({ room }) {
  const isSetup = room.status === "setup";
  return (
    <GlassCard solid className="w-full text-center">
      <span className="label-eyebrow text-teal-soft">You're explaining</span>
      <h3 className="font-display text-2xl font-bold mt-2 mb-3">
        {isSetup
          ? "Get ready — the controller is picking your word"
          : "Speak now! Describe the word without the taboo list."}
      </h3>
      {room.wordMeta && (
        <p className="text-slate-400 text-sm font-mono uppercase tracking-wide">
          Category hint: {room.wordMeta.category} · {room.wordMeta.difficulty}
        </p>
      )}
      <p className="text-slate-500 text-xs mt-4">
        Only your controller can see the secret word and taboo list. Everyone
        else is racing to guess it.
      </p>
    </GlassCard>
  );
}
