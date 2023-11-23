const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

const auth = require("../controllers/index").auth;
const users = require("../controllers/index").users;

/* ------------------------ Auth Routes ------------------------ */

router.put("/login", auth.login);
router.post("/register", auth.register);

/* ------------------------ User Details Routes ------------------------ */

router.get("/details", verifyToken, users.getUserDetails);
router.put("/details/contact", verifyToken, users.editContactDetails);
router.put("/details/shipping", verifyToken, users.editShippingDetails);

module.exports = router;