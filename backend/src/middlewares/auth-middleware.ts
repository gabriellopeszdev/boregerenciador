import type { NextFunction, Request, Response } from "express"
import { getToken } from "next-auth/jwt"
import { logger } from "../lib/logger"
import { DiscordService } from "../services/discord-service"

export type AuthContext = {
  accessToken: string
  isStaff: boolean
  isCeo: boolean
  canManage: boolean
}

export type AuthenticatedRequest = Request & {
  auth?: AuthContext
}

async function extractAccessToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.authorization
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const tokenFromHeader = authHeader.slice(7).trim()
    if (tokenFromHeader) {
      return tokenFromHeader
    }
  }

  const token = await getToken({
    req: {
      headers: {
        cookie: req.headers.cookie || "",
      },
    } as any,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })

  if (typeof token?.accessToken === "string" && token.accessToken.trim()) {
    return token.accessToken
  }

  return null
}

export function createAuthMiddlewares(discordService: DiscordService) {
  const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const accessToken = await extractAccessToken(req)
      if (!accessToken) {
        return res.status(401).json({ error: "Não autenticado" })
      }

      const permissions = await discordService.checkPermissionsCached(accessToken)
      if (!permissions.isStaff && !permissions.canManage && !permissions.isCeo) {
        return res.status(403).json({ error: "Sem permissão" })
      }

      req.auth = {
        accessToken,
        isStaff: permissions.isStaff,
        isCeo: permissions.isCeo,
        canManage: permissions.canManage,
      }

      return next()
    } catch (error) {
      logger.error({ err: error }, "auth_middleware_error")
      return res.status(401).json({ error: "Falha na autenticação" })
    }
  }

  const requireManage = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { logger } = require("../lib/logger");
    logger.warn({
      accessToken: req.auth?.accessToken,
      isStaff: req.auth?.isStaff,
      isCeo: req.auth?.isCeo,
      canManage: req.auth?.canManage
    }, '[AUTH DEBUG] requireManage - informações do usuário');
    if (!req.auth?.canManage) {
      return res.status(403).json({ error: "sem permissão" })
    }
    return next()
  }

  const requireCeo = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth?.isCeo) {
      return res.status(403).json({ error: "Sem permissão (apenas CEO)" })
    }

    return next()
  }

  return { requireAuth, requireManage, requireCeo }
}
