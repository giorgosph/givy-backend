import express from "express";

import { verifyToken } from "../middleware/auth";

import {
  emailForgotPassword,
  smsWithCode,
  emailWithCode,
  contactUs,
} from "../controllers/notification";
import {
  getUserDetails,
  editContactDetails,
  editShippingDetails,
  feedback,
} from "../controllers/users";
import {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  confirmAccount,
  refreshToken,
} from "../controllers/auth";

const router = express.Router();

/* ------------------------ Auth Routes ------------------------ */

router.put("/login", login);
router.post("/register", register);
router.post("/logout", verifyToken, logout);

router.put("/forgot-password", forgotPassword);
router.put("/reset-password", verifyToken, resetPassword);

router.delete("/confirm", verifyToken, confirmAccount);

router.post("/refresh-token", refreshToken);

/* ------------------------ User Details Routes ------------------------ */

router.get("/details", verifyToken, getUserDetails);
router.put("/details/contact", verifyToken, editContactDetails);
router.put("/details/shipping", verifyToken, editShippingDetails);

router.post("/feedback", verifyToken, feedback);

/* ------------------------ Notification Routes ------------------------ */

router.put("/email/pass", emailForgotPassword);

router.put("/phone/code", verifyToken, smsWithCode);
router.put("/email/code", verifyToken, emailWithCode);

router.post("/email/contact", verifyToken, contactUs);

export default router;
