import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let ioInstance: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  if (ioInstance) {
    return ioInstance;
  }

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socketio",
  });

  // Guardar referência global do io para uso nas APIs
  (global as any).io = io;

  io.on("connection", (socket: Socket) => {
    // ===== EVENTOS DE SINCRONIZAÇÃO (recebe eventos do jogo, mas não armazena) =====

    socket.on("sync:players", () => {});
    socket.on("sync:bans", () => {});
    socket.on("sync:mutes", () => {});
    socket.on("sync:stats", () => {});
    socket.on("sync:recs", () => {});

    // ===== EVENTOS DE AÇÃO (dashboard -> jogo) =====

    socket.on("action:ban", (data, callback) => {
      io.emit("command:ban", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:unban", (data, callback) => {
      io.emit("command:unban", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:mute", (data, callback) => {
      io.emit("command:mute", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:unmute", (data, callback) => {
      io.emit("command:unmute", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:setMod", (data, callback) => {
      io.emit("command:setMod", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:setLegend", (data, callback) => {
      io.emit("command:setLegend", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:changePassword", (data, callback) => {
      io.emit("command:changePassword", data);
      if (callback) callback({ success: true });
    });

    socket.on("disconnect", () => {});
  });

  ioInstance = io;
  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return ioInstance;
}
