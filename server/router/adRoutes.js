import express from 'express';
import { createAd, getAds, getAd, updateAd,
         deleteAd, toggleAdStatus, getPublicAds } from '../controllers/adController.js';

const router = express.Router();

/**
 * Ads Routes (public - no auth required)
 */
router.get('/public', getPublicAds);

router.get('/', getAds);                             // Get all ads
router.get('/:id', getAd);                           // Get single ad
router.post('/', createAd);                          // Create ad
router.put('/:id', updateAd);                        // Update ad
router.delete('/:id', deleteAd);                     // Delete ad
router.patch('/:id/toggle', toggleAdStatus);         // Toggle active status

export default router;
