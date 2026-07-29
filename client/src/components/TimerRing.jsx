import React from "react";

export default function TimerRing({ timeLeft, duration, size = 140 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, timeLeft / duration));
  const dash = circumference * pct;
  const urgent = timeLeft <= 10;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          className="fill-none stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          strokeLinecap="round"
          className={`fill-none transition-all duration-1000 ease-linear ${
            urgent ? "stroke-coral" : "stroke-teal"
          }`}
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div
        className={`absolute font-mono font-bold text-3xl ${
          urgent ? "text-coral animate-pulseRing" : "text-slate-100"
        }`}
      >
        {timeLeft}
      </div>
    </div>
  );
}
