import type { Request, Response } from "express"
import { logger } from "../lib/logger"
import type { AuthenticatedRequest } from "../middlewares/auth-middleware"
import { AdminService } from "../services/admin-service"
import { DiscordService } from "../services/discord-service"

function getStaffName(req: Request) {
  // Tenta pegar o nome do usuário do Discord
  if (req.user && req.user.discordName) {
    return req.user.discordName;
  }
  const fromHeader = req.headers["x-staff-name"];
  return (typeof fromHeader === "string" && fromHeader.trim()) || "Sistema";
}

function getParamAsString(param: string | string[] | undefined): string {
  if (Array.isArray(param)) {
    return param[0] || ""
  }

  return param || ""
}

export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly discordService: DiscordService
  ) {}

  getPlayers = async (req: Request, res: Response) => {
    try {
      const page = Number.parseInt((req.query.page as string) || "1")
      const limit = Number.parseInt((req.query.limit as string) || "10")
      const searchTerm = (req.query.searchTerm as string) || ""

      if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
        return res.status(400).json({ error: "Invalid pagination parameters" })
      }

      const payload = await this.adminService.listPlayers(page, limit, searchTerm)
      return res.json(payload)
    } catch (error) {
      logger.error({ err: error }, "players_get_error")
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  getBans = async (req: Request, res: Response) => {
    try {
      const page = Number.parseInt((req.query.page as string) || "1")
      const limit = Number.parseInt((req.query.limit as string) || "10")
      const searchTerm = (req.query.searchTerm as string) || ""

      const payload = await this.adminService.listBans(page, limit, searchTerm)
      return res.json(payload)
    } catch (error) {
      logger.error({ err: error }, "bans_get_error")
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  createBan = async (req: Request, res: Response) => {
    try {
      const { name, time, reason, conn, ipv4, room } = req.body;
      logger.info({
        action: "ban-create",
        payload: req.body,
        staffName: getStaffName(req)
      }, "ban-create-payload");
      if (!name || !reason || !time) {
        logger.warn({ action: "ban-create", payload: req.body }, "ban-create-missing-fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      await this.adminService.createBan({
        name,
        time,
        reason,
        conn,
        ipv4,
        room,
        staffName: getStaffName(req),
      });

      logger.info({ action: "ban-create", result: "success", player: name }, "ban-create-success");
      return res.json({ success: true });
    } catch (error) {
      logger.error({ action: "ban-create", err: error }, "bans_create_error");
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  unban = async (req: Request, res: Response) => {
    try {
      const banId = Number.parseInt(getParamAsString(req.params.id))
      if (Number.isNaN(banId)) {
        return res.status(400).json({ error: "Invalid ban ID" })
      }

      await this.adminService.unban(banId)
      return res.json({ success: true })
    } catch (error) {
      logger.error({ err: error }, "bans_unban_error")
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  getMutes = async (req: Request, res: Response) => {
    try {
      const page = Number.parseInt((req.query.page as string) || "1")
      const limit = Number.parseInt((req.query.limit as string) || "10")
      const searchTerm = (req.query.searchTerm as string) || ""

      const payload = await this.adminService.listMutes(page, limit, searchTerm)
      return res.json(payload)
    } catch (error) {
      logger.error({ err: error }, "mutes_get_error")
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  createMute = async (req: Request, res: Response) => {
    try {
      const { name, time, reason, conn, ipv4, room } = req.body
      if (!name || !reason || !time) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      await this.adminService.createMute({
        name,
        time,
        reason,
        conn,
        ipv4,
        room,
        staffName: getStaffName(req),
      })

      return res.json({ success: true })
    } catch (error) {
      logger.error({ err: error }, "mutes_create_error")
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  unmute = async (req: Request, res: Response) => {
    try {
      const muteId = Number.parseInt(getParamAsString(req.params.id))
      if (Number.isNaN(muteId)) {
        return res.status(400).json({ error: "Invalid mute ID" })
      }

      await this.adminService.unmute(muteId)
      return res.json({ success: true })
    } catch (error) {
      logger.error({ err: error }, "mutes_unmute_error")
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  updatePlayerLegend = async (req: Request, res: Response) => {
    try {
      const playerId = Number.parseInt(getParamAsString(req.params.id));
      if (Number.isNaN(playerId)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }
      const { action, tipo, expiresAt } = req.body;
      if (action === "remove") {
        await this.adminService.updateLegend(playerId, action, tipo, undefined);
      } else {
        await this.adminService.updateLegend(playerId, action, tipo, expiresAt);
      }
      return res.json({ success: true });
    } catch (error) {
      logger.error({ err: error }, "players_legend_error");
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  updatePlayerMod = async (req: Request, res: Response) => {
    try {
      const playerId = Number.parseInt(getParamAsString(req.params.id))
      if (Number.isNaN(playerId)) {
        return res.status(400).json({ error: "Invalid player ID" })
      }

      const { action, rooms } = req.body
      if (!action || !["add", "remove"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" })
      }

      await this.adminService.updateMod(playerId, action, rooms)
      return res.json({ success: true })
    } catch (error) {
      if (error instanceof Error && error.message === "PLAYER_NOT_FOUND") {
        return res.status(404).json({ error: "Player not found" })
      }

      if (error instanceof Error && error.message === "INVALID_ROOMS") {
        return res.status(400).json({ error: "Invalid rooms array" })
      }

      logger.error({ err: error }, "players_mod_error")
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  updatePlayerPassword = async (req: Request, res: Response) => {
    try {
      const playerId = Number.parseInt(getParamAsString(req.params.id))
      if (Number.isNaN(playerId)) {
        return res.status(400).json({ error: "Invalid player ID" })
      }

      const { newPassword } = req.body
      await this.adminService.updatePassword(playerId, newPassword)
      return res.json({ message: "Senha alterada com sucesso", playerId })
    } catch (error) {
      if (error instanceof Error && error.message === "PLAYER_NOT_FOUND") {
        return res.status(404).json({ error: "Jogador não encontrado" })
      }

      if (error instanceof Error && error.message === "INVALID_PASSWORD") {
        return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" })
      }

      logger.error({ err: error }, "players_password_error")
      return res.status(500).json({ error: "Erro ao alterar senha" })
    }
  }

  getPublicStats = async (req: Request, res: Response) => {
    try {
      const page = Number.parseInt((req.query.page as string) || "1")
      const limit = Number.parseInt((req.query.limit as string) || "50")
      const search = (req.query.search as string) || ""
      const sortBy = (req.query.sortBy as string) || "points"
      const sortOrder = ((req.query.sortOrder as string) || "desc") as "asc" | "desc"

      const payload = await this.adminService.getStats(page, limit, search, sortBy, sortOrder)
      return res.json(payload)
    } catch (error) {
      logger.error({ err: error }, "public_stats_error")
      return res.status(500).json({ error: "Erro ao buscar stats", details: String(error) })
    }
  }

  getPublicRecs = async (req: Request, res: Response) => {
    try {
      const page = Number.parseInt((req.query.page as string) || "1")
      const limit = Number.parseInt((req.query.limit as string) || "50")
      const search = (req.query.search as string) || ""
      const roomId = (req.query.roomId as string) || undefined

      const payload = await this.adminService.getRecs(page, limit, search, roomId)
      return res.json(payload)
    } catch (error) {
      logger.error({ err: error }, "public_recs_error")
      return res.status(500).json({ error: "Erro ao buscar recs", details: String(error) })
    }
  }

  downloadRec = async (req: Request, res: Response) => {
    try {
      const rec = await this.adminService.getRecById(getParamAsString(req.params.id))
      if (!rec) {
        return res.status(404).json({ error: "Replay não encontrado" })
      }

      if (!rec.recData) {
        return res.status(404).json({ error: "Dados do replay não disponíveis" })
      }

      return res
        .setHeader("Content-Type", "application/octet-stream")
        .setHeader("Content-Disposition", `attachment; filename="${rec.fileName}"`)
        .send(Buffer.from(rec.recData))
    } catch (error) {
      logger.error({ err: error }, "public_rec_download_error")
      return res.status(500).json({ error: "Erro ao buscar replay", details: String(error) })
    }
  }

  getDiscordConfig = (_req: Request, res: Response) => {
    return res.json({
      guildId: process.env.DISCORD_GUILD_ID ?? null,
      ceoRoleId: process.env.DISCORD_CEO_ROLE_ID ?? null,
      diretorRoleId: process.env.DISCORD_DIRETOR_ROLE_ID ?? null,
      gerenteRoleId: process.env.DISCORD_GERENTE_ROLE_ID ?? null,
    })
  }

  canManage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      return res.json({ canManage: Boolean(req.auth?.canManage) })
    } catch (error) {
      logger.error({ err: error }, "config_can_manage_error")
      return res.status(500).json({ canManage: false })
    }
  }

  isCeo = async (req: AuthenticatedRequest, res: Response) => {
    try {
      return res.json({ isCeo: Boolean(req.auth?.isCeo) })
    } catch (error) {
      logger.error({ err: error }, "config_is_ceo_error")
      return res.status(500).json({ isCeo: false })
    }
  }

  resetVip = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.auth?.isCeo) {
        return res.status(403).json({ error: "Sem permissão (apenas CEO)" })
      }

      await this.adminService.resetVip()
      return res.json({ success: true, message: "Todos os VIPs foram resetados para 0" })
    } catch (error) {
      logger.error({ err: error }, "config_reset_vip_error")
      return res.status(500).json({ error: "Erro ao resetar VIPs" })
    }
  }
}
