import { getServerAuthSession } from "./auth"

// --- SISTEMA DE CACHE EM MEMÓRIA ---
// Isso previne o erro 429 (Rate Limit) durante o desenvolvimento
const CACHE_DURATION = 1000 * 60 * 2 // 2 minutos de cache
const rolesCache = new Map<string, { data: UserRoles; timestamp: number }>()

export interface UserRoles {
  isCEO: boolean
  isDiretor: boolean
  isGerente: boolean
  hasAnyPermission: boolean
}

export async function getUserRoles(): Promise<UserRoles> {
  try {
    const session = await getServerAuthSession()

    // Sem sessão = sem permissão
    if (!session?.user?.id || !session.accessToken) {
      return { isCEO: false, isDiretor: false, isGerente: false, hasAnyPermission: false }
    }

    const userId = session.user.id

    // 1. VERIFICA O CACHE ANTES DE CHAMAR O DISCORD
    const cached = rolesCache.get(userId)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      console.log(`[discord-roles] Usando cache de memória para: ${session.user.name}`)
      return cached.data
    }

    const guildId = process.env.DISCORD_GUILD_ID
    const ceoRoleId = process.env.DISCORD_CEO_ROLE_ID
    const diretorRoleId = process.env.DISCORD_DIRETOR_ROLE_ID
    const gerenteRoleId = process.env.DISCORD_GERENTE_ROLE_ID

    if (!guildId || !ceoRoleId || !diretorRoleId || !gerenteRoleId) {
      console.warn("[discord-roles] Variáveis de ambiente faltando.")
      return { isCEO: false, isDiretor: false, isGerente: false, hasAnyPermission: false }
    }

    // 2. SE NÃO TIVER CACHE, CHAMA A API
    console.log(`[discord-roles] Buscando dados frescos na API do Discord...`)
    const response = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        // Cache do fetch como backup
        next: { revalidate: 120 } 
      }
    )

    // SE TOMAR RATE LIMIT (429)
    if (response.status === 429) {
      console.warn("[discord-roles] ⚠️ Rate Limit atingido! Usando fallback de segurança.")
      
      // Se tiver um cache antigo (mesmo expirado), usa ele para não quebrar o site
      if (cached) return cached.data
      
      // Se não tem nada, infelizmente retorna falso
      return { isCEO: false, isDiretor: false, isGerente: false, hasAnyPermission: false }
    }

    if (!response.ok) {
      console.error(`[discord-roles] Erro API Discord (${response.status})`)
      return { isCEO: false, isDiretor: false, isGerente: false, hasAnyPermission: false }
    }

    const member = await response.json()
    const userRoles: string[] = member.roles || []

    const result: UserRoles = {
      isCEO: userRoles.includes(ceoRoleId),
      isDiretor: userRoles.includes(diretorRoleId),
      isGerente: userRoles.includes(gerenteRoleId),
      hasAnyPermission: userRoles.includes(ceoRoleId) || userRoles.includes(diretorRoleId) || userRoles.includes(gerenteRoleId)
    }

    // 3. SALVA NO CACHE GLOBAL
    rolesCache.set(userId, {
      data: result,
      timestamp: now
    })

    return result

  } catch (error) {
    console.error("[discord-roles] Erro fatal:", error)
    return { isCEO: false, isDiretor: false, isGerente: false, hasAnyPermission: false }
  }
}

export async function canManageRoles(): Promise<boolean> {
  const roles = await getUserRoles()
  return roles.hasAnyPermission
}

export async function isUserCeo(): Promise<boolean> {
  const roles = await getUserRoles()
  return roles.isCEO
}