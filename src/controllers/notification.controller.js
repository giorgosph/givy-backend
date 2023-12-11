const Confirmation = require("../models").Confirmation;

const response = require("../responses");
const transaction = require("../db/db").transaction;

const getUser = require("./users.controller").getUser;
const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");


/* ------------------------------------------------------------------------------------------- */

const emailWithCode = async (req, res) => {
  const { username } = req.decodedToken;
  console.log(`Sending email to ${username}...`);

  const client = await transaction.start();

  try {
    const user = await getUser(res, username, client);
    if(!user) return;

    const randToken = genToken.random();
    await Confirmation.update({type: 'email', username, code: randToken, notes: 'resend'}, client);
    await emailer.send(randToken); // add receiver user.email

    transaction.commit(client);
    response.success.success(res, { body: { type: 'email' }});
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
    const user = await getUser(res, username, client);
    if(!user) return;

    const randToken = genToken.random();
    await Confirmation.update({type: 'mobile', username, code: randToken, notes: 'resend'}, client);
    console.log(`Mobile Confirmation Code for ${username}: ${randToken}`); // TODO -> send confirmation sms


    transaction.commit(client);
    response.success.success(res, { body: { type: 'mobile' }});
  } catch (err) {
    console.error(`Error Sending SMS with Code to ${username}:\n`, err);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending SMS!\n Please contact support team." });
  }
};

module.exports = {
  emailWithCode,
  smsWithCode,
}