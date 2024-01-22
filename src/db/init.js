const transaction = require("./db").transaction;
const log = require("../utils/logger/logger");
const fs = require("fs");

const initTables = fs.readFileSync(__dirname + "/init.sql").toString();

const initialise = async () => {
  const client = await transaction.start();

  try {
    const result = await client.query(initTables);
    log.debug(result);

    await transaction.commit(client);
  } catch (err) {
    log.error(`Initialising database:\n ${err}`);
    await transaction.rollback(client);
  }
};

initialise();
