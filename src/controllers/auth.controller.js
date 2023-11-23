const User = require("../models/index").User;
const UserActivity = require("../models/index").UserActivity;
const Confirmation = require("../models/index").Confirmation;

const transaction = require("../db/db").transaction;
const response = require("../responses/index");

const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");
const hash = require("../utils/helperFunctions/hash").encrypt;
const signToken = require("../utils/helperFunctions/jwt").signToken;
const compareKeys = require("../utils/helperFunctions/hash").compareKeys;

/* -------------------------------------------------------------------------- */

const register = async (req, res) => {
  console.log("Creating new User...");
  const client = await transaction.start();
  
  try {
    const { username, email, password } = req.body;

    // Check if the user's details are already registered
    const userExists = await User.findUser({ username, email }, client);
    if (userExists?.exist) {
      await transaction.end(client);
      return response.auth.userExists(res, userExists.type);
    }

    // Encrypt password 
    const hashed = await hash(password);

    // Register user and send confirmation email
    const user = await User.register({ ...req.body, password: hashed }, client);
    const randToken = genToken.random();
    await Confirmation.insert({type: 'email', username, code: randToken, notes: 'register'}, client);
    // TODO -> add confirmation and send sms for mobile
    await emailer.send();

    // Sign activities
    await UserActivity.insert({ username, type: 'register' }, client);
    await UserActivity.insert({ username, type: 'login' }, client);
    
    // Send token and commit database changes
    signToken(user, res);
    await transaction.commit(client);
    console.log("New User:\n", user);
  } catch (err) {
    // TODO -> create logging system
    await transaction.rollback(client);
    console.error("Error Creating User:\n", err);
    response.error.generic(res);
  } 
};

const login = async (req, res) => {
  console.log("Loging in User...");
  const client = await transaction.start();
  
  try {
    const { username, password } = req.body;

    // Check if the user exists
    let user = await User.findByUsername(username, client);
    if(!user) user = await User.findByEmail(username, client);
    if(!user) {
      await transaction.end(client);
      return response.auth.userNotAuthenticated(res);
    }

    // Compare passwords
    const authed = await compareKeys(password, user.password);
    // const authed = password == user.password;
    if(!authed) {
      await transaction.end(client);
      return response.auth.userNotAuthenticated(res);
    }
    
    // Sign activity
    await UserActivity.update({username, type: 'login'}, client);
    
    // Send token and commit database changes
    signToken(user, res);
    await transaction.commit(client);
    console.log("User logged in -> ", user.username);
  } catch (err) {
     // TODO -> create logging system
     console.error("Error Logging User:\n", err);
     await transaction.rollback(client);
     response.error.generic(res);
  }
};

module.exports = {
  register,
  login,
}
