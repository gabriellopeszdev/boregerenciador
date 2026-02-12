'use client';

import { useEffect, useState } from 'react';
import { getClientSocket } from '@/lib/socket';

export default function SocketStatusPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = getClientSocket();

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketId(socket.id || null);
      console.log('Cliente conectado ao Socket.io:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setSocketId(null);
    });

    // Fetch server status
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/socket/status');
        const data = await res.json();
        setServerStatus(data);
      } catch (error) {
        console.error('Erro ao buscar status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-primary">Socket.IO Status</h1>

        {/* Client Status */}
        <div className="bg-card rounded-lg shadow p-6 mb-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 text-primary">Cliente</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`px-3 py-1 rounded-full font-semibold ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID do Socket:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm">{socketId || '-'}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Path:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm">/api/socketio</code>
            </div>
          </div>
        </div>

        {/* Server Status */}
        <div className="bg-card rounded-lg shadow p-6 mb-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 text-primary">Servidor</h2>
          {loading ? (
            <div className="text-muted-foreground">Carregando...</div>
          ) : serverStatus ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`px-3 py-1 rounded-full font-semibold ${serverStatus.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {serverStatus.status === 'connected' ? 'Rodando' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Clientes Conectados:</span>
                <span className="font-semibold">{serverStatus.connectedClients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Path:</span>
                <code className="bg-muted px-2 py-1 rounded text-sm">{serverStatus.socketPath}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Timestamp:</span>
                <code className="bg-muted px-2 py-1 rounded text-sm text-xs">
                  {new Date(serverStatus.timestamp).toLocaleString()}
                </code>
              </div>
            </div>
          ) : (
            <div className="text-red-400">Erro ao buscar status do servidor</div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-card rounded-lg shadow p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4 text-primary">Como Conectar seu Game Server</h2>
          <p className="text-muted-foreground mb-4">
            Seu game server deve se conectar via Socket.io e enviar/ouvir eventos.
          </p>
          <pre className="bg-muted p-4 rounded overflow-x-auto text-sm mb-4">
{`const io = require("socket.io-client");

const socket = io("http://localhost:3000", {
  path: "/api/socketio",
  transports: ["websocket", "polling"],
});

// Sincronizar dados
socket.emit("sync:players", playersArray);
socket.emit("sync:bans", bansArray);
socket.emit("sync:mutes", mutesArray);

// Ouvir commands do dashboard
socket.on("command:ban", (data) => {
  console.log("Ban recebido:", data);
});`}
          </pre>

          <a
            href="./WEBSOCKET_INTEGRATION.md"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded font-semibold hover:bg-primary/90 transition-all"
          >
            📖 Documentação Completa
          </a>
        </div>
      </div>
    </div>
  );
}
