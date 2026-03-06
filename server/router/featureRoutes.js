import express from 'express';
import { createFeature, getAllFeatures } from '../controllers/featureController.js';
import { verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.post('/add-feature',verifyAdmin,createFeature);
router.get('/get-features',getAllFeatures);

export default router;