const { Pool } = require("pg");
const log = require("../utils/logger/logger");

require("dotenv").config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASS,
  port: process.env.DATABASE_PORT,
});

const startTransaction = async () => {
  let client
  
  try {
    client = await pool.connect();
    log.debug("Connected to database");

    await client.query("BEGIN");
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
};

const commitTransaction = async client => {
  await client.query("COMMIT");
  log.debug("Transaction committed");
  endTransaction(client);
};

const rollbackTransaction = async client => {
  await client.query("ROLLBACK");
  log.debug("Transaction rollbacked");
  endTransaction(client);
};

const endTransaction = async client => {  
  await client.release();
  log.debug("Disconnected from database");
}
/* --------------------- Check Connection --------------------- */

(async() => {
  try {
    const res = await pool.query("SELECT NOW()");
    log.debug(`DATABASE connected ${res.rows[0].now}`);
  } catch (e) {
    log.error(`DB connection error:\n ${e}`);
  }
})();

module.exports = { 
  transaction: {
    start: startTransaction, 
    commit: commitTransaction, 
    rollback: rollbackTransaction,
    end: endTransaction
  }
};
