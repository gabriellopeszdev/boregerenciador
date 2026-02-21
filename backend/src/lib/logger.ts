import pino from "pino"

export const isProduction = process.env.NODE_ENV === "production"
export const isDevelopment = process.env.NODE_ENV === "development"
const slowRequestThresholdMs = Number.parseInt(process.env.SLOW_REQUEST_MS || "1200", 10)
const productionSummaryIntervalMs = 5 * 60 * 1000

type ProductionSummary = {
  windowStartedAt: string
  windowEndedAt: string
  totalRequests: number
  successResponses: number
  clientErrors: number
  serverErrors: number
  slowRequests: number
  maxDurationMs: number
  slowestRoute: {
    method: string
    path: string
    statusCode: number
    durationMs: number
    requestId: string
  } | null
}

type HttpLogPayload = {
  requestId: string
  method: string
  path: string
  statusCode: number
  durationMs: number
  ip?: string
  userAgent?: string
  query?: unknown
  params?: unknown
}

let summaryWindowStart = Date.now()
let totalRequests = 0
let successResponses = 0
let clientErrors = 0
let serverErrors = 0
let slowRequests = 0
let maxDurationMs = 0
let slowestRoute: ProductionSummary["slowestRoute"] = null

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  base: { service: "backend" },
  ...(!isProduction ? {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname,time",
        singleLine: true,
      },
    },
  } : {}),
})

function registerSummaryMetrics(payload: HttpLogPayload, isSlow: boolean) {
  if (!isProduction) {
    return
  }

  totalRequests += 1

  if (payload.statusCode >= 500) {
    serverErrors += 1
  } else if (payload.statusCode >= 400) {
    clientErrors += 1
  } else {
    successResponses += 1
  }

  if (isSlow) {
    slowRequests += 1
  }

  if (payload.durationMs > maxDurationMs) {
    maxDurationMs = payload.durationMs

    slowestRoute = {
      method: payload.method,
      path: payload.path,
      statusCode: payload.statusCode,
      durationMs: payload.durationMs,
      requestId: payload.requestId,
    }
  }
}

function flushProductionSummary() {
  if (!isProduction) {
    return
  }

  const now = Date.now()
  const summary: ProductionSummary = {
    windowStartedAt: new Date(summaryWindowStart).toISOString(),
    windowEndedAt: new Date(now).toISOString(),
    totalRequests,
    successResponses,
    clientErrors,
    serverErrors,
    slowRequests,
    maxDurationMs,
    slowestRoute,
  }

  logger.warn(summary, "production_5m_summary")

  summaryWindowStart = now
  totalRequests = 0
  successResponses = 0
  clientErrors = 0
  serverErrors = 0
  slowRequests = 0
  maxDurationMs = 0
  slowestRoute = null
}

if (isProduction) {
  const summaryTimer = setInterval(flushProductionSummary, productionSummaryIntervalMs)
  summaryTimer.unref()
}

export function logHttpRequest(payload: HttpLogPayload) {
  const isSlow = payload.durationMs >= slowRequestThresholdMs

  registerSummaryMetrics(payload, isSlow)

  if (payload.statusCode >= 500) {
    logger.error(payload, "http_request")
    return
  }

  if (payload.statusCode >= 400 || isSlow) {
    logger.warn(payload, "http_request")
    return
  }

  if (isDevelopment) {
    logger.debug(payload, "http_request")
  }
}