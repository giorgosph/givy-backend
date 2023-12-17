const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

const auth = require("../controllers/index").auth;
const users = require("../controllers/index").users;
const notify = require("../controllers/index").notification;

/* ------------------------ Auth Routes ------------------------ */

router.put("/login", auth.login);
router.post("/register", auth.register);
router.put("/forgot-password", auth.forgotPassword);
router.delete("/confirm", verifyToken, auth.confirmAccount);

/* ------------------------ User Details Routes ------------------------ */

router.get("/details", verifyToken, users.getUserDetails);
router.put("/details/contact", verifyToken, users.editContactDetails);
router.put("/details/shipping", verifyToken, users.editShippingDetails);

/* ------------------------ Notification Routes ------------------------ */

router.put("/email/pass", notify.emailForgotPassword);
router.put("/phone/code", verifyToken, notify.smsWithCode);
router.put("/email/code", verifyToken, notify.emailWithCode);

module.exports = router;