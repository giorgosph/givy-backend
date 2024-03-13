import express from "express";

import { verifyToken } from "../middleware/auth"; // TODO -> Create new type of token/secret for product owners or implement roles

const router = express.Router();

/* -------------------------------------------------------------- */

router.put("/upload");

export default router;
