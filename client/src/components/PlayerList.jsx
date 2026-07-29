import React from "react";

export default function PlayerList({ room, myId }) {
  return (
    <ul className="space-y-2">
      {room.players.map((p) => {
        const isMe = p.id === myId;
        const isMod = p.id === room.moderatorId;
        return (
          <li
            key={p.id}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition ${
              p.connected
                ? "border-white/10 bg-white/[0.04]"
                : "border-white/5 bg-white/[0.01] opacity-40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full ${
                  p.connected ? "bg-teal shadow-glow" : "bg-slate-600"
                }`}
              />
              <span className="font-medium">
                {p.name}
                {isMe && <span className="text-teal-soft"> (you)</span>}
              </span>
              {isMod && (
                <span className="label-eyebrow text-gold/80 !tracking-normal">
                  Moderator
                </span>
              )}
            </div>
            {!p.connected && (
              <span className="text-xs font-mono text-slate-500">offline</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
