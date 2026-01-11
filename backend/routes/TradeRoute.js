import express from "express";
import { createTrade, getTrades, updateTrade, deleteTrade, getPerformance } from "../controllers/tradeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/", protect, createTrade);
router.get("/", protect, getTrades);
router.put("/:id", protect, updateTrade);
router.delete("/:id", protect, deleteTrade);
router.get("/performance", protect, getPerformance);

export default router;
