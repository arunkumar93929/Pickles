
import express from "express";

import {adminLogin,adminLogout,getAdminProfile} from "../controllers/adminController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/profile", protectAdmin, getAdminProfile);

router.post("/logout", protectAdmin, adminLogout);

export default router;
