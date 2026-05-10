import mysql from "mysql2/promise";
import { env } from "../env.js";

export const mysqlPool = mysql.createPool(env.DATABASE_URL);

export async function checkMySql() {
  const connection = await mysqlPool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
