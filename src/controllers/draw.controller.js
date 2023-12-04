const Draw = require("../models/index").Draw;

const response = require("../responses/index");
const transaction = require("../db/db").transaction;

const getCurrentDraws = async (req, res) => {
  console.log("Getting current draws...");

  try {
    const client = await transaction.start();

    const draws = await Draw.getAll(client);
    if(!draws) return response.noData(res);
    
    const currentDate = new Date();

    // Filter draws where the closing date and time is not past the current date and time
    const currentDraws = draws.filter(draw => new Date(draw.closingDate) > currentDate);
    if(!draws) return response.noData(res, { message : 'No upcoming draws!' });

    await transaction.end(client);

    response.success(res, { body: currentDraws });
  } catch (error) {
    console.error("Error Getting Current Draws:\n", error);
    await transaction.end(client);
    response.error.generic(res);
  }
};

module.exports = {
  getCurrentDraws,
}