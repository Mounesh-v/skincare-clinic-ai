import express from "express";
import { submitContact, getContacts } from "../controllers/contactController.js";
import { verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", submitContact);
router.get("/", verifyAdmin, getContacts);

export default router;
