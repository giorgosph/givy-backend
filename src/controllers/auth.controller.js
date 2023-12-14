const User = require("../models").User;
const UserActivity = require("../models").UserActivity;
const Confirmation = require("../models").Confirmation;

const response = require("../responses");
const transaction = require("../db/db").transaction;

const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");
const hash = require("../utils/helperFunctions/hash").encrypt;
const signToken = require("../utils/helperFunctions/jwt").signToken;
const compareKeys = require("../utils/helperFunctions/hash").compareKeys;

/* ------------------------ Log In/Sign Up ------------------------ */
/* ---------------------------------------------------------------- */

const register = async (req, res) => {
  console.log("Creating new User...");
  const { username, email, password } = req.body;
  
  const client = await transaction.start();
  
  try {
    // Check if the user's details are already registered
    const userExists = await User.findUser({ username, email }, client);
    if (userExists?.exist) {
      await transaction.end(client);
      return response.clientError.userExists(res, userExists.type);
    }

    // Encrypt password 
    const hashed = await hash(password);

    // Register user 
    const user = await User.register({ ...req.body, password: hashed }, client);
    
    // Send confirmation email
    const randToken = genToken.random();
    await Confirmation.insert({type: 'email', username, code: randToken, notes: 'register'}, client);
    await emailer.send(randToken);

    // Send confirmation sms
    if(user.mobile) {
      const randToken = genToken.random();
      await Confirmation.insert({type: 'mobile', username, code: randToken, notes: 'register'}, client);
      console.log(`Mobile Confirmation Code for ${username}: ${randToken}`); // TODO -> send confirmation sms
    }

    // Sign activities
    await UserActivity.insert({ username, type: 'login' }, client);
    await UserActivity.insert({ username, type: 'register' }, client);
    
    // Send token and commit database changes
    const token = signToken(user);
    await transaction.commit(client);
    response.success.sendToken(res, token, { body: { user, confirmed: { email: false, mobile: false }}});
    console.log("New User Created:\n", user);
  } catch (err) {
    // TODO -> create logging system
    console.error(`Error Creating ${username}:\n`, err);
    await transaction.rollback(client);
    response.serverError.serverError(res);
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
      return response.clientError.userNotAuthenticated(res);
    }

    // Compare passwords
    const authed = await compareKeys(password, user.password);
    if(!authed) {
      await transaction.end(client);
      return response.clientError.userNotAuthenticated(res);
    }
    
    // Sign activity
    await UserActivity.update({username, type: 'login'}, client);
    const email = await Confirmation.findUserWithType({ username: user.username, type: 'email' }, client);
    const mobile = await Confirmation.findUserWithType({ username: user.username, type: 'mobile' }, client);

    // Send token and commit database changes
    const token = signToken(user);
    await transaction.commit(client);
    response.success.sendToken(res, token, { body: { user, confirmed: { email: !email, mobile: !mobile }}, status: 200 });
    console.log("User logged in -> ", user.username);
  } catch (err) {
     // TODO -> create logging system
     console.error(`Error Logging ${username}:\n`, err);
     await transaction.rollback(client);
     response.serverError.serverError(res);
  }
};

/* --------------------- Confirm email/mobile --------------------- */
/* ---------------------------------------------------------------- */

const confirmAccount = async (req, res) => {
  const { type } = req.body;
  const { username } = req.decodedToken;
  console.log(`Confirming ${type} for ${username}...`);

  const client = await transaction.start();
  
  try {
    // Get User's confirmation info
    const user = await Confirmation.findUserWithType({ username, type}, client);
    if(!user) throw new Error('User tries to confirm email address without confirmation code');

    // Check if code provided is valid
    if(user.code == req.body.code) {
      await Confirmation.delete({ username, type }, client);
      await UserActivity.upsert({ username, type: `${type}_confirmation` }, client);
    } else {
      transaction.end(client);
      return response.clientError.userNotAuthenticated(res);
    }

    await transaction.commit(client);
    response.success.success(res, { body: { confirm: type }});
  } catch (err) {
    console.error(`Error Confirming ${type} for ${username}:\n`, err);
    await transaction.rollback(client);
    response.serverError.serverError(res);
  }
};

module.exports = {
  register,
  login,
  confirmAccount,
}
