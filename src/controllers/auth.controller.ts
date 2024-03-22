import { Request, Response } from "express";

import { transaction } from "../db/db";
import { sendOTP } from "../clicksend";
import { User, UserActivity, Confirmation } from "../models";
import { clientError, serverError, success } from "../responses";

import Logger from "../utils/logger/logger";
import { sendCode } from "../utils/helperFunctions/email";
import { random as randomToken } from "../utils/helperFunctions/token";
import { encrypt as hash, compareKeys } from "../utils/helperFunctions/hash";
import { signToken, extractRefreshToken } from "../utils/helperFunctions/jwt";
import {
  registerValidator,
  loginValidator,
  confirmAccountValidator,
} from "../utils/helperFunctions/dataValidation";
import {
  IReqConfirmAccount,
  IReqForgotPass,
  IReqLogIn,
  IReqRegister,
  IReqResetPass,
} from "../utils/types/requestTypes";

/* ------------------------ Log In/Sign Up/Log Out ------------------------ */
/* ------------------------------------------------------------------------ */

const register = async (req: IReqRegister, res: Response) => {
  Logger.info("Creating new User ...");
  const { username, email, password } = req.body;
  const usernamePrefix = `${process.env.USERNAME_PREFIX}${username}`;

  const client = await transaction.start();

  try {
    // Validate data
    registerValidator(req.body);

    // Check if the user's details are already registered
    const userExists = await User.findUser(
      { username: usernamePrefix, email },
      client
    );
    if (!!userExists && userExists?.exist) {
      await transaction.end(client);
      Logger.info(`${userExists.type} already exist`);
      return clientError.userExists(res, userExists.type);
    }

    // Encrypt password
    const hashed = await hash(password);

    // Register user
    const user = await User.register(
      { ...req.body, username: usernamePrefix, password: hashed },
      client
    );
    if (!user) throw new Error(`User could not be registered`);

    // Send confirmation email
    const randToken = randomToken();
    await Confirmation.insert(
      {
        type: "email",
        username: usernamePrefix,
        code: randToken,
        notes: "register",
      },
      client
    );
    await sendCode(randToken);

    // Send confirmation SMS
    if (user.mobile) {
      const randToken = randomToken();
      await Confirmation.insert(
        {
          type: "mobile",
          username: usernamePrefix,
          code: randToken,
          notes: "register",
        },
        client
      );
      await sendOTP("", randToken);
    }

    // Sign activities
    await UserActivity.insert(
      { username: usernamePrefix, type: "login" },
      client
    );
    await UserActivity.insert(
      { username: usernamePrefix, type: "register" },
      client
    );

    const payload = {
      username: user.username,
      email: user.email,
    };

    // Sign tokens
    const accessToken = signToken(payload, "30m");
    const refreshToken = signToken(payload, "7d", true);

    // Set HTTP-only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    await transaction.commit(client);
    success.sendToken(res, accessToken, {
      body: { user, confirmed: { email: false, mobile: false } },
    });
    Logger.debug(`New User Created:\n ${JSON.stringify(user)}`);
  } catch (err) {
    Logger.error(`Error Creating ${usernamePrefix}:\n${err}`);
    await transaction.rollback(client);
    serverError.serverError(res);
  }
};

const login = async (req: IReqLogIn, res: Response) => {
  const { username, password } = req.body;
  const usernamePrefix = `${process.env.USERNAME_PREFIX}${username}`;
  Logger.info(`Logging in User ${usernamePrefix} ...`);

  const client = await transaction.start();

  try {
    // Validate data
    loginValidator(username, password);

    // Check if the user exists
    let user = await User.findByUsername(usernamePrefix, client); // by username
    if (!user) user = await User.findByEmail(username, client); // by email
    if (!user) {
      await transaction.end(client);
      Logger.warn(`${username} not found`);
      return clientError.userNotAuthenticated(res);
    }

    // Compare passwords
    const authed = await compareKeys(password, user.password);
    if (!authed) {
      await transaction.end(client);
      Logger.info(`password mismatch`);
      return clientError.userNotAuthenticated(res);
    }

    // Sign activity
    await UserActivity.update(
      { username: user.username, type: "login" },
      client
    );

    // Check if user has pending confirmations
    const email = await Confirmation.findUserWithType(
      { username: user.username, type: "email" },
      client
    );
    const mobile = await Confirmation.findUserWithType(
      { username: user.username, type: "mobile" },
      client
    );

    const payload = {
      username: user.username,
      email: user.email,
    };

    // Send token and commit database changes
    const accessToken = signToken(payload, "30m");
    const refreshToken = signToken(payload, "7d", true);

    // Set HTTP-only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    await transaction.commit(client);
    success.sendToken(res, accessToken, {
      body: { user, confirmed: { email: !email, mobile: !mobile } },
      status: 200,
    });
    Logger.info(`User logged in -> ${usernamePrefix}`);
  } catch (err) {
    Logger.error(`Error Logging in ${usernamePrefix}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res);
  }
};

const logout = async (req: Request, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Logging out: ${username}`);

  try {
    req.session.destroy((err: any) => {
      if (err) throw new Error(`Error destroying session:\n ${err}`);
      res.clearCookie("refreshToken");

      success.success(res);
      Logger.info(`Log out successfully`);
    });
  } catch (err) {
    Logger.error(`Error Logging out ${username}:\n ${err}`);
    serverError.serverError(res);
  }
};

/* --------------------- Confirm email/mobile --------------------- */
/* ---------------------------------------------------------------- */

const confirmAccount = async (req: IReqConfirmAccount, res: Response) => {
  const { type } = req.body;
  const username = req.decodedToken!.username;

  Logger.info(`Confirming ${type} for ${username} ...`);

  const client = await transaction.start();

  try {
    // Validate data
    confirmAccountValidator(username, type);

    // Get User's confirmation info
    const user = await Confirmation.findUserWithType(
      { username, type },
      client
    );
    if (!user) throw new Error(`| AC | User not found`);

    // Check if code provided is valid
    if (user.code == req.body.code) {
      await Confirmation.delete({ username: user.username, type }, client);
      await UserActivity.upsert(
        { username: user.username, type: `${type}_confirmation` },
        client
      );
    } else {
      transaction.end(client);
      Logger.info(`| AC | Invalid code: ${req.body.code}`);
      return clientError.userNotAuthenticated(res);
    }

    await transaction.commit(client);
    success.success(res, { body: { confirm: type } });

    Logger.info(`Account confirmed (${type})`);
  } catch (err) {
    Logger.error(`Error Confirming ${type} for ${username}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res);
  }
};

/* ----------------------- Password Related ----------------------- */
/* ---------------------------------------------------------------- */

const forgotPassword = async (req: IReqForgotPass, res: Response) => {
  const { email, code, password } = req.body;
  Logger.info(`Setting new password for ${email} ...`);

  const client = await transaction.start();

  try {
    loginValidator(email, password);

    const type = "forgot_password";
    if (password !== req.body.confirmPassword)
      throw new Error("Passwords do not match!");

    // Get User
    const user = await User.findByEmail(email, client);
    if (!user) {
      await transaction.end(client);
      Logger.info(`User not found ${email}`);
      return clientError.userNotAuthenticated(res);
    }

    const username = user.username;

    // Get User's confirmation info
    const userCode = await Confirmation.findUserWithType(
      { username, type },
      client
    );
    if (!userCode)
      throw new Error(
        `User tries to set new password without confirmation code`
      );

    // Check if code provided is valid
    if (userCode.code == code) {
      const hashedPassword = await hash(password); // Encrypt password

      await Confirmation.delete({ username, type }, client); // Delete the confirmation entry
      await User.updatePassword({ username, password: hashedPassword }, client); // Update the password
      await UserActivity.upsert({ username, type: "reset_password" }, client); // Sign the activity
    } else {
      transaction.end(client);
      Logger.warn(`| FP | Invalid code: ${code}`);
      return clientError.userNotAuthenticated(res);
    }

    // Check if user has pending confirmations
    const mobile = await Confirmation.findUserWithType(
      { username: user.username, type: "mobile" },
      client
    );
    const emailExist = await Confirmation.findUserWithType(
      { username: user.username, type: "email" },
      client
    );

    const payload = {
      username: user.username,
      email: user.email,
    };

    // Send token and commit database changes
    const accessToken = signToken(payload, "30m");
    const refreshToken = signToken(payload, "7d", true);

    // Set HTTP-only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    await transaction.commit(client);
    success.sendToken(res, accessToken, {
      body: {
        user,
        pass: true,
        confirmed: { email: !emailExist, mobile: !mobile },
      },
    });
    Logger.info(`| FP | Password changed`);
  } catch (err) {
    Logger.error(`Error Setting new password for ${email}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res);
  }
};

const resetPassword = async (req: IReqResetPass, res: Response) => {
  const username = req.decodedToken!.username;
  Logger.info(`Resetting password for ${username} ...`);

  const client = await transaction.start();

  try {
    const { password } = req.body;
    const type = "reset_password";

    loginValidator(username, password);

    if (password !== req.body.confirmPassword)
      throw new Error("Passwords do not match!");

    const user = await User.findByUsername(username, client);
    if (!user) {
      await transaction.end(client);
      Logger.warn(`| RP | User not found`);
      return clientError.userNotAuthenticated(res);
    }

    const hashedPassword = await hash(password);
    await User.updatePassword({ username, password: hashedPassword }, client);
    await UserActivity.upsert({ username, type }, client);

    await transaction.commit(client);
    success.success(res, { body: { pass: true } });
    Logger.info(`| RP | Password changed`);
  } catch (err) {
    Logger.error(`Error Resetting password for ${username}:\n ${err}`);
    await transaction.rollback(client);
    serverError.serverError(res);
  }
};

/* ----------------------- Token Related ----------------------- */
/* ------------------------------------------------------------- */

const refreshToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  Logger.info(`Resetting token using -> ${refreshToken} ...`);

  if (!refreshToken) {
    Logger.warn("No refresh token");
    return clientError.noPrivilages(res);
  }

  try {
    const decoded = extractRefreshToken(refreshToken);
    const payload = {
      username: decoded.username,
      email: decoded.email,
    };

    const newAccessToken = signToken(payload, "30m");

    success.success(res, { body: `Bearer ${newAccessToken}` });
    Logger.info(`New token has been sent`);
  } catch (error) {
    Logger.warn("Invalid refresh token");
    return clientError.noPrivilages(res);
  }
};

export {
  login,
  logout,
  register,
  refreshToken,
  resetPassword,
  forgotPassword,
  confirmAccount,
};
