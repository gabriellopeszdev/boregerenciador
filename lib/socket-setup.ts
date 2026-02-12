import { createServer } from "http";
import { parse } from "url";
import { Server } from "socket.io";
import next from "next";

let ioServer: Server | null = null;
let isInitialized = false;

export async function setupSocketIO() {
  if (isInitialized) return;

  try {
    const dev = process.env.NODE_ENV !== "production";
    const hostname = process.env.HOSTNAME || "localhost";
    const port = parseInt(process.env.PORT || "3000", 10);

    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    await app.prepare();

    const httpServer = createServer((req, res) => {
      const parsedUrl = parse(req.url || "/", true);
      handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
      },
      path: "/api/socketio",
    });

    ioServer = io;

    // Guardar referência global do io para uso nas APIs
    (global as any).io = io;

    io.on("connection", (socket) => {
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

    const port_num = port;
    httpServer.listen(port_num, () => {
      console.log(`> Ready on http://localhost:${port_num}`);
    });

    isInitialized = true;
  } catch (error) {
    console.error("[socket-setup] Erro ao inicializar Socket.io:", error);
    throw error;
  }
}

export function getIO(): Server | null {
  return ioServer;
}
