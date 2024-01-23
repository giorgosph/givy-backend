const extractToken = require("../utils/helperFunctions/jwt").extractToken;
const response = require("../responses/index");
const log = require("../utils/logger/logger");

function verifyToken(req, res, next) {
  log.debug(`Verifying token ...`);

  try {
    const token = extractToken(req);

    if(token) {
      if(token === 'refresh-token') return response.clientError.refreshToken(res);

      req.decodedToken = token;
      next();
    }else response.clientError.noPrivilages(res);

  } catch (err) {
    log.error(`Error verifying token:\n ${err}`);
    response.serverError.serverError(res);
  }
};

module.exports = {
  verifyToken,
};
