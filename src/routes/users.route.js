const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

const auth = require("../controllers/auth.controller");
const users = require("../controllers/users.controller");

/* ------------------------ Auth Routes ------------------------ */

router.put("/login", auth.login);
router.post("/register", auth.register);

/* ------------------------ Details Routes ------------------------ */

router.put("/details/contact", verifyToken, users.editContactDetails);
router.put("/details/shipping", auth.login);

module.exports = router;