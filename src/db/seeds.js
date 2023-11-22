const db = require("./db.js");
const fs = require("fs");

const seedTables = fs.readFileSync(__dirname + "/seeds.sql").toString();

const seed = async () => {
  const client = await transaction.start();

  try {
    const result = client.query(seedTables)
    console.log(result);

    await transaction.commit(client);
  } catch (err) {
    console.error(err);
    await transaction.rollback(client);
  }
};

seed();

