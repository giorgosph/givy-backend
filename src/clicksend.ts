import { smsApi } from "./server";

const testRecipient = process.env.TEST_PHONE;
const senderID = process.env.CLICKSEND_SENDER_ID;

export const sendOTP = async (recipient: string, code: number) => {
  try {
    await smsApi.smsSendPost({
      messages: [
        {
          from: senderID,
          to: recipient || testRecipient,
          source: "sdk",
          body: `Welcome to Givey App! 🎉\n\nVerify your phone number using the code:\n🔑   ${code}`,
          country: "CY",
        },
      ],
    });
  } catch (err) {
    throw new Error(`Error sending OTP SMS:\n ${err}`);
  }
};

export const sendToWinner = async (recipient: string, item: string) => {
  try {
    await smsApi.smsSendPost({
      messages: [
        {
          from: senderID,
          to: recipient || testRecipient,
          source: "sdk",
          body: `Congratulations you have won a free ${item}! 👏🎉\n\nMake sure to update your Shipping Details in our App to deliver your item for FREE. 📬\n\nWe will let you know if we need more information as soon as possible.\n\nThank you for your trust,\nThe Givey Team`,
          country: "CY",
        },
      ],
    });
  } catch (err) {
    throw new Error(`Error sending SMS to Winner:\n ${err}`);
  }
};
