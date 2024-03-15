import { Request, Response } from "express";
import * as messaging from "firebase-admin/messaging";

import { uploadImage } from "../aws";
import { transaction } from "../db/db";
import { clientError, serverError, success } from "../responses";
import { Draw, DrawItem, DrawAttenant, UserPush } from "../models";

import Logger from "../utils/logger/logger";
import { IReqNewDraw } from "../utils/types/requestTypes";
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

    const items = await DrawItem.findByDrawID(draw.id, client);
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

const getFeaturedDraws = async (req: Request, res: Response) => {
  Logger.debug("Getting featured draws ...");
  const client = await transaction.start();

  try {
    const draws = await Draw.getFeaturedDraws(client);
    if (!draws) {
      await transaction.end(client);
      success.noData(res);
    }

    success.success(res, { body: draws });
  } catch (err) {
    Logger.error(`Error Getting Best Draw:\n ${err}`);
    await transaction.end(client);
    serverError.serverError(res);
  }
};

/* ---------------- Insert Draws ---------------- */
/* ---------------------------------------------- */
const newDraw = async (req: IReqNewDraw, res: Response) => {
  Logger.debug(`Creating new Draw ...`);
  const client = await transaction.start();

  try {
    const { token, draw, items } = req.body;

    // Validate input
    validator.newDrawValidator(token, draw, items);

    // TODO -> Research whether I must be manually encrypting the token when transmitting
    if (token !== process.env.SECRET_PERSONAL) {
      Logger.error("Malicious secret token");
      return clientError.userNotAuthenticated(res);
    }

    // Insert the draw to the db
    const { id, title } = await Draw.register(draw, client);

    let totalValue = 0;

    // For each item
    items.map(async (item) => {
      // Insert the item to the db
      const { price } = await DrawItem.register(
        { ...item, drawId: id },
        client
      );
      totalValue += price;
      Logger.debug(`Item created`); // TODO -> remove after testing
    });

    // Push notification to all users
    const userTokens = await UserPush.getAllTokens(client);

    userTokens.forEach(
      async (token) =>
        await messaging
          .getMessaging()
          .send({
            token: token.pushToken,
            // data: data,  // TODO -> Pass the Draw and Items to render the draw when user clicks
            notification: {
              title: "New Raffle is up! ",
              body: `Hurry up to Opt In for the ${title}. Valuable items are waiting for you, with total value £${totalValue}`,
              imageUrl:
                "https://spectrum-brand.com/cdn/shop/articles/Cover_Photo.jpg?v=1617060405&width=1500", // TODO -> adjust/remove after testing
            },
          })
          .catch((err) =>
            Logger.error(`Error Sending Notifications For new Draw:\n\t${err}`)
          )
    );
    // TODO -> Email to all users

    transaction.commit(client);
    success.success(res, { message: `Draw created successfully` });
    Logger.debug(`Draw created successfully`);
  } catch (err) {
    Logger.error(`Error Creating new Draw:\n ${err}`);
    await transaction.rollback(client);
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

export {
  newDraw,
  getBestDraw,
  getUserDraws,
  getDrawItems,
  getCurrentDraws,
  getFeaturedDraws,
};
