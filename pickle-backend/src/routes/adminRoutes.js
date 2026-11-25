
import express from "express";

import {adminLogin,adminLogout,getAdminProfile} from "../controllers/adminController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

import { createProduct,updateProduct,deleteProduct } from "../controllers/productController.js";
import {getAllOrders,getOrderById} from "../controllers/adminOrderController.js";

import { getDashboardSummary } from "../controllers/adminDashboardController.js";
import upload from "../middleware/uploadMiddleware.js";
import adminLoginRateLimiter from "../middleware/adminLoginRateLimiter.js";
import validateImageSignature from "../middleware/validateImageSignature.js";
import {issueCsrfToken,verifyCsrfToken} from "../middleware/csrfMiddleware.js";

const router = express.Router();

router.get("/csrf-token", issueCsrfToken);

router.post("/login", verifyCsrfToken,adminLoginRateLimiter, adminLogin);
router.get("/profile", protectAdmin, getAdminProfile);

router.post("/products",verifyCsrfToken,protectAdmin,upload.array("images", 5),validateImageSignature,createProduct);// UPDATE PRODUCT
router.put("/products/:id", verifyCsrfToken,protectAdmin,upload.array("images", 5),validateImageSignature,updateProduct);
// DELETE PRODUCT
router.delete("/products/:id",verifyCsrfToken,protectAdmin,deleteProduct);

// ADMIN ORDER ROUTES
router.get("/orders", protectAdmin, getAllOrders);
router.get("/orders/:id", protectAdmin, getOrderById);

// ADMIN DASHBOARD
router.get("/dashboard", protectAdmin, getDashboardSummary);


router.post("/logout",  verifyCsrfToken,protectAdmin, adminLogout);

export default router;
