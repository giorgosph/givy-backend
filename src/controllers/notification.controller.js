const User = require("../models").User;
const Confirmation = require("../models").Confirmation;

const response = require("../responses");
const transaction = require("../db/db").transaction;

const log = require("../utils/logger/logger");
const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");
const validator = require("../utils/helperFunctions/dataValidation");

/* ------------------- Confirmations ------------------- */
/* ----------------------------------------------------- */

const emailWithCode = async (req, res) => {
  const { username } = req.decodedToken;
  log.info(`Sending email to ${username} ...`);

  const client = await transaction.start();

  try {
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if(!user) {
      await transaction.end(client);
      log.warn(`| EWC | User not found`);
      return response.clientError.userNotAuthenticated(res, { body: { type: 'Email' }});
    }

    const randToken = genToken.random();
    await Confirmation.update({type: 'email', username, code: randToken, notes: 'resend'}, client);
    await emailer.send(randToken); // add receiver user.email

    transaction.commit(client);
    response.success.success(res, { body: { type: 'Email' }});
    log.info('Email sent successfully');
  } catch (err) {
    log.error(`Error Sending Email with Code to ${username}:\n ${err}`);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending email!\n Please contact support team." });
  }
};

const smsWithCode = async (req, res) => {
  const { username } = req.decodedToken;
  log.info(`Sending SMS to ${username} ...`);

  const client = await transaction.start();

  try {
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if(!user) {
      await transaction.end(client);
      log.warn(`| SWC | User not found`);
      return response.clientError.userNotAuthenticated(res, { body: { type: 'SMS' }});
    }

    const randToken = genToken.random();
    await Confirmation.update({type: 'mobile', username, code: randToken, notes: 'resend'}, client);
    log.debug(`Mobile Confirmation Code for ${username}: ${randToken}`); // TODO -> send confirmation sms

    transaction.commit(client);
    response.success.success(res, { body: { type: 'SMS' }});
    log.info('SMS sent successfully');
  } catch (err) {
    log.error(`Error Sending SMS with Code to ${username}:\n ${err}`);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending SMS!\n Please contact support team." });
  }
};

const emailForgotPassword = async (req, res) => {
  const { email } = req.body;
  log(`Sending email to ${email} ...`);

  const client = await transaction.start();

  try {
    validator.emailValidator(email);
    
    const user = await User.findByEmail(email, client);
    if(!user) {
      await transaction.end(client);
      log.warn(`| EFP | User not found`);
      return response.clientError.userNotAuthenticated(res, { body: { type: 'Email' }});
    }

    const randToken = genToken.random();
    await Confirmation.upsert({type: 'forgot_password', username: user.username, code: randToken}, client);
    await emailer.send(randToken); // add receiver user.email

    transaction.commit(client);
    response.success.success(res, { body: { type: 'Email' }});
    log.info('Email sent successfully');
  } catch (err) {
    log.error(`Error Sending Email with Code to Reset Password for ${email}:\n ${err}`);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending email!\n Please contact support team." });
  }
};

/* --------------- Receiving Notification from User --------------- */
/* ---------------------------------------------------------------- */

const contactUs = async (req, res) => {
  const { username } = req.decodedToken;
  log.info(`Sending Email from User: ${username} ...`);

  const client = await transaction.start();

  try {
    const { title, body } = req.body;

    validator.generalValidator(body);
    validator.generalValidator(title);
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if(!user) {
      await transaction.end(client);
      log.warn(`| EFU | User not found`);
      return response.clientError.userNotAuthenticated(res, { body: { type: 'Email' }});
    }

    // TODO -> Remove after testing
    // TODO -> Email must be sent from admin account to admin account mentioning the user's actual email
    // await emailer.sendFromUser({ title, body, username }, false);

    await emailer.sendFromUser({ title, body, username }, user.email);

    // In future change to commit if there are changes in database
    transaction.end(client);
    response.success.success(res, { body: { type: 'Email' }});
    log.info('Email sent successfully');
  } catch (err) {
    log.error(`Error Sending Email from User: ${username}:\n ${err}`);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending email!\n Please contact support team." });
  }
};

module.exports = {
  contactUs,
  smsWithCode,
  emailWithCode,
  emailForgotPassword,
}