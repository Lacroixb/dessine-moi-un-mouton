const { createServer } = require("http");
const WebSocketServer = require("ws").Server;
const { setupWSConnection } = require("y-websocket/bin/utils");

const PORT = process.env.PORT || 1234;

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Yjs WebSocket Server is running\n");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req);
});

server.listen(PORT, () => {
  console.log(`✅ Yjs WebSocket server running on ws://localhost:${PORT}`);
});