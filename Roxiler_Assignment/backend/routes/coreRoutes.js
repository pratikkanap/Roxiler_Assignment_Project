// routes/coreRoutes.js
const express = require('express');
const router = express.Router();
const { getStoresForUser, submitOrModifyRating, getStoreOwnerDashboard } = require('../controllers/coreController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route for Normal Users to get and search store listings
router.get('/stores', protect, authorize('User'), getStoresForUser);

// Route for Normal Users to submit/edit a rating
router.post('/rate', protect, authorize('User'), submitOrModifyRating);

// Route for Store Owners to access their distinct dashboard metric pipeline
router.get('/owner-dashboard', protect, authorize('StoreOwner'), getStoreOwnerDashboard);

module.exports = router;
