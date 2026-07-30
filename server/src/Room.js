import { getRandomWord } from "./wordBank.js";

const DEFAULT_SETTINGS = {
  turnDuration: 60, // seconds
  maxPlayers: 10,
  difficulty: "mixed", // easy | medium | hard | mixed
  targetScore: 15,
  tabooPenalty: false, // if true, flagging taboo costs the explainer a point
};

function normalize(str) {
  return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, "");
}

// Inexpensive Levenshtein distance, capped, to forgive small typos on guesses.
function levenshtein(a, b, maxDistance = 3) {
  const m = a.length;
  const n = b.length;

  if (Math.abs(m - n) > maxDistance) {
    return maxDistance + 1;
  }

  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

// Longer words get more typo tolerance; short words stay strict so
// unrelated-but-similar words aren't accepted as correct.
function allowedTypoDistance(word) {
  const len = word.length;
  if (len <= 4) return 0;
  if (len <= 7) return 2;
  if (len <= 11) return 3;
  return 4;
}

export class Room {
  constructor(code, moderatorId) {
    this.code = code;
    this.moderatorId = moderatorId;
    this.settings = { ...DEFAULT_SETTINGS };
    this.players = []; // { id, name, connected, scoreExplained, scoreFound }
    this.status = "lobby"; // lobby | setup | active | finished
    this.turnIndex = 0;
    this.usedWords = [];
    this.currentEntry = null; // { word, taboo, category, difficulty }
    this.timer = null;
    this.timeLeft = 0;
    this.log = []; // recent turn history for the feed
    this.winnerId = null;
  }

  addPlayer(id, name) {
    if (this.players.find((p) => p.id === id)) return;
    this.players.push({
      id,
      name,
      connected: true,
      scoreExplained: 0,
      scoreFound: 0,
    });
  }

  removePlayer(id) {
    const p = this.players.find((pl) => pl.id === id);
    if (p) p.connected = false;
  }

  get activePlayers() {
    return this.players.filter((p) => p.connected);
  }

  isModerator(id) {
    return this.moderatorId === id;
  }

  updateSettings(patch) {
    this.settings = {
      ...this.settings,
      ...patch,
      turnDuration: clamp(patch.turnDuration ?? this.settings.turnDuration, 15, 300),
      maxPlayers: clamp(patch.maxPlayers ?? this.settings.maxPlayers, 3, 30),
      targetScore: clamp(patch.targetScore ?? this.settings.targetScore, 3, 100),
    };
  }

  // Roles are derived from turnIndex over the *connected* player list so
  // that everyone cycles through Explainer -> Controller -> Guesser fairly.
  getRoles() {
    const active = this.activePlayers;
    if (active.length < 3) return null;
    const n = active.length;
    const explainer = active[this.turnIndex % n];
    const controller = active[(this.turnIndex + 1) % n];
    const guessers = active.filter(
        (p) => p.id !== explainer.id && p.id !== controller.id
    );
    return { explainer, controller, guessers };
  }

  startGame() {
    this.status = "setup";
    this.turnIndex = 0;
    this.usedWords = [];
    this.players.forEach((p) => {
      p.scoreExplained = 0;
      p.scoreFound = 0;
    });
    this.winnerId = null;
    this.log = [];
    this._drawWord();
  }

  _drawWord(difficultyOverride) {
    const difficulty = difficultyOverride || this.settings.difficulty;
    this.currentEntry = getRandomWord(difficulty, this.usedWords);
    this.status = "setup";
  }

  shuffleWord(difficultyOverride) {
    this._drawWord(difficultyOverride);
  }

  // Lets the controller fully override the suggested word/taboo list with
  // their own text, as long as the turn hasn't started yet.
  setCustomWord({ word, taboo }) {
    if (this.status !== "setup") return false;
    const cleanWord = String(word || "").trim().slice(0, 60);
    if (!cleanWord) return false;

    const cleanTaboo = Array.from(
        new Set(
            (Array.isArray(taboo) ? taboo : [])
                .map((t) => String(t || "").trim().slice(0, 40))
                .filter(Boolean)
        )
    ).slice(0, 8);

    this.currentEntry = {
      word: cleanWord,
      taboo: cleanTaboo,
      category: "Custom",
      difficulty: this.currentEntry?.difficulty || this.settings.difficulty,
    };
    return true;
  }

  beginTurn(io) {
    this.status = "active";
    this.usedWords.push(this.currentEntry.word);
    if (this.usedWords.length > 40) this.usedWords.shift();
    this.timeLeft = this.settings.turnDuration;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this._endTurn(io, { reason: "time_up", word: this.currentEntry?.word });
      } else {
        io.to(this.code).emit("timer", { timeLeft: this.timeLeft });
      }
    }, 1000);
  }

  submitGuess(io, guesserId, rawGuess) {
    if (this.status !== "active" || !this.currentEntry) return null;
    const roles = this.getRoles();
    if (!roles) return null;
    // Only guessers may submit guesses.
    if (!roles.guessers.find((p) => p.id === guesserId)) return null;

    const trimmedRaw = String(rawGuess || "").trim();
    if (!trimmedRaw) return null;

    const guess = normalize(rawGuess);
    const target = normalize(this.currentEntry.word);
    const maxDistance = allowedTypoDistance(target);
    const distance = levenshtein(guess, target, maxDistance);
    const isCorrect = guess.length > 0 && (guess === target || distance <= maxDistance);

    const guesser = this.players.find((p) => p.id === guesserId);

    // Let the explainer see a live feed of what's being guessed. Guessers
    // don't get each other's attempts, so nobody can piggyback off others.
    io.to(roles.explainer.id).emit("guessAttempt", {
      guesserId,
      guesserName: guesser?.name || "Someone",
      guess: trimmedRaw.slice(0, 60),
      correct: isCorrect,
      at: Date.now(),
    });

    if (isCorrect) {
      const explainer = this.players.find((p) => p.id === roles.explainer.id);
      guesser.scoreFound += 1;
      explainer.scoreExplained += 1;
      clearInterval(this.timer);
      this._endTurn(io, {
        reason: "correct",
        guesserName: guesser.name,
        explainerName: explainer.name,
        word: this.currentEntry.word,
      });
      return { correct: true };
    }
    return { correct: false };
  }

  flagTaboo(io) {
    if (this.status !== "active") return;
    const roles = this.getRoles();
    if (this.settings.tabooPenalty && roles) {
      const explainer = this.players.find((p) => p.id === roles.explainer.id);
      explainer.scoreExplained = Math.max(0, explainer.scoreExplained - 1);
    }
    clearInterval(this.timer);
    this._endTurn(io, { reason: "taboo", word: this.currentEntry?.word });
  }

  passWord(io) {
    if (this.status !== "active") return;
    clearInterval(this.timer);
    this._endTurn(io, { reason: "pass", word: this.currentEntry?.word });
  }

  _endTurn(io, resultMeta) {
    this.log.unshift({ ...resultMeta, at: Date.now() });
    if (this.log.length > 15) this.log.pop();

    const winner = this.players.find(
        (p) => p.scoreExplained + p.scoreFound >= this.settings.targetScore
    );

    io.to(this.code).emit("turnEnded", {
      result: resultMeta,
      room: this.toPublicState(),
    });

    if (winner) {
      this.status = "finished";
      this.winnerId = winner.id;
      io.to(this.code).emit("gameOver", { room: this.toPublicState() });
      return;
    }

    this.turnIndex += 1;
    this._drawWord();
    io.to(this.code).emit("roomUpdate", this.toPublicState());
    const nextRoles = this.getRoles();
    if (nextRoles) {
      io.to(nextRoles.controller.id).emit("controllerWord", this.toControllerState());
    }
  }

  // State broadcast to everyone. Never includes the secret word/taboo list
  // except via toControllerState() for the current controller only.
  toPublicState() {
    const roles = this.getRoles();
    return {
      code: this.code,
      moderatorId: this.moderatorId,
      settings: this.settings,
      status: this.status,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        connected: p.connected,
        scoreExplained: p.scoreExplained,
        scoreFound: p.scoreFound,
        total: p.scoreExplained + p.scoreFound,
      })),
      roles: roles
          ? {
            explainerId: roles.explainer.id,
            explainerName: roles.explainer.name,
            controllerId: roles.controller.id,
            controllerName: roles.controller.name,
            guesserIds: roles.guessers.map((g) => g.id),
          }
          : null,
      timeLeft: this.timeLeft,
      wordMeta: this.currentEntry
          ? { category: this.currentEntry.category, difficulty: this.currentEntry.difficulty }
          : null,
      log: this.log,
      winnerId: this.winnerId,
    };
  }

  toControllerState() {
    return this.currentEntry
        ? {
          word: this.currentEntry.word,
          taboo: this.currentEntry.taboo,
          category: this.currentEntry.category,
          difficulty: this.currentEntry.difficulty,
        }
        : null;
  }
}

function clamp(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}
