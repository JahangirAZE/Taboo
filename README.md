# Taboo Club 🕵️‍♀️

A real-time, multiplayer Taboo word game built for your club: create a room,
share a code, and play with a **Controller**, an **Explainer**, and a room
full of **Guessers** — roles rotate automatically every turn.

- **Backend:** Node.js, Express, Socket.io (in-memory room state, no database needed)
- **Frontend:** React + Vite + Tailwind, glassmorphism UI

## How the game works

1. Someone creates a room and becomes the **moderator**. They set turn
   duration, max players, word difficulty, and the points needed to win.
2. Everyone else joins with the 5-letter room code.
3. When the moderator starts the game, each turn assigns two roles from the
   player rotation:
   - **Explainer** — describes the secret word out loud without saying it.
   - **Controller** — the only person who can see the secret word and its 5
     taboo words. They can shuffle the word, pick a difficulty, and start the
     timer when the explainer is ready. If the explainer slips and says a
     taboo word, the controller taps **Taboo!** to end the turn instantly.
   - Everyone else is a **Guesser** — they type answers into the guess box.
4. First correct guess ends the turn: the explainer gets a point (🗣 "explained"),
   the guesser gets a point (🎯 "found"). If time runs out, the turn passes
   with no points.
5. Roles rotate every turn so everyone gets a turn explaining and controlling.
6. First to reach the target score wins — the final leaderboard shows everyone's
   explained/found/total breakdown.

## Project structure

```
taboo-game/
  server/   Node/Express/Socket.io backend (in-memory game state)
  client/   React + Vite + Tailwind frontend
```

## Running locally

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # optional — defaults work fine for local dev
npm run dev            # starts on http://localhost:4000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev            # starts on http://localhost:5173
```

Open `http://localhost:5173` in a browser tab per player (or on separate
devices on the same network, pointing `VITE_SERVER_URL` at your machine's LAN
IP instead of `localhost`).

## Deploying

The backend and frontend are separate deployables:

- **Backend**: deploy `server/` anywhere that runs Node (Render, Railway,
  Fly.io, a VPS, etc.). Set `CLIENT_ORIGIN` to your deployed frontend's URL
  so CORS allows it, and note the backend's public URL.
- **Frontend**: deploy `client/` as a static build to Vercel, Netlify, or
  similar. Set the `VITE_SERVER_URL` environment variable to your backend's
  public URL before running `npm run build`.

```bash
# frontend production build
cd client
VITE_SERVER_URL=https://your-backend.example.com npm run build
# outputs static files to client/dist
```

Because game state is kept in memory on the server, running multiple backend
instances behind a load balancer will split rooms across processes — for a
club-sized game, a single backend instance is simplest and sufficient.

## Customizing the word bank

Words, their taboo lists, categories, and difficulty tiers live in
`server/src/wordBank.js`. Add, remove, or edit entries there — no other code
changes are needed.

## Tech notes

- Game state (rooms, players, scores, current word) lives entirely in server
  memory via the `Room` class in `server/src/Room.js` — restarting the server
  clears all active rooms.
- The secret word and taboo list are only ever sent to the current
  controller's socket, never broadcast to the room.
- Guess matching normalizes case/punctuation and forgives single-character
  typos (small edit distance) so close guesses still count.
