const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/auth");

const response = require("../responses");
const log = require("../utils/logger/logger");

/* -------------------------------------------------------------- */

router.put("/fe/err", verifyToken, (req, res) => {
  // send email to admin with frontend error message
  log.debug(`Frontend error: ${req.body.message}`);
  response.success.success(res);
});

module.exports = router;
