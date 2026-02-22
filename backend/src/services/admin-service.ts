import { encryptPassword } from "../../../lib/encryption"
import { AdminRepository } from "../repositories/admin-repository"
import type { SocketGateway } from "./socket-gateway"

export class AdminService {
  constructor(
    private readonly repository: AdminRepository,
    private readonly socketGateway: SocketGateway
  ) {}

  async listPlayers(page: number, limit: number, searchTerm: string) {
    const [players, totalCount] = await Promise.all([
      this.repository.getPlayersPaginated(page, limit, searchTerm),
      this.repository.getPlayerCount(searchTerm),
    ])

    return { players, totalCount }
  }

  async listBans(page: number, limit: number, searchTerm: string) {
    const [data, total] = await Promise.all([
      this.repository.getBansPaginated(page, limit, searchTerm),
      this.repository.getBanCount(searchTerm),
    ])

    return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
  }

  async createBan(payload: {
    name: string
    reason: string
    conn?: string
    ipv4?: string
    room?: number
    staffName: string
    time: string
  }) {
    const parsedDate = new Date(payload.time)
    await this.repository.createBan({
      name: payload.name,
      reason: payload.reason,
      bannedBy: payload.staffName,
      conn: payload.conn || "",
      ipv4: payload.ipv4 || "",
      auth: "",
      time: parsedDate,
      room: payload.room || 0,
    })

    this.socketGateway.emit("command:ban", {
      name: payload.name,
      bannedBy: payload.staffName,
      reason: payload.reason,
      conn: payload.conn || "",
      ipv4: payload.ipv4 || "",
      auth: "",
      time: parsedDate.toISOString(),
      room: payload.room || 0,
    })
  }

  async unban(banId: number) {
    await this.repository.deleteBan(banId)
    this.socketGateway.emit("command:unban", { id: banId })
  }

  async listMutes(page: number, limit: number, searchTerm: string) {
    const [data, total] = await Promise.all([
      this.repository.getMutesPaginated(page, limit, searchTerm),
      this.repository.getMuteCount(searchTerm),
    ])

    return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
  }

  async createMute(payload: {
    name: string
    reason: string
    conn?: string
    ipv4?: string
    room?: number
    staffName: string
    time: string
  }) {
    const parsedDate = new Date(payload.time)
    await this.repository.createMute({
      name: payload.name,
      reason: payload.reason,
      mutedBy: payload.staffName,
      conn: payload.conn || "",
      ipv4: payload.ipv4 || "",
      auth: "",
      time: parsedDate,
      room: payload.room || 0,
    })

    this.socketGateway.emit("command:mute", {
      name: payload.name,
      mutedBy: payload.staffName,
      reason: payload.reason,
      conn: payload.conn || "",
      ipv4: payload.ipv4 || "",
      auth: "",
      time: parsedDate.toISOString(),
      room: payload.room || 0,
    })
  }

  async unmute(muteId: number) {
    await this.repository.deleteMute(muteId)
    this.socketGateway.emit("command:unmute", { id: muteId })
  }

  async updateLegend(playerId: number, action: "add" | "remove", vipLevel?: number, expirationDate?: string) {
    const target = await this.repository.getPlayerById(playerId)
    if (!target) {
      throw new Error("PLAYER_NOT_FOUND")
    }

    if (action === "add") {
      if (!expirationDate || (vipLevel !== 3 && vipLevel !== 4)) {
        throw new Error("INVALID_LEGEND_PAYLOAD")
      }

      await this.repository.setPlayerLegend(playerId, vipLevel, expirationDate)
      this.socketGateway.emit("command:setLegend", { playerId, vipLevel, expirationDate })
      return
    }

    await this.repository.removePlayerLegend(playerId)
    this.socketGateway.emit("command:removeLegend", { playerId })
  }

  async updateMod(playerId: number, action: "add" | "remove", rooms?: number[]) {
    const target = await this.repository.getPlayerById(playerId)
    if (!target) {
      throw new Error("PLAYER_NOT_FOUND")
    }

    if (action === "add") {
      if (!rooms || rooms.length === 0) {
        throw new Error("INVALID_ROOMS")
      }

      await this.repository.setPlayerMod(playerId, rooms)
      this.socketGateway.emit("command:setMod", { playerId, rooms })
      return
    }

    await this.repository.removePlayerMod(playerId)
    this.socketGateway.emit("command:removeMod", { playerId })
  }

  async updatePassword(playerId: number, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("INVALID_PASSWORD")
    }

    const player = await this.repository.getPlayerById(playerId)
    if (!player) {
      throw new Error("PLAYER_NOT_FOUND")
    }

    const encryptedPassword = await encryptPassword(newPassword)
    await this.repository.updatePlayerPassword(playerId, encryptedPassword)

    this.socketGateway.emit("command:changePassword", { playerId, hashedPassword: encryptedPassword })
  }

  async getStats(page: number, limit: number, search: string, sortBy: string, sortOrder: "asc" | "desc") {
    const { data, total } = await this.repository.getStatsPaginated(page, limit, search, sortBy, sortOrder)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getRecs(page: number, limit: number, search: string, roomId?: string) {
    const { data, total } = await this.repository.getRecsPaginated(page, limit, search, roomId)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  getRecById(id: string) {
    return this.repository.getRecById(id)
  }

  async resetVip() {
    await this.repository.resetAllVip()
    this.socketGateway.emit("command:resetAllVip", {})
  }
}
