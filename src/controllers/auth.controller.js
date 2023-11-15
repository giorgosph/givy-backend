const User = require("../models/User.model");

const response = require("../utils/responses/auth.response");
const responseError = require("../utils/responses/error.response");

const hash = require("../utils/helperFunctions/hash").encrypt;
const signToken = require("../utils/helperFunctions/jwt").signToken;
const compareKeys = require("../utils/helperFunctions/hash").compareKeys;

const register = async (req, res) => {
  console.log("Creating new User...");

  try {
    const userExists = await User.findUser(req.body.username, req.body.email);
    if (userExists?.exist) return response.userExists(res, userExists.type);

    const hashed = await hash(req.body.password);
    const user = await User.register({ ...req.body, password: hashed });

    // TODO -> add record to activity table (?? through helper function)
    console.log("New User:\n", user);
    signToken(user, res);
  } catch (err) {
    // TODO -> create logging system
    console.error("Error Creating User:\n", err);
    responseError.generic(res);
  }
};

async function login(req, res) {
  try {
    let user = await User.findByUsername(req.body.username);
    if(!user) user = await User.findByEmail(req.body.username);
    if(!user) return response.userNotAuthenticated(res);

    // const authed = await compareKeys(req.body.password, user.password);
    const authed = req.body.password == user.password;
    if(!authed) return response.userNotAuthenticated(res);
    
    // TODO -> add record to activity table (?? through helper function)
    console.log("User logged in -> ", user.username);
    signToken(user, res);
  } catch (err) {
     // TODO -> create logging system
     console.error("Error Logging User:\n", err);
     responseError.generic(res);
  }
};

module.exports = {
  register,
  login,
}
