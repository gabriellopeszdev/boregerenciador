import { logger } from '../lib/logger'
import type { Request, Response, NextFunction } from 'express'

// Simples contador em memória (para produção, use Redis ou outro store)
const ipRequestCounts: Record<string, { count: number, last: number }> = {}
const WINDOW_MS = 60 * 1000 // 1 minuto
const MAX_REQUESTS = 100 // Limite por IP por janela

export function attackDetector(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()

  // Rate limiting simples
  if (!ipRequestCounts[ip] || now - ipRequestCounts[ip].last > WINDOW_MS) {
    ipRequestCounts[ip] = { count: 1, last: now }
  } else {
    ipRequestCounts[ip].count++
    ipRequestCounts[ip].last = now
  }
  if (ipRequestCounts[ip].count > MAX_REQUESTS) {
    logger.warn({ ip, url: req.originalUrl }, 'Muitas requisições - possível ataque DDoS/brute force')
    // return res.status(429).json({ error: 'Muitas requisições, tente novamente mais tarde.' })
  }

  // Payload muito grande
  if (req.headers['content-length'] && Number(req.headers['content-length']) > 1_000_000) {
    logger.warn({ ip, url: req.originalUrl }, 'Payload muito grande - possível ataque')
  }

  // User-Agent suspeito
  if (req.headers['user-agent'] && typeof req.headers['user-agent'] === 'string' && req.headers['user-agent'].toLowerCase().includes('sqlmap')) {
    logger.warn({ ip, url: req.originalUrl, ua: req.headers['user-agent'] }, 'User-Agent suspeito detectado')
  }

  // Métodos HTTP suspeitos
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  if (!allowedMethods.includes(req.method)) {
    logger.warn({ ip, url: req.originalUrl, method: req.method }, 'Método HTTP não esperado/suspeito')
  }

  // Headers incomuns
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-custom-attack', 'x-originating-ip']
  for (const h of suspiciousHeaders) {
    if (req.headers[h]) {
      logger.warn({ ip, url: req.originalUrl, header: h, value: req.headers[h] }, 'Header incomum/suspeito detectado')
    }
  }

  // SQL Injection simples
  const sqlPatterns = [/('|%27|--|;|\b(OR|AND)\b|\bSELECT\b|\bUNION\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)/i]
  const allParams = { ...req.query, ...req.body }
  for (const key in allParams) {
    const value = String(allParams[key])
    if (sqlPatterns.some((pat) => pat.test(value))) {
      logger.warn({ ip, url: req.originalUrl, param: key, value }, 'Possível SQL Injection detectado')
    }
  }

  // XSS simples
  const xssPattern = /<script.*?>.*?<\/script.*?>/i
  for (const key in allParams) {
    const value = String(allParams[key])
    if (xssPattern.test(value)) {
      logger.warn({ ip, url: req.originalUrl, param: key, value }, 'Possível XSS detectado')
    }
  }

  // Path traversal
  if (req.originalUrl.includes('../') || req.originalUrl.includes('..%2F')) {
    logger.warn({ ip, url: req.originalUrl }, 'Possível tentativa de path traversal')
  }

  // Monitoramento de endpoints sensíveis
  const sensitiveEndpoints = ['/admin', '/login', '/auth', '/config', '/.env']
  if (sensitiveEndpoints.some((ep) => req.originalUrl.startsWith(ep))) {
    logger.info({ ip, url: req.originalUrl }, 'Acesso a endpoint sensível monitorado')
  }

  next()
}
