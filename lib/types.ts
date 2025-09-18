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
      id?: string | null      // ID do jogador no seu DB
      role?: string | null
      rooms?: number[] | null 
    } & DefaultSession["user"] // Mantém name, email, image do Discord
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string | null // ID do jogador no seu DB
    role?: string | null
    rooms?: number[] | null 
  }
}


export type UserRole = "ceo" | "diretor" | "admin" | "gerente" | "mod"

export function hasPermission(player: Player): boolean {
  if (player.ceo === 1 || player.diretor === 1) {
    return true
  }

  const hasAdminRooms = player.admin !== null && player.admin.length > 0
  const hasGerenteRooms = player.gerente !== null && player.gerente.length > 0
  const hasModRooms = player.mod !== null && player.mod.length > 0

  return hasAdminRooms || hasGerenteRooms || hasModRooms
}

export function getPlayerRole(player: Player): UserRole | null {
  if (player.ceo === 1) return "ceo"
  if (player.diretor === 1) return "diretor"
  
  if (player.admin && player.admin.length > 0) return "admin"     
  if (player.gerente && player.gerente.length > 0) return "gerente"  
  if (player.mod && player.mod.length > 0) return "mod"       

  return null
}
