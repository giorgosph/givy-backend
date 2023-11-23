const extractToken = require("../utils/helperFunctions/jwt").extractToken;
const response = require("../responses/index")

function verifyToken(req, res, next) {
  console.log(`Verifying token...`);

  try {
    const token = extractToken(req);

    if (token) {
      req.decodedToken = token;
      next();
    } else response.auth.noPrivilages(res);
  } catch (err) {
    console.error("Error verifying token:\n", err.message);
    response.error.generic(res);
  }
}

function verifyUserApproved(req, res, next) {
  if (req.decodedToken.review === "approved") {
    next();
  } else {
    response.auth.noPrivilages(res);
  }
}

function verifyUserRole(requiredRole) {
  return (req, res, next) => {
    if (req.decodedToken.role === requiredRole) {
      next();
    } else {
      response.auth.noPrivilages(res);
    }
  };
}

function verifyAll(requiredRoles) {
  return (req, res, next) => {
    const token = extractToken(req);
    console.log("Token: ", token);
    if (
      token &&
      requiredRoles.includes(token.role) &&
      token.review === "approved"
    ) {
      req.decodedToken = token;
      next();
    } else {
      response.auth.noPrivilages(res);
    }
  };
}

module.exports = {
  verifyToken,
  verifyUserApproved,
  verifyUserRole,
  verifyAll,
};
