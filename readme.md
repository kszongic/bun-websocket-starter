<div align="center">

# 🚀 Bun WebSocket Starter

**Production-ready WebSocket server built with [Bun](https://bun.sh) — rooms, presence tracking, and a built-in chat UI. Zero npm dependencies.**

[![Bun](https://img.shields.io/badge/Bun-1.0+-black?logo=bun&logoColor=white)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./license)
[![GitHub stars](https://img.shields.io/github/stars/kszongic/bun-websocket-starter?style=social)](https://github.com/kszongic/bun-websocket-starter)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/kszongic/bun-websocket-starter/pulls)

[Quick Start](#quick-start) · [WebSocket API](#websocket-api) · [Deploy](#deploy) · [Customization](#customization-ideas)

</div>

---

## Why This Starter?

Building a WebSocket server from scratch means wiring up connection handling, room management, presence tracking, reconnection, and a test client — before you even start on your actual feature. This starter gives you all of that out of the box with **zero dependencies** using Bun's native WebSocket API.

- **No `ws`, no `socket.io`, no bloat** — just Bun's built-in server
- **Rooms + presence** ready to go — join, switch, broadcast per-room
- **Chat UI included** — open your browser and test immediately
- **TypeScript** — fully typed from day one
- **~200 lines of code** — easy to understand, easy to extend

## Features

| Feature | Details |
|---------|---------|
| ⚡ **Native Bun WebSockets** | No dependencies, leverages Bun's C++ WebSocket implementation |
| 🏠 **Rooms** | Join, switch, and broadcast messages per-room |
| 👥 **Presence Tracking** | Real-time online user lists, join/leave notifications |
| 💬 **Built-in Chat UI** | Sleek dark-theme client served at `/` — no separate frontend needed |
| 🏥 **Health Endpoint** | `GET /health` for load balancers and monitoring |
| 🔄 **Hot Reload** | `bun run --watch` for instant dev feedback |
| 🧪 **Tests Included** | WebSocket integration tests with `bun test` |

## Quick Start

```bash
# Clone
git clone https://github.com/kszongic/bun-websocket-starter.git
cd bun-websocket-starter

# Install Bun (if needed)
curl -fsSL https://bun.sh/install | bash

# Configure
cp .env.example .env

# Run
bun dev
```

Open **http://localhost:3000** for the chat UI. Open a second tab to see real-time messaging.

### One-liner (if you have Bun)

```bash
git clone https://github.com/kszongic/bun-websocket-starter.git && cd bun-websocket-starter && cp .env.example .env && bun dev
```

## WebSocket API

### Connecting

```
ws://localhost:3000/ws?username=alice&room=general
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `username` | Yes | — | Display name for the session |
| `room` | No | `general` | Room to join on connect |

### Client → Server Messages

```json
// Send a chat message
{ "message": "Hello everyone!" }

// Switch to a different room
{ "type": "switch", "targetRoom": "random" }
```

### Server → Client Messages

```json
// Chat message
{
  "type": "message",
  "username": "alice",
  "message": "Hello!",
  "timestamp": 1234567890
}

// User joined the room
{
  "type": "join",
  "username": "bob",
  "users": ["alice", "bob"],
  "timestamp": 1234567890
}

// User left the room
{
  "type": "leave",
  "username": "bob",
  "users": ["alice"],
  "timestamp": 1234567890
}

// System notification
{
  "type": "system",
  "message": "Welcome to #general!",
  "users": ["alice"],
  "timestamp": 1234567890
}
```

## Project Structure

```
src/
├── index.ts       # Server entry — HTTP + WebSocket upgrade
├── ws.ts          # WebSocket handler — rooms, broadcast, presence
├── http.ts        # HTTP routes — chat UI + health check
└── test/
    └── ws.test.ts # Integration tests
```

## Deploy

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new?repo=kszongic/bun-websocket-starter)

Set the start command to `bun start` and expose port 3000.

### Fly.io

```bash
fly launch --image oven/bun:1 --internal-port 3000
fly deploy
```

### Docker

```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --production
COPY . .
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

```bash
docker build -t bun-ws . && docker run -p 3000:3000 bun-ws
```

## Performance

Bun's WebSocket implementation is built on **uWebSockets** (C/C++), making it significantly faster than Node.js alternatives:

| Runtime / Library | Messages/sec (approx) | Dependencies |
|---|---|---|
| **Bun (native)** ⬅️ | ~1,000,000+ | 0 |
| Node.js + `ws` | ~300,000 | 1 |
| Node.js + `socket.io` | ~100,000 | 20+ |

> Numbers vary by hardware and payload size. The key point: Bun's native WebSockets are _fast_.

## Comparison

| Feature | This Starter | socket.io | ws + express | Deno WebSocket |
|---------|:---:|:---:|:---:|:---:|
| Zero dependencies | ✅ | ❌ | ❌ | ✅ |
| Built-in rooms | ✅ | ✅ | ❌ | ❌ |
| Presence tracking | ✅ | ❌ | ❌ | ❌ |
| Chat UI included | ✅ | ❌ | ❌ | ❌ |
| Auto-reconnect (client) | ❌ | ✅ | ❌ | ❌ |
| Fallback to polling | ❌ | ✅ | ❌ | ❌ |
| TypeScript native | ✅ | ⚠️ | ⚠️ | ✅ |
| Bun-optimized | ✅ | ❌ | ❌ | ❌ |

## Customization Ideas

- 🔐 **JWT Auth** — validate tokens on WebSocket upgrade
- 💾 **Persist Messages** — use `bun:sqlite` for chat history
- 📊 **Admin Dashboard** — room stats, connected users, message rates
- 🔔 **Push Notifications** — Web Push API for offline users
- 🎨 **Swap the UI** — replace the built-in chat with React, Vue, or Svelte
- 📡 **Redis Pub/Sub** — scale horizontally across multiple instances
- 🔄 **Auto-Reconnect** — add client-side reconnection with exponential backoff

## Testing

```bash
bun test
```

Tests connect real WebSocket clients to verify messaging, room switching, and presence.

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## Related

- [astro-resume-starter](https://github.com/kszongic/astro-resume-starter) — Resume/CV template built with Astro
- [express-mongoose-starter](https://github.com/kszongic/express-mongoose-starter) — REST API starter with Express + MongoDB
- [node-background-jobs-starter](https://github.com/kszongic/node-background-jobs-starter) — Background job processing for Node.js

## License

[MIT](./license) © kszongic
