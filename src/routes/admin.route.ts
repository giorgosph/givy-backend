import express, { Request, Response } from "express";

import { success } from "../responses";
import { verifyToken } from "../middleware/auth";

import { logger } from "../utils/logger/logger";

const router = express.Router();

/* -------------------------------------------------------------- */

router.put("/fe/err", verifyToken, (req: Request, res: Response) => {
  // TODO -> send email to admin with frontend error message
  logger.debug(`Frontend error: ${req.body.message}`);
  success(res);
});

export default router;
