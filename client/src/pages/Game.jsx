import React from "react";
import ControllerPanel from "../components/ControllerPanel.jsx";
import ExplainerPanel from "../components/ExplainerPanel.jsx";
import GuesserPanel from "../components/GuesserPanel.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import TimerRing from "../components/TimerRing.jsx";
import GlassCard from "../components/GlassCard.jsx";

export default function Game({ room, myId, controllerWord, turnResult }) {
    const roles = room.roles;
    if (!roles) {
        return (
            <GlassCard className="w-full text-center">
                <p className="text-slate-400">Waiting for enough players to continue…</p>
            </GlassCard>
        );
    }

    const isController = roles.controllerId === myId;
    const isExplainer = roles.explainerId === myId;

    return (
        <div className="w-full grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3 space-y-6">
                <RoleBanner room={room} roles={roles} />

                {room.status === "active" && (
                    <div className="flex justify-center">
                        <TimerRing
                            timeLeft={room.timeLeft}
                            duration={room.settings.turnDuration}
                        />
                    </div>
                )}

                {isController && (
                    <ControllerPanel room={room} controllerWord={controllerWord} />
                )}
                {isExplainer && (
                    <ExplainerPanel room={room} controllerWord={controllerWord} />
                )}
                {!isController && !isExplainer && (
                    <GuesserPanel room={room} explainerName={roles.explainerName} />
                )}

                {turnResult && <ResultBanner result={turnResult} />}
            </div>

            <div className="md:col-span-2 space-y-6">
                <GlassCard>
                    <h3 className="font-display font-semibold mb-4">Leaderboard</h3>
                    <Leaderboard room={room} myId={myId} />
                </GlassCard>

                {room.log?.length > 0 && (
                    <GlassCard>
                        <h3 className="font-display font-semibold mb-4">Recent turns</h3>
                        <ul className="space-y-2 text-sm">
                            {room.log.slice(0, 6).map((entry, i) => (
                                <li key={i} className="text-slate-400">
                                    <LogLine entry={entry} />
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}

function RoleBanner({ roles }) {
    return (
        <GlassCard className="flex items-center justify-between !py-5">
            <div>
                <span className="label-eyebrow">Now explaining</span>
                <p className="font-display text-xl font-bold">{roles.explainerName}</p>
            </div>
            <div className="text-right">
                <span className="label-eyebrow">Controller</span>
                <p className="font-display text-xl font-bold text-violet-soft">
                    {roles.controllerName}
                </p>
            </div>
        </GlassCard>
    );
}

function ResultBanner({ result }) {
    const styles = {
        correct: { emoji: "🎉", text: `${result.guesserName} nailed it — "${result.word}"!`, color: "text-teal-soft" },
        time_up: { emoji: "⏱", text: `Time's up! The word was "${result.word}".`, color: "text-slate-300" },
        taboo: { emoji: "🚫", text: `Taboo word used! The word was "${result.word}".`, color: "text-coral" },
        pass: { emoji: "⏭", text: `Passed. The word was "${result.word}".`, color: "text-slate-300" },
    };
    const s = styles[result.reason] || styles.time_up;
    return (
        <GlassCard solid className={`text-center font-display font-semibold ${s.color}`}>
            <span className="text-2xl mr-2">{s.emoji}</span>
            {s.text}
        </GlassCard>
    );
}

function LogLine({ entry }) {
    const label =
        entry.reason === "correct"
            ? `✅ ${entry.guesserName} guessed "${entry.word}" (${entry.explainerName} explained)`
            : entry.reason === "taboo"
                ? `🚫 Taboo flagged on "${entry.word}"`
                : entry.reason === "pass"
                    ? `⏭ Passed on "${entry.word}"`
                    : `⏱ Time ran out on "${entry.word}"`;
    return <span>{label}</span>;
}
