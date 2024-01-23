const jwt = require("jsonwebtoken");
const log = require("../logger/logger");

const signToken = (payload, expirationPeriod, refresh=false) => {
  const { SECRET, SECRET_REFRESH } = process.env

  const token = jwt.sign(payload, refresh ? SECRET_REFRESH : SECRET, { expiresIn: expirationPeriod });
  return token;
};

const extractToken = (req) => {
  const header = req.headers["authorization"];

  if (header) {
    const token = header.split(" ")[1].trim();

    try {
      const decodedToken = jwt.verify(token, process.env.SECRET);
      log.debug(`Decoded Token:\n ${JSON.stringify(decodedToken)}`);

      return decodedToken;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        log.warn('Token has expired');
        
        return 'refresh-token';
      }else throw new Error(err); 
    }
    
  }else log.warn("No Authorization Header");
};

const extractRefreshToken = (token) => {
  const decodedToken = jwt.verify(token, process.env.SECRET_REFRESH);
  log.debug(`Decoded Refresh Token:\n ${JSON.stringify(decodedToken)}`);

  return decodedToken;
};

module.exports = {
  signToken,
  extractToken,
  extractRefreshToken,
}