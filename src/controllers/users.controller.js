const User = require("../models/index").User;
const UserActivity = require("../models/index").UserActivity;

const response = require("../responses/index");
const transaction = require("../db/db").transaction;

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
    if(email !== user.email) {
      await User.updateEmail({email, username}, client);
      await UserActivity.insertActivity({type, username}, client);
      // send confirmarion email
      // if user is present in confirmation table then confirmation is pending
      // after confirmation is successful remove from confirmation table and insert to user activity  
    }
    if(mobile !== user.mobile) {
      await User.updateMobile({mobile, username}, client);
      await UserActivity.insertActivity({type, username}, client);
      // send confirmarion sms
    }

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