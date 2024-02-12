import fs from "fs";

import { transaction } from "./db";
import Logger from "../utils/logger/logger";

const initTables = fs.readFileSync(__dirname + "/init.sql", "utf-8");

const initialise = async () => {
  const client = await transaction.start();

  try {
    Logger.debug("Connected to database");

    const result = await client.query(initTables);
    Logger.debug(String(result));

    await transaction.commit(client);
  } catch (err) {
    Logger.error(`Initialising database:\n ${err}`);
    await transaction.rollback(client);
  }
};

initialise();
