const Draw = require("../models/index").Draw;

const response = require("../responses/index");
const transaction = require("../db/db").transaction;

const getAll = async (req, res) => {
  console.log("Getting all draws...");

  try {
    const client = await transaction.start();

    const draws = await Draw.getAll(client);
    await transaction.end(client);

    response.success(res, { body: draws });
  } catch (error) {
    await transaction.end(client);
    console.error("Error Getting All Draws:\n", err);
    response.error.generic(res);
  }
};

module.exports = {
  getAll,
}