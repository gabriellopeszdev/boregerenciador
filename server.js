const http = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url || '/', true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: { origin: process.env.SOCKET_CORS_ORIGIN || '*', methods: ['GET', 'POST'] },
    path: '/api/socketio',
  });

  global.io = io;

  io.on('connection', (socket) => {
    console.log(`[socket.io] Cliente conectado: ${socket.id}`);

    // Sync events (log only, data from MySQL)
    socket.on('sync:players', (data) => {
      console.log(`[socket.io] Players: ${data?.length || 0}`);
    });
    socket.on('sync:bans', (data) => {
      console.log(`[socket.io] Bans: ${data?.length || 0}`);
    });
    socket.on('sync:mutes', (data) => {
      console.log(`[socket.io] Mutes: ${data?.length || 0}`);
    });
    socket.on('sync:stats', (data) => {
      console.log(`[socket.io] Stats sincronizados`);
    });
    socket.on('sync:recs', (data) => {
      console.log(`[socket.io] Recs: ${data?.length || 0}`);
    });

    // Action events (emit to game)
    socket.on('action:ban', (data, callback) => {
      io.emit('command:ban', data);
      if (callback) callback({ success: true });
    });
    socket.on('action:unban', (data, callback) => {
      io.emit('command:unban', data);
      if (callback) callback({ success: true });
    });
    socket.on('action:mute', (data, callback) => {
      io.emit('command:mute', data);
      if (callback) callback({ success: true });
    });
    socket.on('action:unmute', (data, callback) => {
      io.emit('command:unmute', data);
      if (callback) callback({ success: true });
    });
    socket.on('action:setMod', (data, callback) => {
      io.emit('command:setMod', data);
      if (callback) callback({ success: true });
    });
    socket.on('action:setLegend', (data, callback) => {
      io.emit('command:setLegend', data);
      if (callback) callback({ success: true });
    });
    socket.on('action:changePassword', (data, callback) => {
      io.emit('command:changePassword', data);
      if (callback) callback({ success: true });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[socket.io] Cliente desconectado: ${socket.id} (${reason})`);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.IO path: /api/socketio`);
  });
});

