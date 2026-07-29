import React from "react";

export default function GlassCard({ children, className = "", solid = false }) {
  return (
    <div className={`${solid ? "glass-solid" : "glass"} p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}
