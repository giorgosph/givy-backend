const User = require("../models").User;
const UserFeedback = require("../models").UserFeedback;
const UserActivity = require("../models").UserActivity;
const Confirmation = require("../models").Confirmation;

const response = require("../responses");
const transaction = require("../db/db").transaction;

const emailer = require("../utils/helperFunctions/email");
const genToken = require("../utils/helperFunctions/token");
const validator = require("../utils/helperFunctions/dataValidation");

/* ---------------------- Get User --------------------------- */
/* ----------------------------------------------------------- */

const getUserDetails = async (req, res) => {
  const { username } = req.decodedToken;
  console.log(`Getting User Details for ${username}`);

  const client = await transaction.start();

  try {
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if(!user) {
      await transaction.end(client);
      return response.clientError.userNotAuthenticated(res);
    }

    console.log("Sending User Details:\n", user);
    response.success.success(res, { body: user });
  } catch (err) {
    await transaction.end(client);
    console.error(`Error Getting User's Details for ${username}:\n`, err);
    response.serverError.serverError(res);
  }
};

/* ---------------------- Update Details --------------------------- */
/* ----------------------------------------------------------------- */

const editContactDetails = async (req, res) => {
  const { username } = req.decodedToken;
  console.log(`Editing Contact Details for ${username}...`);

  const client = await transaction.start();    
  
  try {
    const { email, mobile } = req.body
    const type = 'update_details';
    
    validator.emailValidator(email);
    validator.confirmAccountValidator(username, mobile);

    // Filter Data: Email cannot be null
    if(!email) return response.clientError.invalidData(res);

    // Get user's data
    const user = await User.findByUsername(username, client);
    if(!user) {
      await transaction.end(client);
      return response.clientError.userNotAuthenticated(res);
    }

    const hasNewEmail = email && email !== user.email;
    const hasNewMobile = mobile && mobile !== user.mobile;

    let newEmail = false;
    let newMobile = false;

    if(hasNewEmail) {
      console.log("Updating email...");
      newEmail = await User.updateEmail({email, username}, client);

      // Create random token and send confirmation email
      const randToken = genToken.random();
      await Confirmation.insert({type: 'email', username, code: randToken, notes: 'update email'}, client);
      await emailer.send(randToken);
    }

    if(hasNewMobile) {
      console.log("Updating mobile...");
      newMobile = await User.updateMobile({mobile, username}, client);

      // Create random token and send confirmation sms
      const randToken = genToken.random();
      await Confirmation.upsert({type: 'mobile', username, code: randToken, notes: 'update mobile'}, client);
      console.log(`Mobile Confirmation Code for ${username}: ${randToken}`); // TODO -> send confirmation sms
    }

    if(hasNewEmail || hasNewMobile) {
      // Sign or update activity and commit
      await UserActivity.upsert({type, username}, client);
      await transaction.commit(client);
      
    } else await transaction.end(client);

    console.log(`Sending response with email: ${newEmail} and mobile: ${newMobile}`);
    response.success.success(res, { body: { contactDetails: { email: newEmail, mobile: newMobile }}});
  } catch (err) {
    await transaction.rollback(client);
    console.error(`Error Updating ${username}'s Contact Details:\n`, err);
    response.serverError.serverError(res);
  }
};

const editShippingDetails = async (req, res) => {
  const { username } = req.decodedToken
  console.log(`Editing Shipping Details for ${username}...`);
  const client = await transaction.start();
  
  try {
    const type = 'update_details';

    validator.shippingDetailsValidator(username, req.body);
    
    // Get user's data, update details and sign activity
    const userExists = await User.findByUsername(username, client);
    if(!userExists) {
      await transaction.end(client);
      return response.clientError.userNotAuthenticated(res);
    }

    const user = await User.updateAddress({ ...req.body, username: username }, client);
    await UserActivity.upsert({type, username}, client);
    
    await transaction.commit(client);
    response.success.success(res, { body: { shippingDetails: user }});
  } catch (err) {
    await transaction.rollback(client);
    console.error(`Error Updating ${username}'s Shipping Details:\n`, err);
    response.serverError.serverError(res);
  }
};

/* ------------------ Other Activities ----------------------- */
/* ----------------------------------------------------------- */

const feedback = async (req, res) => {
  const { username } = req.decodedToken;
  console.log(`Receiving feedback from User: ${username} ...`);

  const client = await transaction.start();

  try {
    const { comments, rating } = req.body;

    validator.generalValidator(rating);
    validator.generalValidator(comments);
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if(!user) {
      await transaction.end(client);
      return response.clientError.userNotAuthenticated(res, { body: { type: 'Feedback' }});
    }

    // Chack lastest submited feedback
    const currentDate = new Date();
    const savedDate = new Date(user.lastFeedbackDate);
    savedDate.setDate(savedDate.getDate() + 1);

    if(currentDate < savedDate) {
      await transaction.end(client);
      return response.clientError.conflictedData(res);
    }

    // Update database
    await User.updateFeedbackDate(username, client);
    await UserFeedback.upsert({ username, rating, comments }, client);
    
    // TODO -> Send "Thank you for your feedback" email to user.email

    // Commit
    transaction.commit(client);
    response.success.success(res, { body: { type: 'Feedback' }});
  } catch (err) {
    console.error(`Error Receiving Feedback from User: ${username}:\n`, err);
    await transaction.rollback(client);
    response.serverError.serverError(res, { message: "Error sending feedback!\n Please contact support team." });
  }
};

module.exports = {
  feedback,
  getUserDetails,
  editContactDetails,
  editShippingDetails,
}

