const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");

const drawAttenant = require("../controllers/index").drawAttenant;

/* ------------------------ Opt in Route ------------------------ */

router.post("/register", verifyToken, drawAttenant.register);

module.exports = router;
