
import express from "express";
import { createOrder } from "../controllers/ordersController.js";

const router = express.Router();

// Customer checkout
router.post("/", createOrder);

export default router;
