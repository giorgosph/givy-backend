import express from "express";

import { verifyToken } from "../middleware/auth";
import { draw, drawAttenant } from "../controllers";

const router = express.Router();

/* ------------------------ Get Routes ------------------------ */

router.get("/", draw.getCurrentDraws);
router.get("/best", draw.getBestDraw);
router.get("/featured", draw.getFeaturedDraws);
router.get("/items/:drawId", draw.getDrawItems);
router.get("/user", verifyToken, draw.getUserDraws);

/* ------------------------ Opt in Route ------------------------ */

router.post("/register", verifyToken, drawAttenant.register);

export default router;
