const jwt = require("jsonwebtoken");

const extractToken = (req) => {
  const header = req.headers["authorization"];
  if (header) {
    const token = header.split(" ")[1].trim();
    console.log("RESET:\n", token);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    return decodedToken;
  }
};

function verifyToken(req, res, next) {
  console.log(req.headers);
  try {
    const token = extractToken(req);
    if (token) {
      req.decodedToken = token;
      next();
    } else {
      res.status(403).send({ success: false, message: "No token provided!" });
    }
  } catch (err) {
    console.error("Error verifying token:\n", err.message);
    res.status(403).send({ success: false });
  }
}

function verifyUserApproved(req, res, next) {
  if (req.decodedToken.review === "approved") {
    next();
  } else {
    res.status(403).send({ success: false, message: "User not approved" });
  }
}

function verifyUserRole(requiredRole) {
  return (req, res, next) => {
    if (req.decodedToken.role === requiredRole) {
      next();
    } else {
      res.status(403).send({
        success: false,
        message: "User does not meet role requirement",
      });
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
      res.status(403).send({
        success: false,
        message: "User could not be authenticated",
      });
    }
  };
}

module.exports = {
  verifyToken,
  verifyUserApproved,
  verifyUserRole,
  verifyAll,
};
