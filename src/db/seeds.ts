import fs from "fs";
import { PoolClient } from "pg";

import { transaction } from "./db";
import { Logger } from "../utils/logger/logger";

const seedTables = fs.readFileSync(__dirname + "/seeds.sql").toString();

const seed = async () => {
  const client = await transaction.start();

  try {
    const result = await client.query(seedTables);
    Logger.debug(result);

    await transaction.commit(client);
  } catch (err) {
    Logger.error(`Adding seeds to database:\n ${err}`);
    await transaction.rollback(client);
  }
};

seed();
