# 🔌 Bun WebSocket Starter

Production-ready WebSocket server built with [Bun](https://bun.sh) — featuring rooms, presence tracking, room switching, and a built-in chat UI.

![Bun](https://img.shields.io/badge/Bun-1.0+-black?logo=bun) ![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- ⚡ **Native Bun WebSockets** — no dependencies, blazing fast
- 🏠 **Rooms** — join, switch, and broadcast per-room
- 👥 **Presence** — real-time online user tracking
- 💬 **Built-in Chat UI** — sleek dark-theme client served at `/`
- 🏥 **Health endpoint** — `GET /health` for monitoring
- 🔄 **Hot reload** — `bun run --watch` in dev

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

Open `http://localhost:3000` for the chat UI.

## WebSocket API

Connect: `ws://localhost:3000/ws?username=NAME&room=ROOM`

### Client → Server

```json
// Send message
{ "message": "Hello!" }

// Switch room
{ "type": "switch", "targetRoom": "random" }
```

### Server → Client

```json
// Chat message
{ "type": "message", "username": "alice", "message": "Hello!", "timestamp": 1234567890 }

// User joined
{ "type": "join", "username": "bob", "users": ["alice", "bob"], "timestamp": 1234567890 }

// User left
{ "type": "leave", "username": "bob", "users": ["alice"], "timestamp": 1234567890 }

// System message
{ "type": "system", "message": "Welcome to #general!", "users": ["alice"], "timestamp": 1234567890 }
```

## Project Structure

```
src/
├── index.ts    # Server entry — HTTP + WS upgrade
├── ws.ts       # WebSocket handler — rooms, broadcast, presence
├── http.ts     # HTTP routes — chat UI + health check
└── test/
    └── ws.test.ts
```

## Customization Ideas

- 🔐 Add JWT auth (validate token on upgrade)
- 💾 Persist messages with SQLite (`bun:sqlite`)
- 📊 Add admin dashboard with room stats
- 🔔 Push notifications via Web Push API
- 🎨 Swap the chat UI for React/Vue/Svelte

## License

MIT
