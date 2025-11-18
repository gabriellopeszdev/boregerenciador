import { executeQuery } from "./database"
import type { Player, Ban, Mute } from "./types"

export async function getPlayerByName(name: string): Promise<Player | null> {
  const players = await executeQuery<Player>("SELECT * FROM players WHERE name = ? LIMIT 1", [name])
  return players[0] || null
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const players = await executeQuery<Player>("SELECT * FROM players WHERE id = ? LIMIT 1", [id])
  return players[0] || null
}

export async function getAllPlayers(): Promise<Player[]> {
  return executeQuery<Player>("SELECT * FROM players ORDER BY name ASC", []);
}


export async function getBans(p0?: boolean): Promise<Ban[]> { 
  return executeQuery<Ban>("SELECT * FROM bans ORDER BY time DESC", []);
}

export async function getBansPaginated(
  page: number,
  limit: number,
  searchTerm: string = ""
): Promise<Ban[]> {
  const offset = (page - 1) * limit;
  let query = "SELECT * FROM bans";
  const params = [];

  if (searchTerm) {
    query += " WHERE name LIKE ?";
    params.push(`%${searchTerm}%`);
  }

  query += ` ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`;

  return executeQuery<Ban>(query, params);
}

export async function getBanCount(searchTerm: string = ""): Promise<number> {
  let query = "SELECT COUNT(*) as count FROM bans";
  const params = [];

  if (searchTerm) {
    query += " WHERE name LIKE ?";
    params.push(`%${searchTerm}%`);
  }

  const result = await executeQuery<{ count: number }>(query, params);
  return result[0].count;
}export async function getMutes(): Promise<Mute[]> {
  return executeQuery<Mute>("SELECT * FROM mutes ORDER BY time DESC", []);
}

export async function getMutesPaginated(
  page: number,
  limit: number,
  searchTerm: string = ""
): Promise<Mute[]> {
  const offset = (page - 1) * limit;
  let query = "SELECT * FROM mutes";
  const params = [];

  if (searchTerm) {
    query += " WHERE name LIKE ?";
    params.push(`%${searchTerm}%`);
  }

  query += ` ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`;

  return executeQuery<Mute>(query, params);
}

export async function getMuteCount(searchTerm: string = ""): Promise<number> {
  let query = "SELECT COUNT(*) as count FROM mutes";
  const params = [];

  if (searchTerm) {
    query += " WHERE name LIKE ?";
    params.push(`%${searchTerm}%`);
  }

  const result = await executeQuery<{ count: number }>(query, params);
  return result[0].count;
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
    "INSERT INTO bans (name, time, reason, banned_by, conn, ipv4, auth, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, time, reason, bannedBy, conn, ipv4, auth, room],
  )
}

export async function unbanPlayer(banId: number): Promise<void> {
  await executeQuery("DELETE FROM bans WHERE id = ?", [banId])
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
    "INSERT INTO mutes (name, time, reason, muted_by, conn, ipv4, auth, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, time, reason, mutedBy, conn, ipv4, auth, room],
  )
}

export async function unmutePlayer(muteId: number): Promise<void> {
  await executeQuery("DELETE FROM mutes WHERE id = ?", [muteId])
}

export async function setPlayerLegend(playerId: number, vipLevel: number, expirationDate: string): Promise<void> {
  // vipLevel: 3 => VIP, 4 => LEGEND
  await executeQuery(
    "UPDATE players SET vip = ?, expired_vip = ? WHERE id = ?",
    [vipLevel, expirationDate, playerId]
  )
}

export async function removePlayerLegend(playerId: number): Promise<void> {
  await executeQuery(
    "UPDATE players SET vip = 0, expired_vip = NULL WHERE id = ?",
    [playerId]
  )
}

export async function setPlayerMod(playerId: number, rooms: number[]): Promise<void> {
  const roomsJson = JSON.stringify(rooms)
  await executeQuery(
    "UPDATE players SET `mod` = ? WHERE id = ?",
    [roomsJson, playerId]
  )
}

export async function removePlayerMod(playerId: number): Promise<void> {
  await executeQuery(
    "UPDATE players SET `mod` = NULL WHERE id = ?",
    [playerId]
  )
}

export async function resetAllVip(): Promise<void> {
  // Reseta vip e expired_vip para todos os players
  await executeQuery("UPDATE players SET vip = 0, expired_vip = NULL", [])
}

export async function getPlayersPaginated(
  page: number,
  limit: number,
  searchTerm: string = ""
): Promise<Player[]> {
  const offset = (page - 1) * limit;
  let query = "SELECT * FROM players";
  const params = [];

  if (searchTerm) {
    query += " WHERE name LIKE ?";
    params.push(`%${searchTerm}%`);
  }

  query += ` ORDER BY name ASC LIMIT ${limit} OFFSET ${offset}`;

  return executeQuery<Player>(query, params);
}

export async function getPlayerCount(searchTerm: string = ""): Promise<number> {
  let query = "SELECT COUNT(*) as count FROM players";
  const params = [];

  if (searchTerm) {
    query += " WHERE name LIKE ?";
    params.push(`%${searchTerm}%`);
  }

  const result = await executeQuery<{ count: number }>(query, params);
  return result[0].count;
}