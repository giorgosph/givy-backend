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

// NOTE:
// if user is present in confirmation table then confirmation is pending
// after confirmation is successful remove from confirmation table and insert to user activity
/* -------------------------------------------------------------------------- */

const register = async (req, res) => {
  console.log("Creating new User...");
  const { username, email, password } = req.body;
  
  const client = await transaction.start();
  
  try {
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
    await emailer.send();

    // Sign activities
    await UserActivity.insert({ username, type: 'register' }, client);
    await UserActivity.insert({ username, type: 'login' }, client);
    
    // Send token and commit database changes
    const token = signToken(user);
    await transaction.commit(client);
    response.auth.sendToken(res, { body: { user, token: `Bearer ${token}`, confirmed: { email: false, mobile: true}}})
    console.log("New User Created:\n", user);
  } catch (err) {
    // TODO -> create logging system
    console.error(`Error Creating ${username}:\n`, err);
    await transaction.rollback(client);
    response.error.generic(res);
  } 
};

const login = async (req, res) => {
  console.log("Loging in User...");
  const { username, password } = req.body;
  
  const client = await transaction.start();
  
  try {
    // Check if the user exists
    let user = await User.findByUsername(username, client); // by username
    if(!user) user = await User.findByEmail(username, client); // by email
    if(!user) {
      await transaction.end(client);
      return response.auth.userNotAuthenticated(res);
    }

    // Compare passwords
    const authed = await compareKeys(password, user.password);
    if(!authed) {
      await transaction.end(client);
      return response.auth.userNotAuthenticated(res);
    }
    
    // Sign activity
    await UserActivity.update({username, type: 'login'}, client);
    const email = await Confirmation.findUserWithType({ username: user.username, type: 'email' }, client);
    const mobile = await Confirmation.findUserWithType({ username: user.username, type: 'mobile' }, client);

    // Send token and commit database changes
    const token = signToken(user);
    await transaction.commit(client);
    response.auth.sendToken(res, { body: { user, token: `Bearer ${token}`, confirmed: { email: !email, mobile: !mobile }}});
    console.log("User logged in -> ", user.username);
  } catch (err) {
     // TODO -> create logging system
     console.error(`Error Logging ${username}:\n`, err);
     await transaction.rollback(client);
     response.error.generic(res);
  }
};

/* --------------------- Confirm email/mobile --------------------- */

const confirmAccount = async (req, res) => {
  const { type } = req.body;
  const { username } = req.decodedToken;
  console.log(`Confirming ${type} for ${username}...`);

  const client = await transaction.start();
  
  try {
    const user = await Confirmation.findUserWithType({ username, type}, client);
    if(!user) throw new Error('User tries to confirm email address without confirmation code');

    if(user.code != req.body.code) {
      transaction.end(client);
      return response.auth.userNotAuthenticated(res);
    } else await Confirmation.delete({ username, type }, client);

    await transaction.commit(client);
    response.success(res);
  } catch (err) {
    console.error(`Error Confirming ${type} for ${username}:\n`, err);
    await transaction.rollback(client);
    response.error.generic(res);
  }
};

module.exports = {
  register,
  login,
  confirmAccount,
}
