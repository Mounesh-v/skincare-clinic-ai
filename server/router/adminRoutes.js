import express from "express";
import {
  vendorRegister,
  vendorLogin,
  getVendorMe,
} from "../controllers/adminController.js";
import {
  getVendorProducts,
  getVendorProductById,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
} from "../controllers/vendorProductController.js";
import {
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrderStatus,
} from "../controllers/vendorOrderController.js";
import { listVendors, updateVendorStatus } from "../controllers/adminController.js";
import { verifyVendor, verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

// —— Auth (public)
router.post("/register", vendorRegister);
router.post("/login", vendorLogin);

// —— Auth (protected)
router.get("/me", verifyVendor, getVendorMe);

// —— Platform admin only (list/approve vendors)
router.get("/vendors", verifyAdmin, listVendors);
router.patch("/vendors/:id/status", verifyAdmin, updateVendorStatus);

// —— Vendor products (all protected)
router.get("/products", verifyVendor, getVendorProducts);
router.get("/products/:id", verifyVendor, getVendorProductById);
router.post("/products", verifyVendor, createVendorProduct);
router.put("/products/:id", verifyVendor, updateVendorProduct);
router.delete("/products/:id", verifyVendor, deleteVendorProduct);

// —— Vendor orders (all protected)
router.get("/orders", verifyVendor, getVendorOrders);
router.get("/orders/:id", verifyVendor, getVendorOrderById);
router.put("/orders/:id", verifyVendor, updateVendorOrderStatus);

export default router;
