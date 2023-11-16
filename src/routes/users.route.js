const express = require("express");
const router = express.Router();
// const { verifyToken, verifyUserApproved } = require("../middleware/auth");

const auth = require("../controllers/auth.controller");

/* ------------------------ Auth Routes ------------------------ */

router.put("/login", auth.login);
router.post("/register", auth.register);

module.exports = router;