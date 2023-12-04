const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");

const draw = require("../controllers/index").draw;
const drawAttenant = require("../controllers/index").drawAttenant;

/* ------------------------ Get Routes ------------------------ */

router.get("/", draw.getCurrentDraws);
router.get("/items/:drawId", draw.getDrawItems);

/* ------------------------ Opt in Route ------------------------ */

router.post("/register", verifyToken, drawAttenant.register);

module.exports = router;
