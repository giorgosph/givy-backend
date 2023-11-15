const nodemailer = require("nodemailer");
const testRecipient = process.env.EMAIL_RECIPIENT;

const qr = require("qrcode");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
async function sendEmail(recipient, link) {
  // Create a transporter using SMTP

  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL_RECIPIENT, // recipient
    subject: "Test Email",
    text: `This is a test email sent from Node.js using Nodemailer. Here is the forgot password link:\n ${link}`,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (e) {
    throw new Error("Error sending email:\n", e);
  }
}

async function generateQRCodeBase64(data) {
  return new Promise((resolve, reject) => {
    qr.toDataURL(data, (err, qrDataURL) => {
      if (err) {
        reject(err);
      } else {
        const base64Data = qrDataURL.split(";base64,").pop();
        resolve(base64Data);
      }
    });
  });
}

async function sendEmailWithQRCode(dataArr) {
  console.log("sending email with QR to: ", testRecipient);

  // console.log(dataArr);
  try {
    const attachments = [];

    for (let i = 0; i < dataArr.length; i++) {
      const data = dataArr[i].ticketCode;
      console.log(data);

      // Generate the QR code as base64 data
      const qrCodeBase64 = await generateQRCodeBase64(data);

      // Add the QR code as an attachment
      attachments.push({
        filename: `ticket_${i}.png`,
        content: qrCodeBase64,
        encoding: "base64",
      });
    }

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL,
      to: testRecipient, // recipient
      subject: "QR Code Email with Attached Images",
      html: "<p>Here are the QR codes as attached images:</p>",
      attachments,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = { sendEmail, sendEmailWithQRCode };
