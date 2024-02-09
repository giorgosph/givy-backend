import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

import log from "../logger/logger";

/* ----- Types ------ */
type SendFromUserDataProp = {
  body: Mail.Options;
  title: string;
  username: string;
};

/* ------------------ */

// TODO -> Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL, // Sender's email address
    pass: process.env.EMAIL_PASSWORD, // Sender's email password
  },
});

/**
 * Sends an email with the provided code.
 * @param code The code to be included in the email.
 * @throws Error if there is an issue sending the email.
 */
async function send(code: string | number) {
  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL_RECIPIENT,
    subject: "Test Email",
    text: `This is a test email sent from Node.js using Nodemailer.\nConfirmation Code: ${code}`,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    log.debug(`Email sent: ${info.response}`);
  } catch (e) {
    throw new Error("Error sending email:\n" + e);
  }
}

/**
 * Sends an email with the provided data.
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
    log.debug(`Email sent: ${info.response}`);
  } catch (e) {
    throw new Error("Error sending email:\n" + e);
  }
}

export { send, sendFromUser };
