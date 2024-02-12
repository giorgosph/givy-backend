import { Pool, PoolClient } from "pg";
import Logger from "../utils/logger/logger";

require("dotenv").config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASS,
  port: Number(process.env.DATABASE_PORT),
});

const startTransaction = async () => {
  let client: PoolClient | null = null;

  try {
    client = await pool.connect();
    Logger.debug("Connected to database");
    await client.query("BEGIN");

    return client;
  } catch (error) {
    if (client) client.release();
    throw error;
  }
};

const commitTransaction = async (client: PoolClient) => {
  await client.query("COMMIT");
  Logger.debug("Transaction committed");
  await endTransaction(client);
};

const rollbackTransaction = async (client: PoolClient) => {
  await client.query("ROLLBACK");
  Logger.debug("Transaction rolled back");
  await endTransaction(client);
};

const endTransaction = async (client: PoolClient) => {
  await client.release();
  Logger.debug("Disconnected from database");
};

/* --------------------- Check Connection --------------------- */

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    Logger.debug(`Database connected ${res.rows[0].now}`);
  } catch (e) {
    Logger.error(`Database connection error:\n ${e}`);
  }
})();

export const transaction = {
  start: startTransaction,
  commit: commitTransaction,
  rollback: rollbackTransaction,
  end: endTransaction,
};
