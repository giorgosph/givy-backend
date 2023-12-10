const Confirmation = require("../models/index").Confirmation;

const response = require("../responses/index");
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
    response.success(res, { body: { type: 'email' }});
  } catch (err) {
    console.error(`Error Sending Email with Code to ${username}:\n`, err);
    await transaction.rollback(client);
    response.error.generic(res, { message: "Error sending email!\n Please contact support team." });
  }
};

module.exports = {
  emailWithCode,
}