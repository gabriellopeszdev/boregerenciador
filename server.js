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
    // Sync events (data from MySQL, no logging needed)
    socket.on('sync:players', () => {});
    socket.on('sync:bans', () => {});
    socket.on('sync:mutes', () => {});
    socket.on('sync:stats', () => {});
    socket.on('sync:recs', () => {});

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

    socket.on('disconnect', () => {});
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

