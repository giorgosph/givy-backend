const User = require("../models/index").User;
const UserActivity = require("../models/index").UserActivity;
const Confirmation = require("../models/index").Confirmation;

const response = require("../responses/index");
const transaction = require("../db/db").transaction;

const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");

/* ---------------------- Get User --------------------------- */
/* ----------------------------------------------------------- */

const getUser = async (res, username, client) => {
  const user = await User.findByUsername(username, client);
  if(!user) {
    await transaction.end(client);
    return response.auth.userNotAuthenticated(res);
  } return user;
}

const getUserDetails = async (req, res) => {
  console.log("Getting User Details");
  const client = await transaction.start();

  try {
    const { username } = req.decodedToken;

    const user = await getUser(res, username, client);
    console.log("Sending User Details:\n", user);

    response.success(res, { body: user });
  } catch (err) {
    await transaction.end(client);
    console.error("Error Getting User's Details:\n", err);
    response.error.generic(res);
  }
}

/* ---------------------- Update Details --------------------------- */
/* ----------------------------------------------------------------- */

const editContactDetails = async (req, res) => {
  console.log(`Editing Contact Details`);
  const client = await transaction.start();    
  
  try {
    const { username } = req.decodedToken;
    const { email, mobile } = req.body
    const type = 'update_details';
    
    // Get user's data
    const user = await getUser(res, username, client);
    const hasNewEmail = email && email !== user.email;
    const hasNewMobile = mobile && mobile !== user.mobile;

    let newEmail = null;
    let newMobile = null;

    if(hasNewEmail) {
      console.log("Updating email");
      newEmail = await User.updateEmail({email, username}, client);

      // Create random token and send confirmation email
      const randToken = genToken.random();
      await Confirmation.insert({type: 'email', username, code: randToken, notes: 'update email'}, client);
      await emailer.send();
      // TODO -> set User isConfirmaed to false
    }

    if(hasNewMobile) {
      console.log("Updating mobile");
      newMobile = await User.updateMobile({mobile, username}, client);
      // send confirmarion sms and add code to table
    }

    // NOTE:
    // if user is present in confirmation table then confirmation is pending
    // after confirmation is successful remove from confirmation table and insert to user activity

    if(hasNewEmail || hasNewMobile) {
      // Sign or update activity and commit
      await UserActivity.upsert({type, username}, client);
      await transaction.commit(client);

    }else await transaction.end(client);

    console.log(`Sending response with email: ${newEmail} and mobile: ${newMobile}`);
    response.success(res, { body: { email: newEmail, mobile: newMobile } });
  } catch (err) {
    await transaction.rollback(client);
    console.error("Error Updating User's Contact Details:\n", err);
    response.error.generic(res);
  }
}

const editShippingDetails = async (req, res) => {
  console.log("Editing Shipping Details");
  const client = await transaction.start();
  
  try {
    const { username } = req.decodedToken
    const type = 'update_details';

    // Get user's data, update details and sign activity
    await getUser(res, username, client);
    const user = await User.updateAddress({ ...req.body, username: username }, client);
    await UserActivity.upsert({type, username}, client);
    
    await transaction.commit(client);
    response.success(res, { body: user });
  } catch (err) {
    await transaction.rollback(client);
    console.error("Error Updating User's Shipping Details:\n", err);
    response.error.generic(res);
  }

}

module.exports = {
  getUser,
  getUserDetails,
  editContactDetails,
  editShippingDetails,
}

