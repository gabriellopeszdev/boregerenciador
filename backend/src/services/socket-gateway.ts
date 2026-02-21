import type { Server as HttpServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { isDevelopment, logger } from "../lib/logger"
import { DiscordService } from "./discord-service"

export class SocketGateway {
  private readonly io: SocketIOServer
  private readonly discordService = new DiscordService()

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || "*",
        methods: ["GET", "POST"],
      },
      path: "/api/socketio",
    })

    this.bindEvents()
  }

  private bindEvents() {
    this.io.use(async (socket, next) => {
      try {
        const token = typeof socket.handshake.auth?.token === "string" ? socket.handshake.auth.token.trim() : ""

        if (!token) {
          return next(new Error("Não autenticado"))
        }

        const permissions = await this.discordService.checkPermissionsCached(token)
        if (!permissions.canManage) {
          return next(new Error("Sem permissão"))
        }

        socket.data.auth = permissions
        return next()
      } catch (error) {
        logger.warn({ err: error }, "socket_auth_failed")
        return next(new Error("Falha na autenticação"))
      }
    })

    this.io.on("connection", (socket) => {
      if (isDevelopment) {
        logger.debug({ socketId: socket.id, clients: this.getConnectedClientsCount() }, "socket_connected")
      }

      socket.on("disconnect", (reason) => {
        if (isDevelopment) {
          logger.debug({ socketId: socket.id, reason, clients: this.getConnectedClientsCount() }, "socket_disconnected")
        }
      })

      socket.on("sync:players", () => {})
      socket.on("sync:bans", () => {})
      socket.on("sync:mutes", () => {})
      socket.on("sync:stats", () => {})
      socket.on("sync:recs", () => {})

      socket.on("action:ban", (data, callback) => {
        this.emit("command:ban", data)
        if (callback) callback({ success: true })
      })

      socket.on("action:unban", (data, callback) => {
        this.emit("command:unban", data)
        if (callback) callback({ success: true })
      })

      socket.on("action:mute", (data, callback) => {
        this.emit("command:mute", data)
        if (callback) callback({ success: true })
      })

      socket.on("action:unmute", (data, callback) => {
        this.emit("command:unmute", data)
        if (callback) callback({ success: true })
      })

      socket.on("action:setMod", (data, callback) => {
        this.emit("command:setMod", data)
        if (callback) callback({ success: true })
      })

      socket.on("action:setLegend", (data, callback) => {
        this.emit("command:setLegend", data)
        if (callback) callback({ success: true })
      })

      socket.on("action:changePassword", (data, callback) => {
        this.emit("command:changePassword", data)
        if (callback) callback({ success: true })
      })
    })
  }

  emit(event: string, payload: unknown) {
    this.io.emit(event, payload)
  }

  getConnectedClientsCount() {
    return this.io.engine.clientsCount
  }
}
