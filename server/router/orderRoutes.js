import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import verifyToken, { verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);          // any logged-in user
router.get("/", verifyAdmin, getAllOrders);           // admin only
router.get("/:id", verifyToken, getOrderById);       // owner or admin
router.put("/:id", verifyAdmin, updateOrderStatus);  // admin only
router.delete("/:id", verifyAdmin, deleteOrder);     // admin only

export default router;
