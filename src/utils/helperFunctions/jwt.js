const jwt = require("jsonwebtoken");
const log = require("../logger/logger");

const signToken = (user) => {
  const payload = {
    username: user.username,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.SECRET);
  return token;
};

const extractToken = (req) => {
  const header = req.headers["authorization"];

  if (header) {
    const token = header.split(" ")[1].trim();
    const decodedToken = jwt.verify(token, process.env.SECRET);
    log.debug(`Decoded Token:\n ${JSON.stringify(decodedToken)}`);
    
    return decodedToken;
  }else log.warn("No Authorization Header");
};

module.exports = {
  signToken,
  extractToken,
}