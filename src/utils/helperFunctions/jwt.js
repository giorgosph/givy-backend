const jwt = require("jsonwebtoken");
const response = require("../../responses/auth.response");

const signToken = (user, res) => {
  const payload = {
    username: user.username,
    email: user.email,
  };

  jwt.sign(payload, process.env.SECRET, (err, token) => response.sendToken(res, token));
};

module.exports = {
  signToken,
}