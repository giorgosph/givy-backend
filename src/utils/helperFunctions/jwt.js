const jwt = require("jsonwebtoken");
const response = require("../../responses/auth.response");

const signToken = (user, res) => {
  const payload = {
    username: user.username,
    email: user.email,
  };

  jwt.sign(payload, process.env.SECRET, (err, token) => response.sendToken(res, token));
};

const extractToken = (req) => {
  const header = req.headers["authorization"];

  if (header) {
    const token = header.split(" ")[1].trim();
    const decodedToken = jwt.verify(token, process.env.SECRET);
    console.log("Decoded Token:\n", decodedToken);
    
    return decodedToken;
  }
};

module.exports = {
  signToken,
  extractToken,
}