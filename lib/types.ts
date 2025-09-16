export interface Player {
  room: number
  auth: string
  ipv4: string
  conn: string
  id: number
  game_id: number
  name: string
  password: string | null
  loggedin: number
  ceo: number
  diretor: number
  admin: number
  gerente: number
  mod: number
  campAdmin: number
  prof: number
}

export interface Ban {
  id: number
  name: string
  time: string
  reason: string
  banned_by: string
  conn: string
  ipv4: string
  auth: string
  room: number
}

export interface Mute {
  id: number;
  name: string;
  time: string;
  reason: string;
  muted_by: string;
  active: boolean;
  conn: string;
  ipv4: string;
  auth: string;
  room: number;
}

export type UserRole = "ceo" | "diretor" | "admin" | "gerente" | "mod"

export function hasPermission(player: Player): boolean {
  return player.ceo === 1 || player.diretor === 1 || player.admin === 1 || player.gerente === 1 || player.mod === 1
}

export function getPlayerRole(player: Player): UserRole | null {
  if (player.ceo === 1) return "ceo"
  if (player.diretor === 1) return "diretor"
  if (player.admin === 1) return "admin"
  if (player.gerente === 1) return "gerente"
  if (player.mod === 1) return "mod"
  return null
}
