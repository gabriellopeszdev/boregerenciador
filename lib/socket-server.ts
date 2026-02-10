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
    console.log(`[socket.io] Cliente conectado: ${socket.id}`);

    // ===== EVENTOS DE SINCRONIZAÇÃO (recebe eventos do jogo, mas não armazena) =====

    socket.on("sync:players", (data) => {
      console.log(`[socket.io] Players sincronizados: ${data?.length || 0}`);
    });

    socket.on("sync:bans", (data) => {
      console.log(`[socket.io] Bans sincronizados: ${data?.length || 0}`);
    });

    socket.on("sync:mutes", (data) => {
      console.log(`[socket.io] Mutes sincronizados: ${data?.length || 0}`);
    });

    socket.on("sync:stats", (data) => {
      console.log(`[socket.io] Stats sincronizados`);
    });

    socket.on("sync:recs", (data) => {
      console.log(`[socket.io] Recs sincronizados: ${data?.length || 0}`);
    });

    // ===== EVENTOS DE AÇÃO (dashboard -> jogo) =====

    socket.on("action:ban", (data, callback) => {
      console.log(`[socket.io] Ação de ban:`, data);
      io.emit("command:ban", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:unban", (data, callback) => {
      console.log(`[socket.io] Ação de unban:`, data);
      io.emit("command:unban", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:mute", (data, callback) => {
      console.log(`[socket.io] Ação de mute:`, data);
      io.emit("command:mute", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:unmute", (data, callback) => {
      console.log(`[socket.io] Ação de unmute:`, data);
      io.emit("command:unmute", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:setMod", (data, callback) => {
      console.log(`[socket.io] Ação de setMod:`, data);
      io.emit("command:setMod", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:setLegend", (data, callback) => {
      console.log(`[socket.io] Ação de setLegend:`, data);
      io.emit("command:setLegend", data);
      if (callback) callback({ success: true });
    });

    socket.on("action:changePassword", (data, callback) => {
      console.log(`[socket.io] Ação de changePassword:`, data);
      io.emit("command:changePassword", data);
      if (callback) callback({ success: true });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket.io] Cliente desconectado: ${socket.id} (${reason})`);
    });
  });

  ioInstance = io;
  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return ioInstance;
}
