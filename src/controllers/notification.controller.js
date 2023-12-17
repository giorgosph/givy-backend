const User = require("../models").User;
const Confirmation = require("../models").Confirmation;

const response = require("../responses");
const transaction = require("../db/db").transaction;

const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");

/* ------------------- Confirmations ------------------- */
/* ----------------------------------------------------- */

const emailWithCode = async (req, res) => {
  const { username } = req.decodedToken;
  console.log(`Sending email to ${username}...`);

  const client = await transaction.start();

  try {
    const user = await User.findByUsername(res, username, client);
    if(!user) {
      await transaction.end(client);
      return response.clientError.userNotAuthenticated(res, { body: { type: 'Email' }});
    }

    const randToken = genToken.random();
    await Confirmation.update({type: 'email', username, code: randToken, notes: 'resend'}, client);
    await emailer.send(randToken); // add receiver user.email

    transaction.commit(client);
    response.success.success(res, { body: { type: 'Email' }});
  } catch (err) {
    console.error(`Error Sending Email with Code to ${username}:\n`, err);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending email!\n Please contact support team." });
  }
};

const smsWithCode = async (req, res) => {
  const { username } = req.decodedToken;
  console.log(`Sending SMS to ${username}...`);

  const client = await transaction.start();

  try {
    const user = await User.findByUsername(res, username, client);
    if(!user) {
      await transaction.end(client);
      return response.clientError.userNotAuthenticated(res, { body: { type: 'SMS' }});
    }

    const randToken = genToken.random();
    await Confirmation.update({type: 'mobile', username, code: randToken, notes: 'resend'}, client);
    console.log(`Mobile Confirmation Code for ${username}: ${randToken}`); // TODO -> send confirmation sms

    transaction.commit(client);
    response.success.success(res, { body: { type: 'SMS' }});
  } catch (err) {
    console.error(`Error Sending SMS with Code to ${username}:\n`, err);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending SMS!\n Please contact support team." });
  }
};

const emailForgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(`Sending email to ${email}...`);

  const client = await transaction.start();

  try {
    const user = await User.findByEmail(email, client);
    if(!user) {
      await transaction.end(client);
      return response.clientError.userNotAuthenticated(res, { body: { type: 'Email' }});
    }

    const randToken = genToken.random();
    await Confirmation.upsert({type: 'forgot_password', username: user.username, code: randToken}, client);
    await emailer.send(randToken); // add receiver user.email

    transaction.commit(client);
    response.success.success(res, { body: { type: 'Email' }});
  } catch (err) {
    console.error(`Error Sending Email with Code to Reset Password for ${email}:\n`, err);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending email!\n Please contact support team." });
  }
};

module.exports = {
  smsWithCode,
  emailWithCode,
  emailForgotPassword,
}