
import { Router } from "express"
import { body, validationResult } from "express-validator"
import { AdminController } from "../controllers/admin-controller"
import { createAuthMiddlewares } from "../middlewares/auth-middleware"
import { AdminRepository } from "../repositories/admin-repository"
import { AdminService } from "../services/admin-service"
import { DiscordService } from "../services/discord-service"
import { SocketGateway } from "../services/socket-gateway"

export function createApiRouter() {
  const router = Router()
  const repository = new AdminRepository()
  const discordService = new DiscordService()

  const { requireAuth, requireManage, requireCeo } = createAuthMiddlewares(discordService)

  router.use((req: any, _res: any, next: any) => {
    const socketGateway = req.app.locals.socketGateway as SocketGateway
    const service = new AdminService(repository, socketGateway)
    req.app.locals.adminController = new AdminController(service, discordService)
    next()
  })

  router.get("/public/stats", (req: any, res: any) => req.app.locals.adminController.getPublicStats(req, res))
  router.get("/public/recs", (req: any, res: any) => req.app.locals.adminController.getPublicRecs(req, res))
  router.get("/public/recs/:id", (req: any, res: any) => req.app.locals.adminController.downloadRec(req, res))

  router.get("/public/debug/auth", async (req, res) => {
  try {
    // Extrair token do header Authorization ou do cookie
    let accessToken = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      accessToken = req.headers.authorization.slice(7).trim();
    }
    // Se não veio pelo header, tente pelo cookie (next-auth)
    if (!accessToken && req.headers.cookie) {
      const match = req.headers.cookie.match(/next-auth\.session-token=([^;]+)/);
      if (match) accessToken = match[1];
    }
    let authInfo = null;
    if (accessToken) {
      const discordService = new DiscordService();
      const permissions = await discordService.checkPermissionsCached(accessToken);
      authInfo = {
        accessToken,
        isStaff: permissions.isStaff,
        isCeo: permissions.isCeo,
        canManage: permissions.canManage
      };
    }
    // Log igual ao requireManage
    const { logger } = require("../lib/logger");
    logger.warn(authInfo, '[AUTH DEBUG] rota pública - informações do usuário');
    return res.json({ authInfo });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao debugar auth" });
  }
});

  router.use(requireAuth)

  router.get("/players", requireManage, (req: any, res: any) => req.app.locals.adminController.getPlayers(req, res))
  router.post(
    "/players/:id/mod",
    // requireManage,
    [
      body("mod").isBoolean(),
    ],
    (req: any, res: any) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() })
      }
      return req.app.locals.adminController.updatePlayerMod(req, res)
    }
  )
  router.post(
    "/players/:id/legend",
    requireManage,
    [
      body("action").isString().trim().isIn(["add", "remove"]),
      body("tipo").toInt().isInt({ min: 3, max: 4 }),
      body("expiresAt")
        .if(body("action").equals("add"))
        .notEmpty().withMessage("Data é obrigatória para adicionar")
        .isISO8601().withMessage("Formato de data inválido"),
    ],
    (req: any, res: any) => {
      const { logger } = require("../lib/logger");
      logger.warn({ payload: req.body }, '[DEBUG legend route] payload recebido');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn({ errors: errors.array() }, '[VALIDATION ERROR]');
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() });
      }
      return req.app.locals.adminController.updatePlayerLegend(req, res);
    }
  )
  router.put(
    "/players/:id/password",
    requireManage,
    [
      body("password").isString().trim().notEmpty().isLength({ min: 8, max: 64 }),
    ],
    (req: any, res: any) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() })
      }
      return req.app.locals.adminController.updatePlayerPassword(req, res)
    }
  )

  router.get("/bans", requireManage, (req: any, res: any) => req.app.locals.adminController.getBans(req, res))
  router.post(
    "/bans",
    requireManage,
    [
      body("name").isString().trim().notEmpty().isLength({ max: 32 }),
      body("reason").isString().trim().notEmpty().isLength({ max: 128 }),
      body("time").custom((value) => {
        // Aceita string 'YYYY-MM-DDTHH:mm' ou número
        const exactRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        if (typeof value === "string" && exactRegex.test(value)) return true;
        if (typeof value === "number") return true;
        return false;
      }).withMessage("Formato de data inválido (esperado: YYYY-MM-DDTHH:mm ou número)"),
      body("conn").optional().isString().trim().isLength({ max: 32 }),
      body("ipv4").optional().isIP(),
      body("room").optional().custom((value) => {
        // Aceita 0 (número), "0" (string), ou string até 32 caracteres
        if (value === 0 || value === "0") return true;
        if (typeof value === "string" && value.length <= 32) return true;
        if (typeof value === "number") return true;
        return false;
      }).withMessage("Room deve ser 0 ou string até 32 caracteres"),
    ],
    (req: any, res: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() });
      }
      return req.app.locals.adminController.createBan(req, res);
    }
  )
  router.post(
    "/bans/:id/unban",
    requireManage,
    [
      body("reason").optional().isString().trim().isLength({ max: 128 }),
    ],
    (req: any, res: any) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() })
      }
      return req.app.locals.adminController.unban(req, res)
    }
  )

  router.get("/mutes", requireManage, (req: any, res: any) => req.app.locals.adminController.getMutes(req, res))
  router.post(
    "/mutes",
    requireManage,
    [
      body("name").isString().trim().notEmpty().isLength({ max: 32 }),
      body("reason").isString().trim().notEmpty().isLength({ max: 128 }),
      body("time").custom((value) => {
        // Aceita string 'YYYY-MM-DDTHH:mm' ou número
        const exactRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        if (typeof value === "string" && exactRegex.test(value)) return true;
        if (typeof value === "number") return true;
        return false;
      }).withMessage("Formato de data inválido (esperado: YYYY-MM-DDTHH:mm ou número)"),
      body("conn").optional().isString().trim().isLength({ max: 32 }),
      body("ipv4").optional().isIP(),
      body("room").optional().custom((value) => {
        // Aceita 0 (número), "0" (string), ou string até 32 caracteres
        if (value === 0 || value === "0") return true;
        if (typeof value === "string" && value.length <= 32) return true;
        if (typeof value === "number") return true;
        return false;
      }).withMessage("Room deve ser 0 ou string até 32 caracteres"),
    ],
    (req: any, res: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() });
      }
      return req.app.locals.adminController.createMute(req, res);
    }
  )
  router.post(
    "/mutes/:id/unmute",
    requireManage,
    [
      body("reason").optional().isString().trim().isLength({ max: 128 }),
    ],
    (req: any, res: any) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() })
      }
      return req.app.locals.adminController.unmute(req, res)
    }
  )

  router.get("/config/discord-roles", (req: any, res: any) => req.app.locals.adminController.getDiscordConfig(req, res))
  router.get("/config/can-manage", (req: any, res: any) => req.app.locals.adminController.canManage(req, res))
  router.post("/config/can-manage", (req: any, res: any) => req.app.locals.adminController.canManage(req, res))
  router.get("/config/is-ceo", (req: any, res: any) => req.app.locals.adminController.isCeo(req, res))
  router.post("/config/is-ceo", (req: any, res: any) => req.app.locals.adminController.isCeo(req, res))
  router.post(
    "/config/reset-vip",
    requireCeo,
    [
      body("playerId").isString().trim().notEmpty().isLength({ max: 32 }),
    ],
    (req: any, res: any) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Dados inválidos", details: errors.array() })
      }
      return req.app.locals.adminController.resetVip(req, res)
    }
  )

  router.get("/socket/status", requireManage, (req: any, res: any) => {
    const socketGateway = req.app.locals.socketGateway as SocketGateway

    return res.json({
      status: "connected",
      message: "Socket.IO está funcionando",
      socketPath: "/api/socketio",
      connectedClients: socketGateway.getConnectedClientsCount(),
      timestamp: new Date().toISOString(),
    })
  })

  return router
}
