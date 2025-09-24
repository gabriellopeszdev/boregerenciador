import { DefaultSession } from "next-auth"

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
  admin: number[] | null
  gerente: number[] | null
  mod: number[] | null
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

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null
      role?: string | null
      rooms?: number[] | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string | null
    role?: string | null
    rooms?: number[] | null
  }
}

export type UserRole = "ceo" | "diretor" | "admin" | "gerente" | "mod"


function isNonEmptyArray(value: any): value is any[] {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value).length > 0;
    } catch {
      return false; 
    }
  }
  return false;
}

export function hasPermission(player: Player): boolean {
  if (player.ceo === 1 || player.diretor === 1) {
    return true
  }

  return isNonEmptyArray(player.admin) || isNonEmptyArray(player.gerente) || isNonEmptyArray(player.mod)
}

export function getPlayerRole(player: Player): UserRole | null {
  if (player.ceo === 1) return "ceo"
  if (player.diretor === 1) return "diretor"
  if (isNonEmptyArray(player.admin)) return "admin"
  if (isNonEmptyArray(player.gerente)) return "gerente"
  if (isNonEmptyArray(player.mod)) return "mod"
  return null
}