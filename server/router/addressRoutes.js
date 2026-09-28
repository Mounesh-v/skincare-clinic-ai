import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getAddresses);
router.post("/", verifyToken, addAddress);
router.put("/:addressId", verifyToken, updateAddress);
router.delete("/:addressId", verifyToken, deleteAddress);
router.put("/:addressId/default", verifyToken, setDefaultAddress);

export default router;
