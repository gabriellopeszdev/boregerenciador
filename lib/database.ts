import mysql from "mysql2/promise"

const dbConfig = {
  host: "216.238.98.107",
  user: "admin",
  password: "D3w9oYHM86~k",
  database: "haxball",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
    console.log('Consulta a ser executada:', query);
    console.log('Parâmetros da consulta:', params);
    const [rows] = await connection.execute(query, params)
    return rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
