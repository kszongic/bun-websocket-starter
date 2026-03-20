import { serve } from "bun";
import { handleWebSocket, type WSData } from "./ws";
import { handleHTTP } from "./http";

const PORT = Number(process.env.PORT) || 3000;

const server = serve<WSData>({
  port: PORT,
  fetch(req, server) {
    const url = new URL(req.url);

    // Upgrade WebSocket requests
    if (url.pathname === "/ws") {
      const token = url.searchParams.get("token") || req.headers.get("authorization")?.replace("Bearer ", "");
      const username = url.searchParams.get("username") || "anon-" + Math.random().toString(36).slice(2, 7);
      const room = url.searchParams.get("room") || "general";

      const upgraded = server.upgrade(req, {
        data: { username, room, joinedAt: Date.now() },
      });

      if (!upgraded) {
        return new Response("WebSocket upgrade failed", { status: 400 });
      }
      return undefined;
    }

    return handleHTTP(req, url);
  },
  websocket: handleWebSocket,
});

console.log(`🚀 Bun WebSocket server running on http://localhost:${PORT}`);
console.log(`   WebSocket: ws://localhost:${PORT}/ws?username=NAME&room=ROOM`);
console.log(`   Chat UI:   http://localhost:${PORT}`);
