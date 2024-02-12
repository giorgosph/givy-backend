import { Response } from "express";

import { transaction } from "../db/db";
import { serverError, success } from "../responses";
import DrawAttenant from "../models/DrawAttenant.model";

import Logger from "../utils/logger/logger";
import { IReqOptIn } from "../utils/types/requestTypes";
import * as validator from "../utils/helperFunctions/dataValidation";

/* ---------------------- Get User --------------------------- */
/* ----------------------------------------------------------- */
const register = async (req: IReqOptIn, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Adding draw attenant for ${username} ...`);

  const client = await transaction.start();

  try {
    validator.confirmAccountValidator(username, req.body.drawId);

    const draw = await DrawAttenant.register(
      { drawId: req.body.drawId, username },
      client
    );

    await transaction.commit(client);
    success.success(res, { body: { drawId: draw.drawId } });
    Logger.info(`Attenant added`);
  } catch (err) {
    await transaction.rollback(client);
    Logger.error(`Error Adding Draw Attenant for ${username}:\n ${err}`);
    serverError.serverError(res);
  }
};

export { register };
