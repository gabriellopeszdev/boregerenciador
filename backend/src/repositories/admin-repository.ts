import { executeQuery } from "../../lib/database"
import type { Ban, Mute, Player } from "../../lib/types"

export class AdminRepository {
  async getPlayersPaginated(page: number, limit: number, searchTerm = ""): Promise<Player[]> {
    const offset = (page - 1) * limit
    let query = "SELECT id, name, conn, ipv4, vip, expired_vip, `mod`, password, dono, diretor, admin, gerente, loggedin FROM players"
    const params: any[] = []

    if (searchTerm) {
      query += " WHERE name LIKE ?"
      params.push(`%${searchTerm}%`)
    }

    query += ` ORDER BY name ASC LIMIT ${limit} OFFSET ${offset}`
    return executeQuery<Player>(query, params)
  }

  async getPlayerCount(searchTerm = ""): Promise<number> {
    let query = "SELECT COUNT(*) as count FROM players"
    const params: any[] = []

    if (searchTerm) {
      query += " WHERE name LIKE ?"
      params.push(`%${searchTerm}%`)
    }

    const result = await executeQuery<{ count: number }>(query, params)
    return result[0]?.count || 0
  }

  async getPlayerById(id: number): Promise<Player | null> {
    const players = await executeQuery<Player>("SELECT * FROM players WHERE id = ? LIMIT 1", [id])
    return players[0] || null
  }

  async getBansPaginated(page: number, limit: number, searchTerm = ""): Promise<Ban[]> {
    const offset = (page - 1) * limit
    let query = "SELECT * FROM bans"
    const params: any[] = []

    if (searchTerm) {
      query += " WHERE name LIKE ?"
      params.push(`%${searchTerm}%`)
    }

    query += ` ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`
    return executeQuery<Ban>(query, params)
  }

  async getBanCount(searchTerm = ""): Promise<number> {
    let query = "SELECT COUNT(*) as count FROM bans"
    const params: any[] = []

    if (searchTerm) {
      query += " WHERE name LIKE ?"
      params.push(`%${searchTerm}%`)
    }

    const result = await executeQuery<{ count: number }>(query, params)
    return result[0]?.count || 0
  }

  async createBan(payload: {
    name: string
    bannedBy: string
    reason: string
    conn: string
    ipv4: string
    auth: string
    time: Date
    room: number
  }): Promise<void> {
    await executeQuery(
      "INSERT INTO bans (name, banned_by, reason, conn, ipv4, auth, time, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [payload.name, payload.bannedBy, payload.reason, payload.conn, payload.ipv4, payload.auth, payload.time, payload.room]
    )
  }

  async deleteBan(banId: number): Promise<void> {
    await executeQuery("DELETE FROM bans WHERE id = ?", [banId])
  }

  async getMutesPaginated(page: number, limit: number, searchTerm = ""): Promise<Mute[]> {
    const offset = (page - 1) * limit
    let query = "SELECT * FROM mutes"
    const params: any[] = []

    if (searchTerm) {
      query += " WHERE name LIKE ?"
      params.push(`%${searchTerm}%`)
    }

    query += ` ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`
    return executeQuery<Mute>(query, params)
  }

  async getMuteCount(searchTerm = ""): Promise<number> {
    let query = "SELECT COUNT(*) as count FROM mutes"
    const params: any[] = []

    if (searchTerm) {
      query += " WHERE name LIKE ?"
      params.push(`%${searchTerm}%`)
    }

    const result = await executeQuery<{ count: number }>(query, params)
    return result[0]?.count || 0
  }

  async createMute(payload: {
    name: string
    mutedBy: string
    reason: string
    conn: string
    ipv4: string
    auth: string
    time: Date
    room: number
  }): Promise<void> {
    await executeQuery(
      "INSERT INTO mutes (name, muted_by, reason, conn, ipv4, auth, time, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [payload.name, payload.mutedBy, payload.reason, payload.conn, payload.ipv4, payload.auth, payload.time, payload.room]
    )
  }

  async deleteMute(muteId: number): Promise<void> {
    await executeQuery("DELETE FROM mutes WHERE id = ?", [muteId])
  }

  async setPlayerLegend(playerId: number, vipLevel: number, expirationDate: string): Promise<void> {
    await executeQuery("UPDATE players SET vip = ?, expired_vip = ? WHERE id = ?", [vipLevel, expirationDate, playerId])
  }

  async removePlayerLegend(playerId: number): Promise<void> {
    await executeQuery("UPDATE players SET vip = 0, expired_vip = NULL WHERE id = ?", [playerId])
  }

  async setPlayerMod(playerId: number, rooms: number[]): Promise<void> {
    await executeQuery("UPDATE players SET `mod` = ? WHERE id = ?", [JSON.stringify(rooms), playerId])
  }

  async removePlayerMod(playerId: number): Promise<void> {
    await executeQuery("UPDATE players SET `mod` = NULL WHERE id = ?", [playerId])
  }

  async updatePlayerPassword(playerId: number, hashedPassword: string): Promise<void> {
    await executeQuery("UPDATE players SET password = ? WHERE id = ?", [hashedPassword, playerId])
  }

  async resetAllVip(): Promise<void> {
    await executeQuery("UPDATE players SET vip = 0, expired_vip = NULL WHERE vip > 0", [])
  }

  async getStatsPaginated(
    page: number,
    limit: number,
    searchTerm = "",
    sortBy = "points",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit

    const allowedSortFields = ["points", "elo", "wins", "losses", "goals", "assists"]
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "points"
    const safeSortOrder = sortOrder === "asc" ? "ASC" : "DESC"

    let query = "SELECT s.elo, s.games, s.goals, s.assists, s.post_hits, s.ag, s.cs, s.wins, s.losses, s.goals_scored_match, s.points, s.block, s.ace, s.defesas, s.pc, s.time, s.rebounds, s.blocks, s.steals, s.passes, s.interceptions, s.disarms, s.hat_tricks, s.shots_on_goal, s.saves, s.penalty_champion, r.name as roomName, p.name as playerName FROM stats s LEFT JOIN players p ON s.player_id = p.id LEFT JOIN rooms r ON s.room_id = r.id"
    const params: any[] = []

    if (searchTerm) {
      query += " WHERE p.name LIKE ?"
      params.push(`%${searchTerm}%`)
    }

    query += ` ORDER BY s.${safeSortBy} ${safeSortOrder} LIMIT ${limit} OFFSET ${offset}`
    const data = await executeQuery(query, params)

    let countQuery = "SELECT COUNT(*) as count FROM stats s LEFT JOIN players p ON s.player_id = p.id LEFT JOIN rooms r ON s.room_id = r.id"
    const countParams: any[] = []

    if (searchTerm) {
      countQuery += " WHERE p.name LIKE ?"
      countParams.push(`%${searchTerm}%`)
    }

    const countResult = await executeQuery<{ count: number }>(countQuery, countParams)
    return { data, total: countResult[0]?.count || 0 }
  }

  async getRecsPaginated(page: number, limit: number, searchTerm = "", roomId?: string): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit
    let query = "SELECT id, roomId, fileName, matchInfo, createdAt FROM recs"
    const params: any[] = []
    const conditions: string[] = []

    if (searchTerm) {
      conditions.push("(fileName LIKE ? OR matchInfo LIKE ?)")
      params.push(`%${searchTerm}%`, `%${searchTerm}%`)
    }

    if (roomId) {
      conditions.push("roomId = ?")
      params.push(roomId)
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    query += ` ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`
    const data = await executeQuery(query, params)

    let countQuery = "SELECT COUNT(*) as count FROM recs"
    const countParams: any[] = []
    const countConditions: string[] = []

    if (searchTerm) {
      countConditions.push("(fileName LIKE ? OR matchInfo LIKE ?)")
      countParams.push(`%${searchTerm}%`, `%${searchTerm}%`)
    }

    if (roomId) {
      countConditions.push("roomId = ?")
      countParams.push(roomId)
    }

    if (countConditions.length > 0) {
      countQuery += " WHERE " + countConditions.join(" AND ")
    }

    const countResult = await executeQuery<{ count: number }>(countQuery, countParams)
    return { data, total: countResult[0]?.count || 0 }
  }

  async getRecById(id: string): Promise<any | null> {
    const recs = await executeQuery("SELECT * FROM recs WHERE id = ? LIMIT 1", [id])
    return recs[0] || null
  }
}
