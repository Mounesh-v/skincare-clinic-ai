import express from "express";
const router = express.Router();

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from "../controllers/productController.js";
import { verifyAdmin } from "../middleware/verifyToken.js";

// Public reads
router.get("/all-products", getAllProducts);
router.get("/:id", getProductById);

// Admin-only mutations
router.post("/", verifyAdmin, createProduct);
router.put("/:id", verifyAdmin, updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);
router.delete("/:id/image/:index", verifyAdmin, deleteProductImage);

export default router;
