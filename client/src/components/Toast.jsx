import React from "react";

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-solid px-5 py-3 border-coral/40 text-sm font-medium shadow-glow">
        {message}
      </div>
    </div>
  );
}
