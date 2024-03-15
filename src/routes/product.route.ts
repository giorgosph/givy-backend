import express from "express";

import { verifyToken } from "../middleware/auth"; // TODO -> Create new type of token/secret for product owners or implement roles

import { draw } from "../controllers";

const router = express.Router();

/* -------------------------------------------------------------- */

router.post("/insert", draw.newDraw);

export default router;
