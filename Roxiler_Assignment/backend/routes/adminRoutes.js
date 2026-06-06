// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, createUser, createStore, getAllUsers, getAllStores } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Lock down all routes in this file to Logged-in Admins Only [cite: 9]
router.use(protect);
router.use(authorize('Admin'));

router.get('/dashboard', getDashboardStats);
router.post('/users', createUser);
router.post('/stores', createStore);
router.get('/users', getAllUsers);
router.get('/stores', getAllStores);

module.exports = router;
