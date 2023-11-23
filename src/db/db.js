const { Pool } = require("pg");
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
    console.log("Cennected to database");

    await client.query("BEGIN");
    return client;
  } catch (error) {
    client.release();
    throw error;
  }
};

const commitTransaction = async client => {
  await client.query("COMMIT");
  console.log("Transaction committed");
  endTransaction(client);
};

const rollbackTransaction = async client => {
  await client.query("ROLLBACK");
  console.log("Transaction rollbacked");
  endTransaction(client);
};

const endTransaction = async client => {  
  await client.release();
  console.log("Disconnected from database");
}
/* --------------------- Check Connection --------------------- */

(async() => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DATABASE connected", res.rows[0].now);
  } catch (e) {
    console.log("DB connection error:\n" + e);
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
