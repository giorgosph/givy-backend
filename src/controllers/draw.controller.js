const Draw = require("../models").Draw;
const DrawItem = require("../models").DrawItem;
const DrawAttenant = require("../models").DrawAttenant;

const response = require("../responses");
const transaction = require("../db/db").transaction;

const log = require("../utils/logger/logger");
const validator = require("../utils/helperFunctions/dataValidation");

/* ---------------- Get Draws ---------------- */
/* ------------------------------------------- */

const getCurrentDraws = async (req, res) => {
  log.debug("Getting current draws ...");
  const client = await transaction.start();
  
  try {
    const draws = await Draw.getUpcomingDraws(client);
    await transaction.end(client);
    if(!draws) return response.success.noData(res);

    response.success.success(res, { body: draws });
  } catch (err) {
    log.error(`Error Getting Current Draws:\n ${err}`);
    await transaction.end(client);
    response.serverError.serverError(res);
  }
};

const getUserDraws = async (req, res) => {
  const { username } = req.decodedToken;
  const client = await transaction.start();
  log.debug(`Getting user draws for ${username} ...`);

  try {
    validator.usernameValidator(username);

    const draws = await DrawAttenant.findUpcomingByUsername(username, client); // opted in draws
    const wins = await DrawItem.findByWinner(username, client); // winning items
    await transaction.end(client);
    if(draws.length == 0 && wins.length == 0) return response.success.noData(res);

    response.success.success(res, { body: { draws, wins} });
  } catch (err) {
    log.error(`Error Getting User Draws for ${username}:\n ${err}`);
    await transaction.end(client);
    response.serverError.serverError(res);
  }
};

/* ---------------- Get Items ---------------- */
/* ------------------------------------------- */

const getDrawItems = async (req, res) => {
  const drawId = req.params.drawId;
  log.debug(`Getting items for draw ${drawId} ...`);
  const client = await transaction.start();

  try {
    validator.generalValidator(drawId);

    const items = await DrawItem.findByDrawID(drawId, client);
    await transaction.end(client);
    
    if(!items) return response.success.noData(res);
    response.success.success(res, { body: items });
  } catch (err) {
    log.error(`Error Getting Current Draws:\n ${err}`);
    await transaction.end(client);
    response.serverError.serverError(res);
  }
};

module.exports = {
  getUserDraws,
  getDrawItems,
  getCurrentDraws,
}