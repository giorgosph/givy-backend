import { Request, Response } from "express";
import * as messaging from "firebase-admin/messaging";

import { transaction } from "../db/db";
import { User, UserPush, Confirmation } from "../models";
import { clientError, serverError, success } from "../responses";

import Logger from "../utils/logger/logger";
import * as emailer from "../utils/helperFunctions/email";
import * as genToken from "../utils/helperFunctions/token";
import * as validator from "../utils/helperFunctions/dataValidation";
import {
  IReqEmailFP,
  IReqContactUs,
  IReqPushToUser,
} from "../utils/types/requestTypes";

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

/* --------------------- Push Notifications --------------------- */
/* -------------------------------------------------------------- */

const registerPushToken = async (req: IReqPushToUser, res: Response) => {
  const { username } = req.decodedToken!;
  Logger.info(`Registering Push Token for: ${username}`);

  const client = await transaction.start();

  try {
    const { pushToken } = req.body;

    const userTokens = await UserPush.getUserTokens(username, client);
    if (
      userTokens &&
      userTokens.some((token) => token.pushToken == pushToken)
    ) {
      transaction.end(client);
      Logger.info(`Push Token for ${username} already registered`);
      success.success(res);
      return;
    }

    await UserPush.insert({ username, pushToken }, client);

    transaction.commit(client);
    Logger.info(`Push Token for ${username} submitted`);
    success.success(res);
  } catch (err) {
    Logger.error(`Error Registering Push Token to ${username}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res, {
      message: "Error registering token!\n Please contact support team.",
    });
  }
};

const pushToUser = async (req: IReqPushToUser, res: Response) => {
  Logger.info(`Sending Push Notification to User`);

  try {
    const { pushToken } = req.body;
    const data = {
      pussykey: "push",
      pussytitle: "Push Notification",
      pussycaption: "Push Notification Captions",
    };

    await messaging.getMessaging().send({
      token: pushToken,
      data: data,
      notification: {
        title: "Push Notification",
        body: "This is a push notification from the server.",
        imageUrl:
          "https://spectrum-brand.com/cdn/shop/articles/Cover_Photo.jpg?v=1617060405&width=1500",
      },
    });

    Logger.debug(`Push Notification sent to User successfully`);
    success.success(res);
  } catch (err) {
    Logger.error(`Error sending Push Notification to the user:\n${err}`);
    serverError.serverError(res, {
      message: "Error sending email!\n Please contact support team.",
    });
  }
};

export {
  contactUs,
  pushToUser,
  smsWithCode,
  emailWithCode,
  registerPushToken,
  emailForgotPassword,
};
