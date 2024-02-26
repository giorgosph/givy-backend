import { Request, Response } from "express";

import { TopWinner } from "../models";
import { transaction } from "../db/db";
import { clientError, serverError, success } from "../responses";

import Logger from "../utils/logger/logger";

const topWinners = async (req: Request, res: Response) => {
  Logger.info(`Getting Top Winners ...`);

  const client = await transaction.start();

  try {
    const winners = await TopWinner.get(client);
    if (!winners) {
      await transaction.end(client);
      Logger.warn(`No Top Winners Found`);
      return clientError.userNotAuthenticated(res);
    }

    success.success(res, { body: winners });
    Logger.info("Top Winners fetched");
  } catch (err) {
    await transaction.end(client);
    Logger.error(`Error Getting Top Winners:\n ${err}`);
    serverError.serverError(res);
  }
};

export { topWinners };
