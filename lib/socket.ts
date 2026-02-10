import { io as ioClient, Socket } from "socket.io-client";
import type { Server } from "socket.io";

// Tipos globais para o servidor
declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
  // eslint-disable-next-line no-var
  var store: {
    players: any[];
    bans: any[];
    mutes: any[];
    recs: any[];
    stats: Record<string, any>;
  } | undefined;
}

// ===== CLIENTE SOCKET.IO (para uso no frontend) =====

let clientSocket: Socket | null = null;

export function getClientSocket(): Socket {
  if (!clientSocket) {
    const url = typeof window !== "undefined" 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
    
    clientSocket = ioClient(url, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    clientSocket.on("connect", () => {
      console.log("[socket.io client] Conectado:", clientSocket?.id);
    });

    clientSocket.on("disconnect", (reason) => {
      console.log("[socket.io client] Desconectado:", reason);
    });

    clientSocket.on("connect_error", (error) => {
      console.error("[socket.io client] Erro de conexão:", error.message);
    });
  }

  return clientSocket;
}

export function disconnectClientSocket(): void {
  if (clientSocket) {
    clientSocket.disconnect();
    clientSocket = null;
  }
}

// ===== HELPERS PARA QUERIES (substituem executeQuery) =====

export function emitWithAck<T = any>(
  event: string, 
  data?: any, 
  timeout = 10000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const socket = getClientSocket();
    
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: ${event}`));
    }, timeout);

    socket.emit(event, data, (response: T) => {
      clearTimeout(timer);
      resolve(response);
    });
  });
}

// ===== FUNÇÕES DE QUERY (compatíveis com a interface antiga) =====

export async function queryPlayers(params?: { page?: number; limit?: number; search?: string }) {
  return emitWithAck<{ data: any[]; total: number }>("query:players", params);
}

export async function queryBans(params?: { page?: number; limit?: number; search?: string }) {
  return emitWithAck<{ data: any[]; total: number }>("query:bans", params);
}

export async function queryMutes(params?: { page?: number; limit?: number; search?: string }) {
  return emitWithAck<{ data: any[]; total: number }>("query:mutes", params);
}

export async function queryStats() {
  return emitWithAck<{ data: any }>("query:stats");
}

export async function queryRecs(params?: { limit?: number }) {
  return emitWithAck<{ data: any[] }>("query:recs", params);
}

// ===== FUNÇÕES DE AÇÃO =====

export async function actionBan(data: { 
  name: string; 
  reason: string; 
  bannedBy: string;
  duration?: number;
}) {
  return emitWithAck("action:ban", data);
}

export async function actionUnban(data: { id: number | string }) {
  return emitWithAck("action:unban", data);
}

export async function actionMute(data: { 
  name: string; 
  reason: string; 
  mutedBy: string;
  duration?: number;
}) {
  return emitWithAck("action:mute", data);
}

export async function actionUnmute(data: { id: number | string }) {
  return emitWithAck("action:unmute", data);
}

export async function actionSetMod(data: { playerId: number; isMod: boolean }) {
  return emitWithAck("action:setMod", data);
}

export async function actionSetLegend(data: { playerId: number; isLegend: boolean }) {
  return emitWithAck("action:setLegend", data);
}

export async function actionChangePassword(data: { playerId: number; newPassword: string }) {
  return emitWithAck("action:changePassword", data);
}

// ===== HELPERS PARA O SERVIDOR (para uso nas API routes) =====

export function getServerIO(): Server | undefined {
  return global.io;
}

export function getStore() {
  return global.store || {
    players: [],
    bans: [],
    mutes: [],
    recs: [],
    stats: {},
  };
}

// Funções para acesso direto ao store no servidor (para API routes)
export function getPlayersFromStore(params?: { page?: number; limit?: number; search?: string }) {
  const store = getStore();
  const { page = 1, limit = 50, search = "" } = params || {};
  
  let filtered = store.players;
  if (search) {
    filtered = filtered.filter((p: any) => 
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  
  return { data: paginated, total, page, limit };
}

export function getBansFromStore(params?: { page?: number; limit?: number; search?: string }) {
  const store = getStore();
  const { page = 1, limit = 50, search = "" } = params || {};
  
  let filtered = store.bans;
  if (search) {
    filtered = filtered.filter((b: any) => 
      b.name?.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  
  return { data: paginated, total, page, limit };
}

export function getMutesFromStore(params?: { page?: number; limit?: number; search?: string }) {
  const store = getStore();
  const { page = 1, limit = 50, search = "" } = params || {};
  
  let filtered = store.mutes;
  if (search) {
    filtered = filtered.filter((m: any) => 
      m.name?.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  
  return { data: paginated, total, page, limit };
}

export function getStatsFromStore(params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
  const store = getStore();
  const { page = 1, limit = 50, search = "", sortBy = "points", sortOrder = "desc" } = params || {};
  
  // Se stats for um objeto simples (não array), retorna direto
  if (!Array.isArray(store.stats)) {
    return { data: store.stats, total: 1, page: 1, limit: 1 };
  }
  
  let filtered = [...store.stats];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((s: any) => 
      s.playerName?.toLowerCase().includes(searchLower) ||
      s.roomName?.toLowerCase().includes(searchLower)
    );
  }
  
  // Ordenação
  filtered.sort((a: any, b: any) => {
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
  
  return { data: paginated, total, page, limit, pages: Math.ceil(total / limit) };
}

export function getRecsFromStore(params?: { page?: number; limit?: number; search?: string; roomId?: string }) {
  const store = getStore();
  const { page = 1, limit = 50, search = "", roomId } = params || {};
  
  let filtered = [...store.recs];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((r: any) => 
      r.fileName?.toLowerCase().includes(searchLower) ||
      r.matchInfo?.toLowerCase().includes(searchLower)
    );
  }
  
  if (roomId) {
    filtered = filtered.filter((r: any) => String(r.roomId) === roomId);
  }
  
  // Ordenar por data (mais recente primeiro)
  filtered.sort((a: any, b: any) => {
    const aDate = new Date(a.createdAt || 0).getTime();
    const bDate = new Date(b.createdAt || 0).getTime();
    return bDate - aDate;
  });
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  
  return { data: paginated, total, page, limit, pages: Math.ceil(total / limit) };
}
