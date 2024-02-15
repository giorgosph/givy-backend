import { Request, Response } from "express";

import { transaction } from "../db/db";
import { serverError, success } from "../responses";
import { Draw, DrawItem, DrawAttenant } from "../models";

import Logger from "../utils/logger/logger";
import * as validator from "../utils/helperFunctions/dataValidation";

/* ---------------- Get Draws ---------------- */
/* ------------------------------------------- */

const getCurrentDraws = async (req: Request, res: Response) => {
  Logger.debug("Getting current draws ...");
  const client = await transaction.start();

  try {
    const draws = await Draw.getUpcomingDraws(client);
    await transaction.end(client);
    if (!draws) return success.noData(res);

    success.success(res, { body: draws });
  } catch (err) {
    Logger.error(`Error Getting Current Draws:\n ${err}`);
    await transaction.end(client);
    serverError.serverError(res);
  }
};

const getBestDraw = async (req: Request, res: Response) => {
  Logger.debug("Getting best draw ...");
  const client = await transaction.start();

  try {
    const draw = await Draw.getBestDraw(client);
    if (!draw) {
      await transaction.end(client);
      success.noData(res);
    }

    const items = DrawItem.findByDrawID(draw.id, client);
    await transaction.end(client);

    if (!items) return success.noData(res);
    success.success(res, { body: { draw, items } });
  } catch (err) {
    Logger.error(`Error Getting Best Draw:\n ${err}`);
    await transaction.end(client);
    serverError.serverError(res);
  }
};

const getUserDraws = async (req: Request, res: Response) => {
  const username = req.decodedToken!.username;
  const client = await transaction.start();
  Logger.debug(`Getting user draws for ${username} ...`);

  try {
    validator.usernameValidator(username);

    const draws = await DrawAttenant.findUpcomingByUsername(username, client); // opted in draws
    const wins = await DrawItem.findByWinner(username, client); // winning items
    await transaction.end(client);
    if (draws.length === 0 && wins.length === 0) return success.noData(res);

    success.success(res, { body: { draws, wins } });
  } catch (err) {
    Logger.error(`Error Getting User Draws for ${username}:\n ${err}`);
    await transaction.end(client);
    serverError.serverError(res);
  }
};

/* ---------------- Get Items ---------------- */
/* ------------------------------------------- */

const getDrawItems = async (req: Request, res: Response) => {
  const { drawId } = req.params;
  Logger.debug(`Getting items for draw ${drawId} ...`);
  const client = await transaction.start();

  try {
    validator.generalValidator(drawId);

    const items = await DrawItem.findByDrawID(Number(drawId), client);
    await transaction.end(client);

    if (!items) return success.noData(res);
    success.success(res, { body: items });
  } catch (err) {
    Logger.error(`Error Getting Current Draws:\n ${err}`);
    await transaction.end(client);
    serverError.serverError(res);
  }
};

export { getUserDraws, getDrawItems, getCurrentDraws, getBestDraw };
