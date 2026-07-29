import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import GlassCard from "./GlassCard.jsx";

export default function GuesserPanel({ room, explainerName }) {
  const [guess, setGuess] = useState("");
  const [shake, setShake] = useState(false);
  const isActive = room.status === "active";

  useEffect(() => {
    function onResult({ correct }) {
      if (!correct) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
      } else {
        setGuess("");
      }
    }
    socket.on("guessResult", onResult);
    return () => socket.off("guessResult", onResult);
  }, []);

  function submit(e) {
    e.preventDefault();
    if (!guess.trim() || !isActive) return;
    socket.emit("submitGuess", { code: room.code, guess });
  }

  return (
      <GlassCard solid className="w-full text-center">
        <span className="label-eyebrow text-gold/80">You're guessing</span>
        <h3 className="font-display text-2xl font-bold mt-2 mb-5">
          {isActive
              ? `Listen to ${explainerName} and type your guess`
              : `Waiting for ${explainerName}'s controller to start the turn…`}
        </h3>
        <form onSubmit={submit} className="flex gap-3">
          <input
              className={`input-field text-center text-lg font-medium ${
                  shake ? "animate-pulseRing ring-2 ring-coral" : ""
              }`}
              placeholder="Type the word…"
              value={guess}
              disabled={!isActive}
              maxLength={20}
              onChange={(e) => setGuess(e.target.value)}
              autoFocus
          />
          <button type="submit" disabled={!isActive} className="btn-primary shrink-0">
            Submit
          </button>
        </form>
      </GlassCard>
  );
}
