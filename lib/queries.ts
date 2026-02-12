import { executeQuery } from "./database"
import { getServerIO } from "./socket"
import type { Player, Ban, Mute } from "./types"

// ===== FUNÇÕES DE LEITURA (usam MySQL) =====

export async function getPlayerByName(name: string): Promise<Player | null> {
  const players = await executeQuery<Player>("SELECT * FROM players WHERE name = ? LIMIT 1", [name])
  return players[0] || null
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const players = await executeQuery<Player>("SELECT * FROM players WHERE id = ? LIMIT 1", [id])
  return players[0] || null
}

export async function getAllPlayers(): Promise<Player[]> {
  return executeQuery<Player>("SELECT * FROM players ORDER BY name ASC", [])
}

export async function getBans(): Promise<Ban[]> {
  return executeQuery<Ban>("SELECT * FROM bans ORDER BY time DESC", [])
}

export async function getBansPaginated(page: number, limit: number, searchTerm: string = ""): Promise<Ban[]> {
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

export async function getBanCount(searchTerm: string = ""): Promise<number> {
  let query = "SELECT COUNT(*) as count FROM bans"
  const params: any[] = []

  if (searchTerm) {
    query += " WHERE name LIKE ?"
    params.push(`%${searchTerm}%`)
  }

  const result = await executeQuery<{ count: number }>(query, params)
  return result[0].count
}

export async function getMutes(): Promise<Mute[]> {
  return executeQuery<Mute>("SELECT * FROM mutes ORDER BY time DESC", [])
}

export async function getMutesPaginated(page: number, limit: number, searchTerm: string = ""): Promise<Mute[]> {
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

export async function getMuteCount(searchTerm: string = ""): Promise<number> {
  let query = "SELECT COUNT(*) as count FROM mutes"
  const params: any[] = []

  if (searchTerm) {
    query += " WHERE name LIKE ?"
    params.push(`%${searchTerm}%`)
  }

  const result = await executeQuery<{ count: number }>(query, params)
  return result[0].count
}

export async function getPlayersPaginated(page: number, limit: number, searchTerm: string = ""): Promise<Player[]> {
  const offset = (page - 1) * limit
  let query = "SELECT id, name, conn, ipv4, vip, expired_vip, `mod`, password, dono, diretor, admin, gerente FROM players"
  const params: any[] = []

  if (searchTerm) {
    query += " WHERE name LIKE ?"
    params.push(`%${searchTerm}%`)
  }

  query += ` ORDER BY name ASC LIMIT ${limit} OFFSET ${offset}`
  return executeQuery<Player>(query, params)
}

export async function getPlayerCount(searchTerm: string = ""): Promise<number> {
  let query = "SELECT COUNT(*) as count FROM players"
  const params: any[] = []

  if (searchTerm) {
    query += " WHERE name LIKE ?"
    params.push(`%${searchTerm}%`)
  }

  const result = await executeQuery<{ count: number }>(query, params)
  return result[0].count
}

// ===== FUNÇÕES DE STATS E RECS (usam MySQL) =====

export async function getStatsPaginated(
  page: number,
  limit: number,
  searchTerm: string = "",
  sortBy: string = "points",
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
  const total = countResult[0]?.count || 0
  
  return { data, total }
}

export async function getRecsPaginated(
  page: number,
  limit: number,
  searchTerm: string = "",
  roomId?: string
): Promise<{ data: any[]; total: number }> {
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
  const total = countResult[0]?.count || 0
  
  return { data, total }
}

export async function getRecById(id: string): Promise<any | null> {
  const recs = await executeQuery("SELECT * FROM recs WHERE id = ? LIMIT 1", [id])
  return recs[0] || null
}

// ===== FUNÇÕES DE COMANDO (emitem via Socket.io) =====

function emitToGame(event: string, data: any): void {
  const io = getServerIO()
  if (io) {
    io.emit(event, data)
  }
}

export async function banPlayer(
  name: string,
  bannedBy: string,
  reason: string,
  conn: string,
  ipv4: string,
  auth: string,
  time: Date,
  room = 0,
): Promise<void> {
  await executeQuery(
    "INSERT INTO bans (name, banned_by, reason, conn, ipv4, auth, time, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, bannedBy, reason, conn, ipv4, auth, time, room]
  )
  emitToGame("command:ban", { name, bannedBy, reason, conn, ipv4, auth, time: time.toISOString(), room })
}

export async function unbanPlayer(banId: number): Promise<void> {
  await executeQuery("DELETE FROM bans WHERE id = ?", [banId])
  emitToGame("command:unban", { id: banId })
}

export async function mutePlayer(
  name: string,
  mutedBy: string,
  reason: string,
  conn: string,
  ipv4: string,
  auth: string,
  time: Date,
  room = 0,
): Promise<void> {
  await executeQuery(
    "INSERT INTO mutes (name, muted_by, reason, conn, ipv4, auth, time, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, mutedBy, reason, conn, ipv4, auth, time, room]
  )
  emitToGame("command:mute", { name, mutedBy, reason, conn, ipv4, auth, time: time.toISOString(), room })
}

export async function unmutePlayer(muteId: number): Promise<void> {
  await executeQuery("DELETE FROM mutes WHERE id = ?", [muteId])
  emitToGame("command:unmute", { id: muteId })
}

export async function setPlayerLegend(playerId: number, vipLevel: number, expirationDate: string): Promise<void> {
  await executeQuery(
    "UPDATE players SET vip = ?, expired_vip = ? WHERE id = ?",
    [vipLevel, expirationDate, playerId]
  )
  emitToGame("command:setLegend", { playerId, vipLevel, expirationDate })
}

export async function removePlayerLegend(playerId: number): Promise<void> {
  await executeQuery(
    "UPDATE players SET vip = 0, expired_vip = NULL WHERE id = ?",
    [playerId]
  )
  emitToGame("command:removeLegend", { playerId })
}

export async function setPlayerMod(playerId: number, rooms: number[]): Promise<void> {
  const roomsJson = JSON.stringify(rooms)
  await executeQuery(
    "UPDATE players SET `mod` = ? WHERE id = ?",
    [roomsJson, playerId]
  )
  emitToGame("command:setMod", { playerId, rooms })
}

export async function removePlayerMod(playerId: number): Promise<void> {
  await executeQuery(
    "UPDATE players SET `mod` = NULL WHERE id = ?",
    [playerId]
  )
  emitToGame("command:removeMod", { playerId })
}

export async function resetAllVip(): Promise<void> {
  await executeQuery(
    "UPDATE players SET vip = 0, expired_vip = NULL WHERE vip > 0",
    []
  )
  emitToGame("command:resetAllVip", {})
}

export async function updatePlayerPassword(playerId: number, hashedPassword: string): Promise<void> {
  await executeQuery(
    "UPDATE players SET password = ? WHERE id = ?",
    [hashedPassword, playerId]
  )
  emitToGame("command:changePassword", { playerId, hashedPassword })
}
