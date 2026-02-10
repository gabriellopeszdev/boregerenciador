const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Armazenamento em memória (pode ser substituído por Redis em produção)
const store = {
  players: [],
  bans: [],
  mutes: [],
  recs: [],
  stats: {},
};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socketio",
  });

  // Guardar referência global do io para uso nas APIs
  global.io = io;
  global.store = store;

  io.on("connection", (socket) => {
    console.log(`[socket.io] Cliente conectado: ${socket.id}`);

    // ===== EVENTOS DE SINCRONIZAÇÃO (recebe dados do jogo) =====
    
    socket.on("sync:players", (data) => {
      store.players = data;
      io.emit("update:players", store.players);
      console.log(`[socket.io] Players sincronizados: ${data.length}`);
    });

    socket.on("sync:bans", (data) => {
      store.bans = data;
      io.emit("update:bans", store.bans);
      console.log(`[socket.io] Bans sincronizados: ${data.length}`);
    });

    socket.on("sync:mutes", (data) => {
      store.mutes = data;
      io.emit("update:mutes", store.mutes);
      console.log(`[socket.io] Mutes sincronizados: ${data.length}`);
    });

    socket.on("sync:stats", (data) => {
      store.stats = data;
      io.emit("update:stats", store.stats);
      console.log(`[socket.io] Stats sincronizados`);
    });

    socket.on("sync:recs", (data) => {
      store.recs = data;
      io.emit("update:recs", store.recs);
      console.log(`[socket.io] Recs sincronizados: ${data.length}`);
    });

    // ===== EVENTOS DE AÇÃO (dashboard -> jogo) =====

    socket.on("action:ban", (data, callback) => {
      console.log(`[socket.io] Ação de ban:`, data);
      // Emite para todos os clientes (incluindo o jogo)
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

    // ===== EVENTOS DE QUERY (pegar dados do store) =====

    socket.on("query:players", (params, callback) => {
      const { page = 1, limit = 50, search = "" } = params || {};
      let filtered = store.players;
      
      if (search) {
        filtered = filtered.filter(p => 
          p.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);
      
      callback({ data: paginated, total, page, limit });
    });

    socket.on("query:bans", (params, callback) => {
      const { page = 1, limit = 50, search = "" } = params || {};
      let filtered = store.bans;
      
      if (search) {
        filtered = filtered.filter(b => 
          b.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);
      
      callback({ data: paginated, total, page, limit });
    });

    socket.on("query:mutes", (params, callback) => {
      const { page = 1, limit = 50, search = "" } = params || {};
      let filtered = store.mutes;
      
      if (search) {
        filtered = filtered.filter(m => 
          m.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);
      
      callback({ data: paginated, total, page, limit });
    });

    socket.on("query:stats", (params, callback) => {
      const { page = 1, limit = 50, search = "", sortBy = "points", sortOrder = "desc" } = params || {};
      
      // Se stats for um objeto simples (não array), retorna direto
      if (!Array.isArray(store.stats)) {
        callback({ data: store.stats, total: 1, page: 1, limit: 1, pages: 1 });
        return;
      }
      
      let filtered = [...store.stats];
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(s => 
          s.playerName?.toLowerCase().includes(searchLower) ||
          s.roomName?.toLowerCase().includes(searchLower)
        );
      }
      
      // Ordenação
      filtered.sort((a, b) => {
        const aVal = a[sortBy] ?? 0;
        const bVal = b[sortBy] ?? 0;
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
      
      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);
      
      callback({ data: paginated, total, page, limit, pages: Math.ceil(total / limit) });
    });

    socket.on("query:recs", (params, callback) => {
      const { page = 1, limit = 50, search = "", roomId } = params || {};
      
      let filtered = [...store.recs];
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(r => 
          r.fileName?.toLowerCase().includes(searchLower) ||
          r.matchInfo?.toLowerCase().includes(searchLower)
        );
      }
      
      if (roomId) {
        filtered = filtered.filter(r => String(r.roomId) === roomId);
      }
      
      // Ordenar por data (mais recente primeiro)
      filtered.sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      });
      
      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);
      
      callback({ data: paginated, total, page, limit, pages: Math.ceil(total / limit) });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket.io] Cliente desconectado: ${socket.id} (${reason})`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.IO path: /api/socketio`);
  });
});
