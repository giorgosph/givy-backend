const DrawAttenant = require("../models").DrawAttenant;

const response = require("../responses");
const transaction = require("../db/db").transaction;

/* ---------------------- Get User --------------------------- */
/* ----------------------------------------------------------- */

const register = async (req, res) => {
  console.log("Adding draw attenant...");
  const client = await transaction.start();
  
  try {
    const { username } = req.decodedToken

    const draw = await DrawAttenant.register({ drawId: req.body.drawId, username }, client);

    await transaction.commit(client);
    response.success.success(res, { body: { drawId: draw.drawId } });
  } catch (err) {
    await transaction.rollback(client);
    console.error("Error Adding Draw Attenant:\n", err);
    response.serverError.serverError(res);
  }
};

module.exports = {
  register
}