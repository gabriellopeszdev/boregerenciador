# Como Conectar seu Game Server ao Socket.io

## Status da Conexão

Acesse [http://localhost:3000/api/socket/status](http://localhost:3000/api/socket/status) para verificar se o Socket.io está funcionando.

## Conectar seu Script do Jogo

Use a biblioteca `socket.io-client` em seu script (Node.js ou similar):

```javascript
const io = require("socket.io-client");

// Conectar ao servidor
const socket = io("http://localhost:3000", {
  path: "/api/socketio",
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Conectado ao servidor!");
});

socket.on("disconnect", (reason) => {
  console.log("Desconectado:", reason);
});

// ===== ENVIANDO DADOS DE SINCRONIZAÇÃO =====

// Sincronizar players
socket.emit("sync:players", [
  { id: 1, name: "Player1", conn: "conn1", ipv4: "192.168.1.1" },
  { id: 2, name: "Player2", conn: "conn2", ipv4: "192.168.1.2" },
]);

// Sincronizar bans
socket.emit("sync:bans", [
  { id: 1, name: "BannedPlayer", reason: "cheating", time: new Date() },
]);

// Sincronizar mutes
socket.emit("sync:mutes", [
  { id: 1, name: "MutedPlayer", reason: "spam", time: new Date() },
]);

// Sincronizar stats
socket.emit("sync:stats", [
  {
    player_id: 1,
    room_id: 1,
    points: 100,
    elo: 1500,
    wins: 10,
    losses: 5,
    goals: 50,
    assists: 20,
  },
]);

// Sincronizar replays
socket.emit("sync:recs", [
  {
    id: 1,
    room_id: 1,
    player_id: 1,
    fileName: "replay_1.rec",
    matchInfo: "Match info here",
    createdAt: new Date(),
  },
]);

// ===== RECEBENDO COMMANDS DO DASHBOARD =====

// Quando o dashboard bannir um player
socket.on("command:ban", (data) => {
  console.log("Comando de ban recebido:", data);
  // Salve o ban no seu banco de dados do jogo
});

// Quando o dashboard desbanir
socket.on("command:unban", (data) => {
  console.log("Comando de unban recebido:", data);
});

// Quando o dashboard mutar
socket.on("command:mute", (data) => {
  console.log("Comando de mute recebido:", data);
});

// Quando o dashboard desmutar
socket.on("command:unmute", (data) => {
  console.log("Comando de unmute recebido:", data);
});

// Quando o dashboard setMod
socket.on("command:setMod", (data) => {
  console.log("Comando de setMod recebido:", data);
});

// Quando o dashboard setLegend
socket.on("command:setLegend", (data) => {
  console.log("Comando de setLegend recebido:", data);
});

// Quando o dashboard trocar senha
socket.on("command:changePassword", (data) => {
  console.log("Comando de changePassword recebido:", data);
});
```

## Fluxo de Operação

1. **Seu game server conecta** via Socket.io
2. **Seu game server envia dados** com `sync:*` events (players, bans, mutes, stats, recs)
3. **Dashboard lê dados** do MySQL via `/api/` routes
4. **Dashboard envia commands** via Socket.io (ban, mute, setMod, etc)
5. **Seu game server recebe commands** via `command:*` events e executa ações

## URLs Importantes

- **Socket.IO**: ws://localhost:3000/api/socketio
- **Check Status**: GET http://localhost:3000/api/socket/status
- **Players**: GET http://localhost:3000/api/players
- **Bans**: GET http://localhost:3000/api/bans
- **Mutes**: GET http://localhost:3000/api/mutes
- **Stats**: GET http://localhost:3000/api/public/stats
- **Recs**: GET http://localhost:3000/api/public/recs
