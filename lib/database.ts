import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT || '3'),
  queueLimit: Number.parseInt(process.env.DB_QUEUE_LIMIT || '0'),
  idleTimeout: 30000,
  enableKeepAlive: true,
}

declare global {
  // eslint-disable-next-line no-var
  var __MYSQL_POOL__: mysql.Pool | undefined
}

export function getPool() {
  if (global.__MYSQL_POOL__) return global.__MYSQL_POOL__

  const pool = mysql.createPool(dbConfig)
  console.log(`[db] Pool criado (conexões: ${dbConfig.connectionLimit}, timeout: ${dbConfig.idleTimeout}ms)`)
  
  global.__MYSQL_POOL__ = pool
  return pool
}

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const pool = getPool()
  const MAX_RETRIES = 5
  let lastError: any

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const [rows] = await pool.execute(query, params)
      return rows as T[]
    } catch (error: any) {
      lastError = error
      
      if ((error?.errno === 1040 || error?.sqlState === '08004') && attempt < MAX_RETRIES - 1) {
        const delayMs = 200 * Math.pow(2, attempt)
        console.warn(`[db] Muitas conexões (tentativa ${attempt + 1}/${MAX_RETRIES}), aguardando ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }

      console.error("[db] Erro na query:", error)
      throw error
    }
  }

  throw lastError
}