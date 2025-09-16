import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: Number.parseInt(process.env.DB_QUEUE_LIMIT || '0'),
}

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const connection = getPool()
  try {
    const [rows] = await connection.execute(query, params)
    return rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}