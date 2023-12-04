const Draw = require("../models/index").Draw;
const DrawItem = require("../models/index").DrawItem;

const response = require("../responses/index");
const transaction = require("../db/db").transaction;

/* ---------------- Get Draws ---------------- */
/* ------------------------------------------- */

const getCurrentDraws = async (req, res) => {
  console.log("Getting current draws...");

  try {
    const client = await transaction.start();

    const draws = await Draw.getAll(client);
    if(!draws) return response.noData(res);
    
    const currentDate = new Date();

    // Filter draws where the closing date and time is not past the current date and time
    const currentDraws = draws.filter(draw => new Date(draw.closingDate) > currentDate);
    await transaction.end(client);

    if(!draws) return response.noData(res, { message : 'No upcoming draws!' });
    response.success(res, { body: currentDraws });
  } catch (error) {
    console.error("Error Getting Current Draws:\n", error);
    await transaction.end(client);
    response.error.generic(res);
  }
};

/* ---------------- Get Items ---------------- */
/* ------------------------------------------- */

const getDrawItems = async (req, res) => {
  console.log("Getting items for draw...");

  try {
    const client = await transaction.start();

    const items = await DrawItem.getByDrawID(req.params.drawId, client);
    await transaction.end(client);
    
    if(!items) return response.noData(res);
    response.success(res, { body: items });
  } catch (error) {
    console.error("Error Getting Current Draws:\n", error);
    await transaction.end(client);
    response.error.generic(res);
  }
};

module.exports = {
  getCurrentDraws,
  getDrawItems,
}