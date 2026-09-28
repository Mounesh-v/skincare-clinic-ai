import express from 'express';
import { createAd, getAds, getAd, updateAd,
         deleteAd, toggleAdStatus, getPublicAds } from '../controllers/adController.js';
import { protect, authorize } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * Ads Routes
 */

// Public route - active ads for the website
router.get('/public', getPublicAds);

/**
 * Admin only routes
 */
router.use(protect);                                 // Protect all routes
router.use(authorize('admin'));                      // Only admin can access

router.get('/', getAds);                             // Get all ads (admin)
router.get('/:id', getAd);                           // Get single ad
router.post('/', createAd);                          // Create ad
router.put('/:id', updateAd);                        // Update ad
router.delete('/:id', deleteAd);                     // Delete ad
router.patch('/:id/toggle', toggleAdStatus);         // Toggle active status

export default router;
