const { Pool } = require("pg");
require("dotenv").config();

let pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  //for local development with dockerized db
  pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASS,
    port: process.env.DATABASE_PORT,
  });
}

//anonymous function to check connection to db
(async function () {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DATABASE connected", res.rows[0].now);
  } catch (e) {
    console.log("DB connection error:\n" + e);
  }
})();

module.exports = pool;
