const User = require("../models/index").User;
const UserActivity = require("../models/index").UserActivity;
const Confirmation = require("../models/index").Confirmation;

const response = require("../responses/index");
const transaction = require("../db/db").transaction;

const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");

/* ---------------------- Update Details --------------------------- */
/* ----------------------------------------------------------------- */

const getUser = async (res, username, client) => {
  const user = await User.findUserByUsername(username);
  if(!user) {
    await transaction.end(client);
    return response.auth.userNotAuthenticated(res);
  } return user;
}

/* ---------------------- Update Details --------------------------- */
/* ----------------------------------------------------------------- */

const editContactDetails = async (req, res) => {
  const { username } = req.decodedToken
  const { email, mobile } = req.body
  const type = 'update_details';

  try {
    const client = transaction.start();    
    
    const user = await getUser(res, username, client);
    const newEmail = email !== user.email;
    const newMobile = mobile !== user.mobile;

    if(newEmail) {
      await User.updateEmail({email, username}, client);
      await UserActivity.insert({type, username}, client);
      const randToken = genToken.random();
      await Confirmation.insert({type: 'email', username, code: randToken, notes: 'update email'}, client);
      await emailer.send();
    }
    if(newMobile) {
      await User.updateMobile({mobile, username}, client);
      await UserActivity.insert({type, username}, client);
      // send confirmarion sms
    }

    // NOTE:
    // if user is present in confirmation table then confirmation is pending
    // after confirmation is successful remove from confirmation table and insert to user activity  
    await transaction.commit();
    response.success(res);
  } catch (err) {
    await transaction.rollback(client);
    console.error("Error Updating User's Contact Details:\n", err);
    response.error.generic(res);
  }
}

const editShippingDetails = async (req, res) => {
  const { username } = req.decodedToken
  const type = 'update_details';

  try {
    const client = await transaction.start();

    await getUser(res, username, client);
    await User.updateAddress({ ...req.body, username: username }, client);
    await UserActivity.insert({type, username}, client);
    
    await transaction.commit();
    response.success(res);
  } catch (err) {
    await transaction.rollback(client);
    console.error("Error Updating User's Shipping Details:\n", err);
    response.error.generic(res);
  }

}

module.exports = {
  getUser,
  editContactDetails,
  editShippingDetails,
}

