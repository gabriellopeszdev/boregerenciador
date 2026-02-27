import mysql, { type Pool } from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: Number.parseInt(process.env.DB_QUEUE_LIMIT || '0'),
  idleTimeout: 30000,
  enableKeepAlive: true,
  connectTimeout: Number.parseInt(process.env.DB_TIMEOUT || '60000'),
}

declare global {
  // eslint-disable-next-line no-var
  var __MYSQL_POOL__: Pool | undefined
}

export function getPool() {
  if (global.__MYSQL_POOL__) return global.__MYSQL_POOL__

  const pool = mysql.createPool(dbConfig)
  
  global.__MYSQL_POOL__ = pool
  return pool
}

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  let pool = getPool()
  const MAX_RETRIES = 3
  let lastError: any

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const [rows] = await pool.execute(query, params)
      return rows as T[]
    } catch (error: any) {
      lastError = error
      // Reconhece erros transient como conexões resetadas e muitas conexões
      const isTooManyConns = (error?.errno === 1040 || error?.sqlState === '08004')
      const isConnReset = error?.code === 'ECONNRESET' || error?.code === 'PROTOCOL_CONNECTION_LOST' || error?.errno === 'ECONNRESET'

      if ((isTooManyConns || isConnReset) && attempt < MAX_RETRIES - 1) {
        const delayMs = 200 * Math.pow(2, attempt)
        console.warn(`[db] Muitas conexões (tentativa ${attempt + 1}/${MAX_RETRIES}), aguardando ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        // Tenta recriar o pool se for erro de reset de conexão
        try {
          if (global.__MYSQL_POOL__) {
            try { await global.__MYSQL_POOL__.end() } catch (_) {}
            global.__MYSQL_POOL__ = undefined
          }
        } catch (_) {}
        pool = getPool()
        continue
      }
      console.error("[db] Erro na query:", error)
      throw error
    }
  }

  throw lastError
}
