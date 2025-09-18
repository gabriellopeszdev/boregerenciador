// Local do arquivo: /lib/types.ts

import { DefaultSession } from "next-auth"

// Sua interface, que reflete a estrutura do banco de dados (ceo/diretor como número, outros como array)
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

// Estendendo os tipos do NextAuth para incluir 'role' e 'id' na sessão
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

// Seus tipos de permissão
export type UserRole = "ceo" | "diretor" | "admin" | "gerente" | "mod"

/**
 * Função auxiliar segura que verifica se um valor é um array não vazio.
 * Ela também trata o caso onde o valor é uma string JSON (ex: "[1,2,3]")
 * vinda diretamente do banco de dados.
 */
function isNonEmptyArray(value: any): value is any[] {
  // Se o valor já for um array, verifica o tamanho
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  // Se for uma string JSON, converte para array e verifica o tamanho
  if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value).length > 0;
    } catch {
      return false; // Retorna falso se o JSON for inválido
    }
  }
  // Se não for nem array nem string JSON, não é válido
  return false;
}

/**
 * Verifica se um jogador tem qualquer cargo de permissão.
 * Usa a função auxiliar para lidar com a inconsistência dos dados.
 */
export function hasPermission(player: Player): boolean {
  if (player.ceo === 1 || player.diretor === 1) {
    return true
  }
  // Usa a nova função segura para verificar os cargos baseados em array
  return isNonEmptyArray(player.admin) || isNonEmptyArray(player.gerente) || isNonEmptyArray(player.mod)
}

/**
 * Retorna o cargo mais alto de um jogador.
 * Usa a função auxiliar para lidar com a inconsistência dos dados.
 */
export function getPlayerRole(player: Player): UserRole | null {
  if (player.ceo === 1) return "ceo"
  if (player.diretor === 1) return "diretor"
  // Usa a nova função segura aqui também
  if (isNonEmptyArray(player.admin)) return "admin"
  if (isNonEmptyArray(player.gerente)) return "gerente"
  if (isNonEmptyArray(player.mod)) return "mod"
  return null
}