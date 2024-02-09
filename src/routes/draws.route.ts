import express from "express";

import { verifyToken } from "../middleware/auth";
import {
  register,
  getUserDraws,
  getDrawItems,
  getCurrentDraws,
} from "../controllers";

const router = express.Router();

/* ------------------------ Get Routes ------------------------ */

router.get("/", getCurrentDraws);
router.get("/items/:drawId", getDrawItems);
router.get("/user", verifyToken, getUserDraws);

/* ------------------------ Opt in Route ------------------------ */

router.post("/register", verifyToken, register);

export default router;
