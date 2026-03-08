import express from 'express';
import { getActiveOffers, getAllOffers, getOffer, createOffer,
         updateOffer, deleteOffer, toggleOfferStatus,
         trackView, trackClick, getAnalytics } from '../controllers/specialOfferController.js';
import { protect, authorize } from '../middleware/verifyToken.js';

const router = express.Router();


/**
 * Special Offers Routes
 */

// Public routes
router.get('/', getActiveOffers);                    // Get active offers for banner
router.post('/:id/view', trackView);                 // Track view
router.post('/:id/click', trackClick);               // Track click

// Admin routes (protected)
router.use(protect);                                 // Protect all routes below
router.use(authorize('admin'));                      // Only admin can access

router.get('/admin', getAllOffers);                  // Get all offers (admin)
router.get('/analytics', getAnalytics);              // Get analytics
router.get('/:id', getOffer);                        // Get single offer
router.post('/create', createOffer);                 // Create offer
router.put('/:id', updateOffer);                     // Update offer
router.delete('/:id', deleteOffer);                  // Delete offer
router.patch('/:id/toggle', toggleOfferStatus);      // Toggle active status

export default router;