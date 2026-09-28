import express from 'express';
import { createFeature, getAllFeatures, deleteFeature, updateFeature } from '../controllers/featureController.js';
import { verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.post('/add-feature',verifyAdmin,createFeature);
router.get('/get-features',getAllFeatures);
router.put('/:id', verifyAdmin, updateFeature);
router.delete('/:id', verifyAdmin, deleteFeature);

export default router;