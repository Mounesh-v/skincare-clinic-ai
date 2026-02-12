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

router.post("/",createProduct);
router.get("/all-products", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/:id/image/:index", deleteProductImage);


export default router;
