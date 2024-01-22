const DrawAttenant = require("../models").DrawAttenant;

const response = require("../responses");
const log = require("../utils/logger/logger");
const transaction = require("../db/db").transaction;
const validator = require("../utils/helperFunctions/dataValidation");

/* ---------------------- Get User --------------------------- */
/* ----------------------------------------------------------- */

const register = async (req, res) => {
  const { username } = req.decodedToken
  log.info(`Adding draw attenant for ${username} ...`);

  const client = await transaction.start();
  
  try {
    validator.confirmAccountValidator(username, req.body.drawId);
    
    const draw = await DrawAttenant.register({ drawId: req.body.drawId, username }, client);

    await transaction.commit(client);
    response.success.success(res, { body: { drawId: draw.drawId } });
    log.info(`Attenant added`);
  } catch (err) {
    await transaction.rollback(client);
    log.error(`Error Adding Draw Attenant for ${username}:\n ${err}`);
    response.serverError.serverError(res);
  }
};

module.exports = {
  register
}