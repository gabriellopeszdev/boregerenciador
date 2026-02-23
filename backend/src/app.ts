import cors from "cors"
import express from "express"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { randomUUID } from "node:crypto"
import type { NextFunction, Request, Response } from "express"
import { isDevelopment, isProduction, logHttpRequest, logger } from "./lib/logger"
import { createApiRouter } from "./routes"

export function createApp() {

  const app = express()
  // Confia no primeiro proxy (Cloudflare, Docker, etc) para X-Forwarded-For
  app.set('trust proxy', 1)

  // Helmet para headers de segurança
  app.use(helmet())

  // Rate limiting para evitar brute force e DoS
  const rateLimitConfig = {
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }
  app.use(rateLimit(rateLimitConfig))

  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-staff-name"],
  }))

  app.use(express.json({ limit: "2mb" }))

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now()
    const requestId = randomUUID()

    res.setHeader("x-request-id", requestId)

    res.on("finish", () => {
      const payload = {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startTime,
        ...(isDevelopment
          ? {
              ip: req.ip,
              userAgent: req.get("user-agent") || "unknown",
              query: req.query,
              params: req.params,
            }
          : {}),
      }

      logHttpRequest(payload)
    })

    next()
  })

  app.use("/api", createApiRouter())

  app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
    const requestId = String(res.getHeader("x-request-id") || "unknown")
    logger.error({ err: error, requestId, path: req.originalUrl }, "unhandled_error")

    if (res.headersSent) {
      return
    }

    res.status(500).json({ error: "Internal server error" })
  })

  return app
}
