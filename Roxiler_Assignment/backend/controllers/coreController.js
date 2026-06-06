// controllers/coreController.js
const { User, Store, Rating, sequelize } = require('../models');
const { Op } = require('sequelize');

// ==========================================
// NORMAL USER FUNCTIONALITIES
// ==========================================

// @desc    Get all stores with average rating & current user's submitted rating
// @route   GET /api/core/stores
// @access  Private (Normal User Only)
exports.getStoresForUser = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.id; // Logged-in user id

    // Filter criteria based on Store Name and Address
    let whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Fetch all stores
    const stores = await Store.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'address'],
    });

    // Dynamically calculate individual and aggregate stats for each store
    const storeListings = await Promise.all(stores.map(async (store) => {
      const storeData = store.toJSON();

      // 1. Calculate overall average rating
      const aggregateRating = await Rating.findOne({
        where: { storeId: store.id },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
      });
      const avg = aggregateRating ? aggregateRating.get('avgRating') : 0;
      storeData.overallRating = parseFloat(avg || 0).toFixed(1);

      // 2. Fetch the current logged-in user's submitted rating for this specific store
      const userRatingRecord = await Rating.findOne({
        where: { storeId: store.id, userId }
      });
      storeData.userSubmittedRating = userRatingRecord ? userRatingRecord.rating : null;

      return storeData;
    }));

    res.status(200).json(storeListings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error pulling store records.' });
  }
};

// @desc    Submit or modify a store rating
// @route   POST /api/core/rate
// @access  Private (Normal User Only)
exports.submitOrModifyRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;
    const ratingValue = Number(rating);

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required.' });
    }

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating value must be an integer between 1 and 5.' });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Look for an existing rating by this user for this store
    let ratingRecord = await Rating.findOne({ where: { storeId, userId } });

    if (ratingRecord) {
      // If found, update it (Modify rating rule)
      ratingRecord.rating = ratingValue;
      await ratingRecord.save();
      return res.status(200).json({ message: 'Your rating was modified successfully.', ratingRecord });
    } else {
      // Otherwise, create a brand new rating record
      ratingRecord = await Rating.create({ userId, storeId, rating: ratingValue });
      return res.status(201).json({ message: 'Rating submitted successfully.', ratingRecord });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to register your rating.' });
  }
};

// ==========================================
// STORE OWNER FUNCTIONALITIES
// ==========================================

// @desc    Get store owner's dashboard metrics & list of users who rated it
// @route   GET /api/core/owner-dashboard
// @access  Private (Store Owner Only)
exports.getStoreOwnerDashboard = async (req, res) => {
  try {
    // Find the store belonging to the logged-in user
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    
    if (!store) {
      return res.status(404).json({ message: 'No store assignment found for this owner.' });
    }

    // 1. Calculate overall average rating
    const aggregateRating = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
    });
    const avg = aggregateRating ? aggregateRating.get('avgRating') : 0;
    const averageRating = parseFloat(avg || 0).toFixed(1);

    // 2. Extract list of users who have submitted ratings for this store
    const ratingsGiven = await Rating.findAll({
      where: { storeId: store.id },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'address'] // Details of the user
      }],
      attributes: ['rating', 'createdAt']
    });

    res.status(200).json({
      storeName: store.name,
      storeEmail: store.email,
      storeAddress: store.address,
      averageRating,
      totalRatingsCount: ratingsGiven.length,
      ratingsReceived: ratingsGiven
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error rendering owner metric pipeline.' });
  }
};
