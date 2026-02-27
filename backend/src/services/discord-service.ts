interface DiscordRoleResult {
  isStaff: boolean
  isCeo: boolean
  canManage: boolean
  isModerador: boolean
}

export class DiscordService {
  private static readonly permissionCache = new Map<string, { expiresAt: number; value: DiscordRoleResult }>()
  private static readonly cacheTtlMs = Number.parseInt(process.env.DISCORD_PERMISSIONS_CACHE_MS || "120000", 10)

  private async getRolesFromToken(token: string): Promise<string[] | null> {
    const guildId = process.env.DISCORD_GUILD_ID
    if (!guildId || !token) {
      return null
    }

    const resp = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!resp.ok) {
      return null
    }

    const member = await resp.json()
    return member.roles || []
  }

  async checkPermissions(token: string): Promise<DiscordRoleResult> {
    const roles = await this.getRolesFromToken(token)
    if (!roles) {
      return { isStaff: false, isCeo: false, canManage: false, isModerador: false }
    }

    const staffRoleIds = (process.env.DISCORD_STAFF_ROLE_ID || "").split(",").map((item) => item.trim()).filter(Boolean)
    const ceoRoleId = process.env.DISCORD_CEO_ROLE_ID
    const diretorRoleId = process.env.DISCORD_DIRETOR_ROLE_ID
    const gerenteRoleIds = (process.env.DISCORD_GERENTE_ROLE_ID || "").split(",").map((item) => item.trim()).filter(Boolean)
    const moderadorRoleIds = (process.env.DISCORD_MODERADOR_ROLE_ID || "").split(",").map((item) => item.trim()).filter(Boolean)

    const isCeo = Boolean(ceoRoleId && roles.includes(ceoRoleId))
    const isDiretor = Boolean(diretorRoleId && roles.includes(diretorRoleId))
    const isGerente = gerenteRoleIds.some((roleId) => roles.includes(roleId))
    const isModerador = moderadorRoleIds.some((roleId) => roles.includes(roleId))
    const canManage = isCeo || isDiretor || isGerente || isModerador
    const isStaff = canManage || staffRoleIds.some((roleId) => roles.includes(roleId))

    return {
      isStaff,
      isCeo,
      canManage,
      isModerador,
    }
  }

  async checkPermissionsCached(token: string): Promise<DiscordRoleResult> {
    const now = Date.now()
    const cached = DiscordService.permissionCache.get(token)

    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    const value = await this.checkPermissions(token)
    DiscordService.permissionCache.set(token, {
      value,
      expiresAt: now + DiscordService.cacheTtlMs,
    })

    return value
  }
}
