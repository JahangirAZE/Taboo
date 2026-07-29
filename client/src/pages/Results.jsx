import React from "react";
import { socket } from "../socket";
import GlassCard from "../components/GlassCard.jsx";
import Leaderboard from "../components/Leaderboard.jsx";

export default function Results({ room, myId }) {
  const winner = room.players.find((p) => p.id === room.winnerId);
  const isModerator = room.moderatorId === myId;

  function playAgain() {
    socket.emit("playAgain", { code: room.code });
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 mt-4">
      <div className="text-center space-y-2">
        <span className="label-eyebrow text-gold">Game over</span>
        <h2 className="font-display text-4xl font-bold">
          🏆 {winner ? winner.name : "It's a wrap"}
        </h2>
        {winner && (
          <p className="text-slate-400">
            wins with {winner.total} points
          </p>
        )}
      </div>

      <GlassCard className="w-full">
        <h3 className="font-display font-semibold mb-4">Final standings</h3>
        <Leaderboard room={room} myId={myId} />
      </GlassCard>

      {isModerator ? (
        <button onClick={playAgain} className="btn-primary w-full max-w-xs">
          Back to lobby — play again
        </button>
      ) : (
        <p className="text-slate-500 text-sm">
          Waiting for the moderator to start a new round…
        </p>
      )}
    </div>
  );
}
