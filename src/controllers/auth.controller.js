const User = require("../models").User;
const UserActivity = require("../models").UserActivity;
const Confirmation = require("../models").Confirmation;

const response = require("../responses");
const transaction = require("../db/db").transaction;

const log = require("../utils/logger/logger");
const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");
const validator = require("../utils/helperFunctions/dataValidation");

const hash = require("../utils/helperFunctions/hash").encrypt;
const signToken = require("../utils/helperFunctions/jwt").signToken;
const compareKeys = require("../utils/helperFunctions/hash").compareKeys;
const extractRefreshToken = require("../utils/helperFunctions/jwt").extractRefreshToken;

require("dotenv").config();

/* ------------------------ Log In/Sign Up/Log Out ------------------------ */
/* ------------------------------------------------------------------------ */

const register = async (req, res) => {
  log.info("Creating new User ...");
  const { username, email, password } = req.body;
  const usernamePrefix = `${process.env.USERNAME_PREFIX}${username}`;
  
  const client = await transaction.start();
  
  try {
    // Validate data
    validator.registerValidator(req.body);

    // Check if the user's details are already registered
    const userExists = await User.findUser({ username: usernamePrefix, email }, client);
    if (userExists?.exist) {
      await transaction.end(client);
      log.info(`${userExists.type} already exist`);
      return response.clientError.userExists(res, userExists.type);
    }

    // Encrypt password 
    const hashed = await hash(password);

    // Register user 
    const user = await User.register({ ...req.body, username: usernamePrefix, password: hashed }, client);
    
    // Send confirmation email
    const randToken = genToken.random();
    await Confirmation.insert({type: 'email', username: usernamePrefix, code: randToken, notes: 'register'}, client);
    await emailer.send(randToken);

    // Send confirmation sms
    if(user.mobile) {
      const randToken = genToken.random();
      await Confirmation.insert({type: 'mobile', username: usernamePrefix, code: randToken, notes: 'register'}, client);
      log.debug(`Mobile Confirmation Code for ${usernamePrefix}: ${randToken}`); // TODO -> send confirmation sms
    }

    // Sign activities
    await UserActivity.insert({ username: usernamePrefix, type: 'login' }, client);
    await UserActivity.insert({ username: usernamePrefix, type: 'register' }, client);
    
    const payload = {
      username: user.username,
      email: user.email,
    };

    // Sign tokens
    const accessToken = signToken(payload, '30m');
    const refreshToken = signToken(payload, '7d', true);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      // sameSite: 'Strict', // Uncoment for production
      // secure: true // Uncoment for production
    });

    await transaction.commit(client);
    response.success.sendToken(res, accessToken, { body: { user, confirmed: { email: false, mobile: false }}});
    log.debug(`New User Created:\n ${user}`);
  } catch (err) {
    log.error(`Error Creating ${usernamePrefix}:\n${err}`);
    await transaction.rollback(client);
    response.serverError.serverError(res);
  } 
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const usernamePrefix = `${process.env.USERNAME_PREFIX}${username}`;
  log.info(`Logging in User ${usernamePrefix} ...`);
  
  const client = await transaction.start();
  
  try {
    // Validate data
    validator.loginValidator(username, password);

    // Check if the user exists
    let user = await User.findByUsername(usernamePrefix, client); // by username
    if(!user) user = await User.findByEmail(username, client); // by email
    if(!user) {
      await transaction.end(client);
      log.info(`${username} not found`);
      return response.clientError.userNotAuthenticated(res);
    }

    // Compare passwords
    const authed = await compareKeys(password, user.password);
    if(!authed) {
      await transaction.end(client);
      log.info(`password mismatch`);
      return response.clientError.userNotAuthenticated(res);
    }
    
    // Sign activity
    await UserActivity.update({ username: user.username, type: 'login' }, client);

    // Check if user has pending confirmations
    const email = await Confirmation.findUserWithType({ username: user.username, type: 'email' }, client);
    const mobile = await Confirmation.findUserWithType({ username: user.username, type: 'mobile' }, client);

    const payload = {
      username: user.username,
      email: user.email,
    };

    // Send token and commit database changes
    const accessToken = signToken(payload, '30m');
    const refreshToken = signToken(payload, '7d', true);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      // sameSite: 'Strict', // Uncoment for production
      // secure: true // Uncoment for production
    });

    await transaction.commit(client);
    response.success.sendToken(res, accessToken, { body: { user, confirmed: { email: !email, mobile: !mobile }}, status: 200 });
    log.info("User logged in -> ", usernamePrefix);
  } catch (err) {
     log.error(`Error Logging in ${usernamePrefix}:\n ${err}`);
     await transaction.rollback(client);
     response.serverError.serverError(res);
  }
};

const logout = async (req, res) => {
  const { username } = req.decodedToken;
  log.info(`Logging out: ${username}`);

  try {
    await req.session.destroy();
    await res.clearCookie('refreshToken');
    
    response.success.success(res);
    log.info(`Log out successfully`);
  } catch (err) {
    log.error(`Error Logging out ${username}:\n ${err}`);
    response.serverError.serverError(res);
  }

};

/* --------------------- Confirm email/mobile --------------------- */
/* ---------------------------------------------------------------- */

const confirmAccount = async (req, res) => {
  const { type } = req.body;
  const { username } = req.decodedToken;
  const usernamePrefix = `${process.env.USERNAME_PREFIX}${username}`;

  log.info(`Confirming ${type} for ${usernamePrefix} ...`);

  const client = await transaction.start();
  
  try {
    // Validate data
    validator.confirmAccountValidator(username, type);

    // Get User's confirmation info
    const user = await Confirmation.findUserWithType({ username: usernamePrefix, type}, client);
    if(!user) throw new Error(`User tries to confirm ${type} without confirmation code`);

    // Check if code provided is valid
    if(user.code == req.body.code) {
      await Confirmation.delete({ username: user.username, type }, client);
      await UserActivity.upsert({ username: user.username, type: `${type}_confirmation` }, client);
    } else {
      transaction.end(client);
      log.info(`| AC | Invalid code: ${req.body.code}`);
      return response.clientError.userNotAuthenticated(res);
    }

    await transaction.commit(client);
    response.success.success(res, { body: { confirm: type }});

    log.info(`Account confirmed (${type})`);
  } catch (err) {
    log.error(`Error Confirming ${type} for ${usernamePrefix}:\n ${err}`);
    await transaction.rollback(client);
    response.serverError.serverError(res);
  }
};

/* ----------------------- Password Related ----------------------- */
/* ---------------------------------------------------------------- */

const forgotPassword = async (req, res) => {
  const { email, code, password } = req.body;
  log.info(`Setting new password for ${email} ...`);
  
  const client = await transaction.start();
  
  try {
    validator.loginValidator(email, password);

    const type = 'forgot_password';
    if(password !== req.body.confirmPassword) throw new Error("Passwords do not match!");

    // Get User
    const user = await User.findByEmail(email, client);
    if(!user) {
      await transaction.end(client);
      log.info(`User not found ${email}`);
      return response.clientError.userNotAuthenticated(res);
    }

    const username = user.username;

    // Get User's confirmation info
    const userCode = await Confirmation.findUserWithType({ username, type }, client);
    if(!userCode) throw new Error(`User tries to set new password without confirmation code`);

    // Check if code provided is valid
    if(userCode.code == code) {
      const hashedPassword = await hash(password); // Encrypt password

      await Confirmation.delete({ username, type }, client); // Delete the confirmation entry
      await User.updatePassword({ username, password: hashedPassword }, client); // Update the password
      await UserActivity.upsert({ username, type: 'reset_password' }, client); // Sign the activity
    } else {
      transaction.end(client);
      log.warn(`| FP | Invalid code: ${code}`);
      return response.clientError.userNotAuthenticated(res);
    }

    // Check if user has pending confirmations
    const mobile = await Confirmation.findUserWithType({ username: user.username, type: 'mobile' }, client);
    const emailExist = await Confirmation.findUserWithType({ username: user.username, type: 'email' }, client);
  
    const payload = {
      username: user.username,
      email: user.email,
    };

    // Send token and commit database changes
    const accessToken = signToken(payload, '30m');
    const refreshToken = signToken(payload, '7d', true);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true, 
      // sameSite: 'Strict', // TODO -> Uncomment and test for production
      // secure: true // Uncoment for production
    });

    await transaction.commit(client);
    response.success.sendToken(res, accessToken, { body: { user, pass: true, confirmed: { email: !emailExist, mobile: !mobile }}});
    log.info(`| FP | Password changed`);
  } catch (err) {
    log.error(`Error Setting new password for ${email}:\n ${err}`);
    await transaction.rollback(client);
    response.serverError.serverError(res);
  }
};

const resetPassword = async (req, res) => {
  const { username } = req.decodedToken;
  log.info(`Resetting password for ${username} ...`);
  
  const client = await transaction.start();
  
  try {
    const { password } = req.body;
    const type = 'reset_password';

    validator.loginValidator(username, password);

    if(password !== req.body.confirmPassword) throw new Error("Passwords do not match!");

    const user = await User.findByUsername(username, client);
    if(!user) {
      await transaction.end(client);
      log.warn(`| RP | User not found`)
      return response.clientError.userNotAuthenticated(res);
    }

    const hashedPassword = await hash(password); 
    await User.updatePassword({ username, password: hashedPassword }, client); 
    await UserActivity.upsert({ username, type }, client); 

    await transaction.commit(client);
    response.success.success(res, { body: { pass: true }});
    log.info(`| RP | Password changed`);
  } catch (err) {
    log.error(`Error Resetting password for ${username}:\n ${err}`);
    await transaction.rollback(client);
    response.serverError.serverError(res);
  }
};

/* ----------------------- Token Related ----------------------- */
/* ------------------------------------------------------------- */

const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  log.info(`Resetting token using -> ${refreshToken} ...`);

  if (!refreshToken) {
    log.warn('No refresh token');
    return response.clientError.noPrivilages(res);
  }

  try {
    const decoded = extractRefreshToken(refreshToken);
    const payload = {
      username: decoded.username,
      email: decoded.email,
    };

    const newAccessToken = signToken(payload, '30m');

    response.success.success(res, { body: `Bearer ${newAccessToken}` });
    log.info(`New token has been sent`);
  } catch (error) {
    log.warn('Invalid refresh token');
    return response.clientError.noPrivilages(res);
  }
};

module.exports = {
  login,
  logout,
  register,
  refreshToken,
  resetPassword,
  forgotPassword,
  confirmAccount,
}
