"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { getSession } from "next-auth/react"

type SocketStatus = "connecting" | "connected" | "disconnected" | "error"

interface UseSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
}

// Singleton do socket para evitar múltiplas conexões
let socketInstance: Socket | null = null

function getSocket(): Socket {
  if (!socketInstance) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL
      || process.env.NEXT_PUBLIC_BACKEND_URL
      || (typeof window !== "undefined" ? window.location.origin : "http://localhost:4000")
    
    socketInstance = io(url, {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: async (callback) => {
        const session = await getSession()
        callback({ token: session?.accessToken || "" })
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: false,
    })
  }
  return socketInstance
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options
  const [status, setStatus] = useState<SocketStatus>("disconnected")
  const [error, setError] = useState<Error | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    const handleConnect = () => {
      setStatus("connected")
      setError(null)
    }

    const handleDisconnect = () => {
      setStatus("disconnected")
    }

    const handleConnectError = (err: Error) => {
      setStatus("error")
      setError(err)
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("connect_error", handleConnectError)

    if (autoConnect && !socket.connected) {
      setStatus("connecting")
      socket.connect()
    }

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("connect_error", handleConnectError)
    }
  }, [autoConnect])

  const connect = useCallback(() => {
    const socket = socketRef.current
    if (socket && !socket.connected) {
      setStatus("connecting")
      socket.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    const socket = socketRef.current
    if (socket?.connected) {
      socket.disconnect()
    }
  }, [])

  return {
    socket: socketRef.current,
    status,
    error,
    isConnected: status === "connected",
    connect,
    disconnect,
  }
}

// Hook para escutar atualizações de players em tempo real
export function usePlayersRealtime(initialPlayers: any[] = []) {
  const [players, setPlayers] = useState(initialPlayers)
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleUpdate = (data: any[]) => {
      setPlayers(data)
    }

    socket.on("update:players", handleUpdate)

    return () => {
      socket.off("update:players", handleUpdate)
    }
  }, [socket])

  return { players, setPlayers, isConnected }
}

// Hook para escutar atualizações de bans em tempo real
export function useBansRealtime(initialBans: any[] = []) {
  const [bans, setBans] = useState(initialBans)
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleUpdate = (data: any[]) => {
      setBans(data)
    }

    socket.on("update:bans", handleUpdate)

    return () => {
      socket.off("update:bans", handleUpdate)
    }
  }, [socket])

  return { bans, setBans, isConnected }
}

// Hook para escutar atualizações de mutes em tempo real
export function useMutesRealtime(initialMutes: any[] = []) {
  const [mutes, setMutes] = useState(initialMutes)
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleUpdate = (data: any[]) => {
      setMutes(data)
    }

    socket.on("update:mutes", handleUpdate)

    return () => {
      socket.off("update:mutes", handleUpdate)
    }
  }, [socket])

  return { mutes, setMutes, isConnected }
}

// Hook para escutar atualizações de stats em tempo real
export function useStatsRealtime(initialStats: any = {}) {
  const [stats, setStats] = useState(initialStats)
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleUpdate = (data: any) => {
      setStats(data)
    }

    socket.on("update:stats", handleUpdate)

    return () => {
      socket.off("update:stats", handleUpdate)
    }
  }, [socket])

  return { stats, setStats, isConnected }
}

// Funções para emitir ações via socket (alternativa às chamadas de API)
export function useSocketActions() {
  const { socket, isConnected } = useSocket()

  const emit = useCallback((event: string, data?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error("Socket não conectado"))
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error("Timeout"))
      }, 10000)

      socket.emit(event, data, (response: any) => {
        clearTimeout(timeout)
        resolve(response)
      })
    })
  }, [socket, isConnected])

  const ban = useCallback((data: { name: string; reason: string; bannedBy: string }) => {
    return emit("action:ban", data)
  }, [emit])

  const unban = useCallback((id: number | string) => {
    return emit("action:unban", { id })
  }, [emit])

  const mute = useCallback((data: { name: string; reason: string; mutedBy: string }) => {
    return emit("action:mute", data)
  }, [emit])

  const unmute = useCallback((id: number | string) => {
    return emit("action:unmute", { id })
  }, [emit])

  const setMod = useCallback((playerId: number, isMod: boolean) => {
    return emit("action:setMod", { playerId, isMod })
  }, [emit])

  const setLegend = useCallback((playerId: number, isLegend: boolean) => {
    return emit("action:setLegend", { playerId, isLegend })
  }, [emit])

  return {
    isConnected,
    emit,
    ban,
    unban,
    mute,
    unmute,
    setMod,
    setLegend,
  }
}
