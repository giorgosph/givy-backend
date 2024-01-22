const extractToken = require("../utils/helperFunctions/jwt").extractToken;
const response = require("../responses/index");
const log = require("../utils/logger/logger");

function verifyToken(req, res, next) {
  log.debug(`Verifying token ...`);

  try {
    const token = extractToken(req);

    if (token) {
      req.decodedToken = token;
      next();
    } else response.clientError.noPrivilages(res);
  } catch (err) {
    log.error(`Error verifying token:\n ${err}`);
    response.serverError.serverError(res);
  }
}

function verifyUserApproved(req, res, next) {
  if (req.decodedToken.review === "approved") {
    next();
  } else {
    response.clientError.noPrivilages(res);
  }
}

function verifyUserRole(requiredRole) {
  return (req, res, next) => {
    if (req.decodedToken.role === requiredRole) {
      next();
    } else {
      response.clientError.noPrivilages(res);
    }
  };
}

function verifyAll(requiredRoles) {
  return (req, res, next) => {
    const token = extractToken(req);
    log.debug("Token: ", token);
    if (
      token &&
      requiredRoles.includes(token.role) &&
      token.review === "approved"
    ) {
      req.decodedToken = token;
      next();
    } else {
      response.clientError.noPrivilages(res);
    }
  };
}

module.exports = {
  verifyToken,
  verifyUserApproved,
  verifyUserRole,
  verifyAll,
};
