import type { ServerWebSocket } from "bun";

export interface WSData {
  username: string;
  room: string;
  joinedAt: number;
}

type WS = ServerWebSocket<WSData>;

// Track rooms → set of sockets
const rooms = new Map<string, Set<WS>>();

function getRoom(name: string): Set<WS> {
  if (!rooms.has(name)) rooms.set(name, new Set());
  return rooms.get(name)!;
}

function broadcast(room: string, message: object, exclude?: WS) {
  const payload = JSON.stringify(message);
  for (const ws of getRoom(room)) {
    if (ws !== exclude) ws.send(payload);
  }
}

function presence(room: string): string[] {
  return [...getRoom(room)].map((ws) => ws.data.username);
}

export const handleWebSocket = {
  open(ws: WS) {
    const { username, room } = ws.data;
    getRoom(room).add(ws);
    ws.subscribe(room);

    // Send welcome to joiner
    ws.send(JSON.stringify({
      type: "system",
      message: `Welcome to #${room}, ${username}!`,
      users: presence(room),
      timestamp: Date.now(),
    }));

    // Notify others
    broadcast(room, {
      type: "join",
      username,
      users: presence(room),
      timestamp: Date.now(),
    }, ws);
  },

  message(ws: WS, raw: string | Buffer) {
    const { username, room } = ws.data;
    const text = typeof raw === "string" ? raw : new TextDecoder().decode(raw);

    let parsed: { type?: string; message?: string; targetRoom?: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text };
    }

    // Room switch
    if (parsed.type === "switch" && parsed.targetRoom) {
      getRoom(room).delete(ws);
      ws.unsubscribe(room);
      broadcast(room, { type: "leave", username, users: presence(room), timestamp: Date.now() });

      ws.data.room = parsed.targetRoom;
      getRoom(parsed.targetRoom).add(ws);
      ws.subscribe(parsed.targetRoom);

      ws.send(JSON.stringify({
        type: "system",
        message: `Switched to #${parsed.targetRoom}`,
        users: presence(parsed.targetRoom),
        timestamp: Date.now(),
      }));
      broadcast(parsed.targetRoom, { type: "join", username, users: presence(parsed.targetRoom), timestamp: Date.now() }, ws);
      return;
    }

    // Regular message
    broadcast(room, {
      type: "message",
      username,
      message: parsed.message || text,
      timestamp: Date.now(),
    }, ws);

    // Echo back confirmation
    ws.send(JSON.stringify({
      type: "message",
      username,
      message: parsed.message || text,
      self: true,
      timestamp: Date.now(),
    }));
  },

  close(ws: WS) {
    const { username, room } = ws.data;
    getRoom(room).delete(ws);
    ws.unsubscribe(room);
    broadcast(room, {
      type: "leave",
      username,
      users: presence(room),
      timestamp: Date.now(),
    });
    // Clean up empty rooms
    if (getRoom(room).size === 0) rooms.delete(room);
  },
};
