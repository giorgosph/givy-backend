const User = require("../models/index").User;
const UserActivity = require("../models/index").UserActivity;
const Confirmation = require("../models/index").Confirmation;

const response = require("../responses/index");
const transaction = require("../db/db").transaction;

const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");

const editContactDetails = async (req, res) => {
  const { username } = req.decodedToken
  const { email, mobile } = req.body
  const type = 'update_details';

  try {
    const client = transaction.start();    
    
    const user = await User.findUserByUsername(username);
    if(!user) {
      await transaction.end(client);
      return response.auth.userNotAuthenticated(res);
    }
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
    response.success(res)
  } catch (err) {
    await transaction.rollback(client);
    console.error("Error Creating User:\n", err);
    response.error.generic(res);
  }
}

module.exports = {
  editContactDetails,
}