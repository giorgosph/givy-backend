const transaction = require("./db").transaction;
const fs = require("fs");

const initTables = fs.readFileSync(__dirname + "/init.sql").toString();

const initialise = async () => {
  const client = await transaction.start();

  try {
    const result = await client.query(initTables);
    console.log(result);

    await transaction.commit(client);
  } catch (err) {
    console.error(err);
    await transaction.rollback(client);
  }
};

initialise();
