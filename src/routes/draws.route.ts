import express from "express";

import { register } from "../controllers/index";
import { verifyToken } from "../middleware/auth";
import {
  getCurrentDraws,
  getDrawItems,
  getUserDraws,
} from "../controllers/index";

const router = express.Router();

/* ------------------------ Get Routes ------------------------ */

router.get("/", getCurrentDraws);
router.get("/items/:drawId", getDrawItems);
router.get("/user", verifyToken, getUserDraws);

/* ------------------------ Opt in Route ------------------------ */

router.post("/register", verifyToken, register);

export default router;
