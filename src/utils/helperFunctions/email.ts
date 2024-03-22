import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

import Logger from "../logger/logger";

/* ----- Types ------ */
type SendFromUserDataProp = {
  body: string;
  title: string;
  username: string;
};

/* ------------------ */

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
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 16px;">
              <div style="color: red; font-weight: bold; font-size: 26px;">Givey</div>
              <div style="margin: 0; padding: 64px 0;">
                <p style="color: #fff; text-align: center;">Use the confirmation code below to verify your account!</p>
                <p style="color: #fff; text-align: center;">Confirmation Code🔑</p>
                <table cellpadding="0" cellspacing="0" style="background-color: #333; color: white; margin: 0 auto; padding: 16px; border-radius: 8px;">
                  <tr>
                    <td>${code}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
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
 * Sends an email with the provided data.
 *
 * @param data The data object containing title, username, and body.
 * @param email Optional. The sender's email address.
 * @throws Error if there is an issue sending the email.
 */
async function sendFromUser(data: SendFromUserDataProp, email?: string) {
  // Define the email options
  const mailOptions: Mail.Options = {
    from: email || process.env.EMAIL_RECIPIENT, // || process.env.EMAIL_RECIPIENT is used for testing purposes
    to: process.env.EMAIL,
    subject: `${data.title}`,
    text: `Email from: ${data.username}\n${data.body}`,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    Logger.debug(`Email sent: ${info.response}`);
  } catch (e) {
    throw new Error("Error sending email:\n" + e);
  }
}

export { sendCode, sendFromUser };
