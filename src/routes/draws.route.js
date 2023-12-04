const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");

const draw = require("../controllers/index").draw;
const drawAttenant = require("../controllers/index").drawAttenant;

/* ------------------------ Get Routes ------------------------ */

router.get("/", draw.getCurrentDraws);

/* ------------------------ Opt in Route ------------------------ */

router.post("/register", verifyToken, drawAttenant.register);

module.exports = router;
