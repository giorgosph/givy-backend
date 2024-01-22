const transaction = require("./db.js").transaction;
const log = require("../utils/logger/logger");
const fs = require("fs");

const seedTables = fs.readFileSync(__dirname + "/seeds.sql").toString();

const seed = async () => {
  const client = await transaction.start();

  try {
    const result = await client.query(seedTables);
    log.debug(result);

    await transaction.commit(client);
  } catch (err) {
    log.error(`Adding seeds to database:\n ${err}`);
    await transaction.rollback(client);
  }
};

seed();

