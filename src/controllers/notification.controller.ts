import { Request, Response } from "express";

import { transaction } from "../db/db";
import { User, Confirmation } from "../models";
import { clientError, serverError, success } from "../responses";

import Logger from "../utils/logger/logger";
import * as emailer from "../utils/helperFunctions/email";
import * as genToken from "../utils/helperFunctions/token";
import * as validator from "../utils/helperFunctions/dataValidation";
import { IReqContactUs, IReqEmailFP } from "../utils/types/requestTypes";

/* ------------------- Confirmations ------------------- */
/* ----------------------------------------------------- */

const emailWithCode = async (req: Request, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Sending email to ${username} ...`);

  const client = await transaction.start();

  try {
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if (!user) {
      await transaction.end(client);
      Logger.warn(`| EWC | User not found`);
      throw new Error(`User: ${username} not found!`);
    }

    const randToken = genToken.random();
    await Confirmation.update(
      { type: "email", username, code: randToken, notes: "resend" },
      client
    );
    await emailer.send(randToken); // add receiver user.email

    await transaction.commit(client);
    success.success(res, { body: { type: "Email" } });
    Logger.info("Email sent successfully");
  } catch (err) {
    Logger.error(`Error Sending Email with Code to ${username}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res, {
      message: "Error sending email!\n Please contact support team.",
    });
  }
};

const smsWithCode = async (req: Request, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Sending SMS to ${username} ...`);

  const client = await transaction.start();

  try {
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if (!user) {
      await transaction.end(client);
      Logger.warn(`| SWC | User not found`);
      throw new Error(`User: ${username} not found!`);
    }

    const randToken = genToken.random();
    await Confirmation.update(
      { type: "mobile", username, code: randToken, notes: "resend" },
      client
    );
    Logger.debug(`Mobile Confirmation Code for ${username}: ${randToken}`); // TODO -> send confirmation sms

    await transaction.commit(client);
    success.success(res, { body: { type: "SMS" } });
    Logger.info("SMS sent successfully");
  } catch (err) {
    Logger.error(`Error Sending SMS with Code to ${username}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res, {
      message: "Error sending SMS!\n Please contact support team.",
    });
  }
};

const emailForgotPassword = async (req: IReqEmailFP, res: Response) => {
  const { email } = req.body;
  Logger.info(`Sending email to ${email} ...`);

  const client = await transaction.start();

  try {
    validator.emailValidator(email);

    const user = await User.findByEmail(email, client);
    if (!user) {
      await transaction.end(client);
      Logger.warn(`| EFP | User not found`);
      return clientError.userNotAuthenticated(res);
    }

    const randToken = genToken.random();
    await Confirmation.upsert(
      { type: "forgot_password", username: user.username, code: randToken },
      client
    );
    await emailer.send(randToken); // add receiver user.email

    await transaction.commit(client);
    success.success(res, { body: { type: "Email" } });
    Logger.info("Email sent successfully");
  } catch (err) {
    Logger.error(
      `Error Sending Email with Code to Reset Password for ${email}:\n ${err}`
    );
    await transaction.rollback(client);
    serverError.serverError(res, {
      message: "Error sending email!\n Please contact support team.",
    });
  }
};

/* --------------- Receiving Notification from User --------------- */
/* ---------------------------------------------------------------- */

const contactUs = async (req: IReqContactUs, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Sending Email from User: ${username} ...`);

  const client = await transaction.start();

  try {
    const { title, body } = req.body;

    validator.generalValidator(body);
    validator.generalValidator(title);
    validator.usernameValidator(username);

    const user = await User.findByUsername(username, client);
    if (!user) {
      await transaction.end(client);
      Logger.warn(`| EFU | User not found`);
      throw new Error(`User: ${username} not found!`);
    }

    // TODO -> Remove after testing
    // TODO -> Email must be sent from admin account to admin account mentioning the user's actual email
    // await emailer.sendFromUser({ title, body, username }, false);

    await emailer.sendFromUser({ title, body, username }, user.email);

    // In future change to commit if there are changes in database
    transaction.end(client);
    success.success(res, { body: { type: "Email" } });
    Logger.info("Email sent successfully");
  } catch (err) {
    Logger.error(`Error Sending Email from User: ${username}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res, {
      message: "Error sending email!\n Please contact support team.",
    });
  }
};

export { emailWithCode, smsWithCode, emailForgotPassword, contactUs };
