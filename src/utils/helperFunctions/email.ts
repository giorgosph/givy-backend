import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

import Logger from "../logger/logger";

/* ----- Types ------ */
type SendFromUserDataProp = {
  body: string;
  title: string;
  username: string;
};

/* ----- Constants ------ */
const textColor: string = "#ded7da";

/* ----- Transporter ------ */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

/* ------------------------------------------------------------- */

/**
 * Sends an email with the provided code.
 *
 * @param code The code to be included in the email.
 * @throws Error if there is an issue sending the email.
 */
async function sendCode(code: string | number) {
  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_NO_REPLY,
    to: process.env.EMAIL_RECIPIENT,
    subject: "Confirmation Email",
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: black;">
        <div style="margin: 0; padding: 16px; background-color: black;">
          <h1 style="color: red; font-weight: bold;;">Givey</h1>
          <div style="width: 80%; margin: 64px auto; padding: 0;">
            <h3 style="color: ${textColor}; text-align: center;">Use the confirmation code below to verify your identity!</h3>
            <p style="color: ${textColor}; text-align: center;">🔑 Confirmation Code 🔑</p>
            <div style="width: 120px; background-color: #333; color: ${textColor}; margin: 0 auto; padding: 16px; border-radius: 8px;">
              <h4 style="text-align: center; margin: 0; padding: 0;">${code}</h4>
            </div>
          </div>
          <small style="color: #ccc2c3; margin: 0 auto; text-align: center;">If this action was not intended by you contact our <a style="color: #4a74f0" href="mailto:support@givey.uk">support team</a></small>
          <h3 style="color: red; font-weight: bold; margin: 24px 0 0 0;">Regards</h3>
          <p style="font-size: 12px; color: ${textColor}; margin: 0; padding: 0;">The Givey Team</p>
        </div>
      </body>
    </html>
    `,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    Logger.debug(`Email sent: ${info.response}`);
  } catch (e) {
    throw new Error("Error sending email:\n" + e);
  }
}

/**
 * Sends an email from contact us.
 *
 * @param data The data object containing title, username, and body.
 * @param email The sender's email address.
 * @throws Error if there is an issue sending the email.
 */
async function sendFromUser(data: SendFromUserDataProp, email: string) {
  // Define the email options
  const mailOptions: Mail.Options = {
    from: process.env.EMAIL_INFO,
    to: process.env.EMAIL_INFO,
    subject: `Email from: ${data.username}`,
    text: `Email address: ${email}\n\nTitle:\n${data.title}\n\nBody:\n${data.body}`,
  };

  const userMailOptions: Mail.Options = {
    from: process.env.EMAIL_NO_REPLY,
    to: process.env.EMAIL_RECIPIENT, // TODO -> replace with provided email
    subject: `Your email has been received`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: black;">
        <div style="margin: 0; padding: 16px; background-color: black;">
          <h1 style="color: red; font-weight: bold;;">Givey</h1>
          <div style="width: 80%; margin: 64px auto; padding: 0;">
            <h3 style="color: ${textColor}; text-align: center;">This is a confirmation that we have received your email 📨</h3>
            <p style="color: ${textColor}; text-align: center;">🌞 An agent from our team will contact you as soon as possible! 🌞</p>
			      <div style="max-width: 80%; color: ${textColor}; margin: 0 auto; padding: 16px; border-radius: 8px; border: 1px solid #ccc;">
              <div style="border-bottom: 1px solid #ccc; padding-bottom: 8px;">
              	<h4 style="text-align: center; margin: 0 0 8px 0; padding: 0;">${data.title}</h4>
              </div>
              <p style="margin: 16px 0 0 0; padding: 0;">${data.body}</p>
            </div>
         </div>
          <small style="color: #ccc2c3; margin: 0 auto; text-align: center;">If this action was not intended by you contact our <a style="color: #4a74f0" href="mailto:support@givey.uk">support team</a></small>
          <h3 style="color: red; font-weight: bold; margin: 24px 0 0 0;">Regards</h3>
          <p style="font-size: 12px; color: ${textColor}; margin: 0; padding: 0;">The Givey Team</p>
        </div>
      </body>
    </html>
    `,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    Logger.debug(`Email sent to Givey team: ${info.response}`);

    const info2 = await transporter.sendMail(userMailOptions);
    Logger.debug(`Email sent to user: ${info2.response}`);
  } catch (e) {
    throw new Error("Error sending email:\n" + e);
  }
}

/**
 * Sends an email confirmation for feedback.
 *
 * @param email The sender's email address.
 * @throws Error if there is an issue sending the email.
 */
async function sendFeedbackReceipt(email: string) {
  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_NO_REPLY,
    to: process.env.EMAIL_RECIPIENT, // TODO -> change to user email
    subject: "Feedback Received",
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: black;">
        <div style="margin: 0; padding: 16px; background-color: black;">
          <h1 style="color: red; font-weight: bold;;">Givey</h1>
          <div style="width: 80%; margin: 64px auto; padding: 0;">
            <h3 style="color: ${textColor}; text-align: center;">Thank you your feedback 🌟</h3>
            <p style="color: ${textColor}; text-align: center;">We value our users' insights and we will be working 🧑‍💻 on improving your experience.</p>
            <p style="color: ${textColor}; text-align: center;">We encourage you to update your feedback in the future or contact us with any recomendations!</p>
        </div>
          <small style="color: ${textColor}; text-align: center;">Note that any future feedback will replace your existing one.</small>
          <small style="color: #ccc2c3; margin: 0 auto; text-align: center;">If this action was not intented by you contact our <a style="color: #4a74f0" href="mailto:support@givey.uk">support team</a></small>
            <h3 style="color: red; font-weight: bold; margin: 24px 0 0 0;">Regards</h3>
            <p style="font-size: 12px; color: ${textColor}; margin: 0; padding: 0;">The Givey Team</p>
        </div>
      </body>
    </html>
    `,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    Logger.debug(`Email sent: ${info.response}`);
  } catch (e) {
    throw new Error("Error sending email:\n" + e);
  }
}

export { sendCode, sendFromUser, sendFeedbackReceipt };
