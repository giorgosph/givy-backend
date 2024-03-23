import express from "express";

import { verifyToken } from "../middleware/auth";

import { auth, user, notification, winners } from "../controllers";
import {
  sendFeedbackReceipt,
  sendFromUser,
} from "../utils/helperFunctions/email";

const router = express.Router();

/* ------------------------ Auth Routes ------------------------ */

router.put("/login", auth.login);
router.post("/register", auth.register);
router.post("/logout", verifyToken, auth.logout);

router.put("/forgot-password", auth.forgotPassword);
router.put("/reset-password", verifyToken, auth.resetPassword);

router.delete("/confirm", verifyToken, auth.confirmAccount);

router.post("/refresh-token", auth.refreshToken);

/* ------------------------ User Details Routes ------------------------ */

router.get("/details", verifyToken, user.getUserDetails);
router.put("/details/contact", verifyToken, user.editContactDetails);
router.put("/details/shipping", verifyToken, user.editShippingDetails);

router.post("/feedback", verifyToken, user.feedback);

/* ------------------------ Notification Routes ------------------------ */

router.post("/push/send", notification.pushToUser);
router.post("/push/register", verifyToken, notification.registerPushToken);

router.put("/email/pass", notification.emailForgotPassword);

router.put("/phone/code", verifyToken, notification.smsWithCode);
router.put("/email/code", verifyToken, notification.emailWithCode);

router.post("/email/contact", verifyToken, notification.contactUs);

router.post("/email/test/contact", async (req, res) => {
  try {
    await sendFeedbackReceipt("test@example.com");
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ message: "error" });
  }
});

/* ------------------------ Winners Routes ------------------------ */

router.get("/topWinners", winners.topWinners);

export default router;
