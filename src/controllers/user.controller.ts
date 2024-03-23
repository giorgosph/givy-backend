import { Request, Response } from "express";

import { transaction } from "../db/db";
import { sendOTP } from "../clicksend";
import { clientError, serverError, success } from "../responses";
import { User, UserFeedback, UserActivity, Confirmation } from "../models";

import Logger from "../utils/logger/logger";
import * as emailer from "../utils/helperFunctions/email";
import * as genToken from "../utils/helperFunctions/token";
import * as validator from "../utils/helperFunctions/dataValidation";
import { IReqEditContact, IReqEditShipping } from "../utils/types/requestTypes";

/* ---------------------- Get User --------------------------- */
/* ----------------------------------------------------------- */

const getUserDetails = async (req: Request, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Getting User Details for ${username} ...`);

  const client = await transaction.start();

  try {
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if (!user) {
      await transaction.end(client);
      Logger.warn(`| UD | User not found`);
      return clientError.userNotAuthenticated(res);
    }

    success.success(res, { body: user });
    Logger.info("User Details fetched");
  } catch (err) {
    await transaction.end(client);
    Logger.error(`Error Getting User's Details for ${username}:\n ${err}`);
    serverError.serverError(res);
  }
};

/* ---------------------- Update Details --------------------------- */
/* ----------------------------------------------------------------- */

const editContactDetails = async (req: IReqEditContact, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Editing Contact Details for ${username} ...`);

  const client = await transaction.start();

  try {
    const { email, mobile } = req.body;
    const type = "update_details";

    validator.emailValidator(email);
    validator.confirmAccountValidator(username, mobile);

    // Filter Data: Email cannot be null
    if (!email) {
      Logger.warn(`| ECD | Invalid email provided: ${email}`);
      return clientError.invalidData(res);
    }

    // Get user's data
    const user = await User.findByUsername(username, client);
    if (!user) {
      await transaction.end(client);
      Logger.warn(`| ECD | User not found`);
      throw new Error(`User: ${username} not found`);
    }

    const hasNewEmail = email && email !== user.email;
    const hasNewMobile = mobile && mobile !== user.mobile;

    let newEmail;
    let newMobile;

    if (hasNewEmail) {
      Logger.debug("Updating email...");
      newEmail = await User.updateEmail({ email, username }, client);

      // Create random token and send confirmation email
      const randToken = genToken.random();
      await Confirmation.insert(
        { type: "email", username, code: randToken, notes: "update email" },
        client
      );
      await emailer.sendCode(randToken);
    }

    if (hasNewMobile) {
      Logger.debug("Updating mobile...");
      newMobile = await User.updateMobile({ mobile, username }, client);

      // Send confirmation SMS
      const randToken = genToken.random();
      await Confirmation.upsert(
        { type: "mobile", username, code: randToken, notes: "update mobile" },
        client
      );
      await sendOTP("", randToken);
    }

    if (hasNewEmail || hasNewMobile) {
      // Sign or update activity and commit
      await UserActivity.upsert({ type, username }, client);
      await transaction.commit(client);
    } else await transaction.end(client);

    success.success(res, {
      body: { contactDetails: { email: newEmail, mobile: newMobile } },
    });
    Logger.info(`Contact Details updated`);
  } catch (err) {
    await transaction.rollback(client);
    Logger.error(`Error Updating ${username}'s Contact Details:\n ${err}`);
    serverError.serverError(res);
  }
};

const editShippingDetails = async (req: IReqEditShipping, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Editing Shipping Details for ${username} ...`);
  const client = await transaction.start();

  try {
    const type = "update_details";

    validator.shippingDetailsValidator(username, req.body);

    // Get user's data, update details and sign activity
    const userExists = await User.findByUsername(username, client);
    if (!userExists) {
      await transaction.end(client);
      Logger.warn(`| ESD | User not found`);
      throw new Error(`User ${username} not found`);
    }

    const user = await User.updateAddress(
      { ...req.body, username: username },
      client
    );
    await UserActivity.upsert({ type, username }, client);

    await transaction.commit(client);
    success.success(res, { body: { shippingDetails: user } });
    Logger.info("Shipping Details updated");
  } catch (err) {
    await transaction.rollback(client);
    Logger.error(`Error Updating ${username}'s Shipping Details:\n ${err}`);
    serverError.serverError(res);
  }
};

/* ------------------ Other Activities ----------------------- */
/* ----------------------------------------------------------- */

const feedback = async (req: Request, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Receiving feedback from User: ${username} ...`);

  const client = await transaction.start();

  try {
    const { comments, rating } = req.body;

    validator.generalValidator(rating);
    validator.generalValidator(comments);
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if (!user) {
      await transaction.end(client);
      Logger.warn(`| FB | User not found`);
      throw new Error(`User: ${username} not found!`);
    }

    // Check latest submitted feedback
    const currentDate = new Date();
    const savedDate = new Date(user.lastFeedbackDate);
    savedDate.setDate(savedDate.getDate() + 1);

    if (currentDate < savedDate) {
      await transaction.end(client);
      Logger.info(`Feedback was updated earlier`);
      return clientError.conflictedData(res);
    }

    // Update database
    await User.updateFeedbackDate(username, client);
    await UserFeedback.upsert({ username, rating, comments }, client);

    // Send email
    emailer.sendFeedbackReceipt(user.email);

    // Commit
    transaction.commit(client);
    success.success(res, { body: { type: "Feedback" } });
    Logger.info("Feedback updated");
  } catch (err) {
    Logger.error(`Error Receiving Feedback from User: ${username}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res, {
      message: "Error sending feedback!\n Please contact support team.",
    });
  }
};

export { feedback, getUserDetails, editContactDetails, editShippingDetails };
