import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import GlassCard from "./GlassCard.jsx";

export default function GuesserPanel({ room, explainerName }) {
  const [guess, setGuess] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const isActive = room.status === "active";

  useEffect(() => {
    function onResult({ correct }) {
      setGuess("");

      if (!correct) {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          inputRef.current?.focus();
        }, 400);
      } else {
        inputRef.current?.focus();
      }
    }
    socket.on("guessResult", onResult);
    return () => socket.off("guessResult", onResult);
  }, []);

  function submit(e) {
    e.preventDefault();

    const trimmedGuess = guess.trim();

    if (!trimmedGuess || !isActive) return;

    socket.emit("submitGuess", {
      code: room.code,
      guess: trimmedGuess
    });
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
              ref={inputRef}
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
          <button type="submit" disabled={!isActive || !guess.trim()} className="btn-primary shrink-0">
            Submit
          </button>
        </form>
      </GlassCard>
  );
}
