import React from "react";

export default function Leaderboard({ room, myId, compact = false }) {
  const ranked = [...room.players].sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-2">
      {ranked.map((p, idx) => (
        <div
          key={p.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            p.id === myId
              ? "border-teal/40 bg-teal/[0.08]"
              : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <span
            className={`font-display font-bold w-6 text-center ${
              idx === 0 ? "text-gold" : "text-slate-400"
            }`}
          >
            {idx + 1}
          </span>
          <span className="flex-1 font-medium truncate">{p.name}</span>
          {!compact && (
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
              <span title="Points earned explaining">
                🗣 {p.scoreExplained}
              </span>
              <span title="Points earned guessing">🎯 {p.scoreFound}</span>
            </div>
          )}
          <span className="font-mono font-bold text-teal-soft w-8 text-right">
            {p.total}
          </span>
        </div>
      ))}
    </div>
  );
}
