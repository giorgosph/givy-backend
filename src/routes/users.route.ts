import express from "express";

import { verifyToken } from "../middleware/auth";

import { auth, user, notification } from "../controllers";

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

router.put("/email/pass", notification.emailForgotPassword);

router.put("/phone/code", verifyToken, notification.smsWithCode);
router.put("/email/code", verifyToken, notification.emailWithCode);

router.post("/email/contact", verifyToken, notification.contactUs);

export default router;
