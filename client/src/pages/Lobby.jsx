import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import GlassCard from "../components/GlassCard.jsx";
import PlayerList from "../components/PlayerList.jsx";
import { copyInviteLink } from "../utils/inviteLink.js";

export default function Lobby({ room, myId }) {
  const isModerator = room.moderatorId === myId;
  const [settings, setSettings] = useState(room.settings);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => setSettings(room.settings), [room.settings]);

  async function handleCopyLink() {
    const ok = await copyInviteLink(room.code);
    if (ok) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  function pushSettings(patch) {
    const next = { ...settings, ...patch };
    setSettings(next);
    socket.emit("updateSettings", { code: room.code, settings: next });
  }

  function startGame() {
    socket.emit("startGame", { code: room.code });
  }

  const canStart = room.players.filter((p) => p.connected).length >= 3;

  return (
      <div className="w-full grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 space-y-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="label-eyebrow">Invite code</span>
                <p className="font-mono text-3xl font-bold tracking-[0.35em] text-teal-soft">
                  {room.code}
                </p>
              </div>
              <div className="text-right">
                <span className="label-eyebrow">Players</span>
                <p className="font-display text-2xl font-bold">
                  {room.players.filter((p) => p.connected).length}/
                  {room.settings.maxPlayers}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-ghost !px-4 !py-2 text-sm flex items-center gap-2"
              >
                {linkCopied ? "Link copied!" : "Copy invite link"}
              </button>
              <p className="text-slate-400 text-sm">
                Share the code or link with the club. Everyone who joins shows
                up below in real time.
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display font-semibold mb-4">Players in room</h3>
            <PlayerList room={room} myId={myId} />
          </GlassCard>
        </div>

        <div className="md:col-span-2 space-y-6">
          <GlassCard solid>
            <h3 className="font-display font-semibold mb-1">Game settings</h3>
            <p className="text-slate-400 text-sm mb-5">
              {isModerator
                  ? "Tune the round before you begin."
                  : "Only the moderator can change these."}
            </p>

            <div className="space-y-5">
              <SliderField
                  label="Turn duration"
                  value={settings.turnDuration}
                  unit="sec"
                  min={30}
                  max={240}
                  step={10}
                  disabled={!isModerator}
                  onChange={(v) => pushSettings({ turnDuration: v })}
              />
              <SliderField
                  label="Max players"
                  value={settings.maxPlayers}
                  min={3}
                  max={10}
                  step={1}
                  disabled={!isModerator}
                  onChange={(v) => pushSettings({ maxPlayers: v })}
              />
              <SliderField
                  label="Points to win"
                  value={settings.targetScore}
                  min={5}
                  max={20}
                  step={1}
                  disabled={!isModerator}
                  onChange={(v) => pushSettings({ targetScore: v })}
              />

              <div>
                <span className="label-eyebrow block mb-2">Word difficulty</span>
                <div className="grid grid-cols-4 gap-2">
                  {["easy", "medium", "hard", "mixed"].map((d) => (
                      <button
                          key={d}
                          type="button"
                          disabled={!isModerator}
                          onClick={() => pushSettings({ difficulty: d })}
                          className={`py-2 rounded-lg text-xs font-display font-semibold capitalize transition ${
                              settings.difficulty === d
                                  ? "bg-gradient-to-br from-teal to-violet-soft text-ink"
                                  : "bg-white/5 border border-white/10 text-slate-300"
                          } disabled:opacity-50`}
                      >
                        {d}
                      </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="label-eyebrow">Taboo costs a point</span>
                <input
                    type="checkbox"
                    disabled={!isModerator}
                    checked={settings.tabooPenalty}
                    onChange={(e) => pushSettings({ tabooPenalty: e.target.checked })}
                    className="w-5 h-5 accent-coral"
                />
              </label>
            </div>
          </GlassCard>

          {isModerator ? (
              <button
                  onClick={startGame}
                  disabled={!canStart}
                  className="btn-primary w-full text-lg"
              >
                {canStart ? "Start the game" : "Need at least 3 players"}
              </button>
          ) : (
              <div className="glass px-5 py-4 text-center text-slate-400 text-sm">
                Waiting for the moderator to start the game…
              </div>
          )}
        </div>
      </div>
  );
}

function SliderField({ label, value, unit, min, max, step, disabled, onChange }) {
  return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="label-eyebrow">{label}</span>
          <span className="font-mono font-semibold text-teal-soft">
          {value}
            {unit ? ` ${unit}` : ""}
        </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-teal disabled:opacity-40"
        />
      </div>
  );
}
