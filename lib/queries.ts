import { executeQuery } from "./database"
import type { Player, Ban, Mute } from "./types"

export async function getPlayerByName(name: string): Promise<Player | null> {
  const players = await executeQuery<Player>("SELECT * FROM players WHERE name = ? LIMIT 1", [name])
  return players[0] || null
}

export async function getAllPlayers(): Promise<Player[]> {
  return executeQuery<Player>("SELECT * FROM players ORDER BY name ASC", []);
}

// Ajuste: Removido o parâmetro "p0: boolean" que não estava sendo utilizado.
export async function getBans(): Promise<Ban[]> { 
  return executeQuery<Ban>("SELECT * FROM bans ORDER BY time DESC", []);
}

export async function getMutes(): Promise<Mute[]> {
  return executeQuery<Mute>("SELECT * FROM mutes ORDER BY time DESC", []);
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