const User = require("../models/index").User;
const UserActivity = require("../models/index").UserActivity;

const transaction = require("../db/db").transaction;
const response = require("../responses/index");

const hash = require("../utils/helperFunctions/hash").encrypt;
const signToken = require("../utils/helperFunctions/jwt").signToken;
const compareKeys = require("../utils/helperFunctions/hash").compareKeys;

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

    // Register user and sign activities
    const user = await User.register({ ...req.body, password: hashed }, client);
    await UserActivity.insertActivity({ username, type: 'register' }, client);
    await UserActivity.insertActivity({ username, type: 'login' }, client);
    
    // Commit database changes
    await transaction.commit(client);
    console.log("New User:\n", user);

    signToken(user, res);
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
    // const authed = await compareKeys(req.body.password, user.password);
    const authed = password == user.password;
    if(!authed) {
      await transaction.end(client);
      return response.auth.userNotAuthenticated(res);
    }
    
    // Sign activity and commit to database
    await UserActivity.updateActivity({username, type: 'login'}, client);
    await transaction.commit(client);
    console.log("User logged in -> ", user.username);

    signToken(user, res);
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
