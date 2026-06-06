// controllers/adminController.js
const { User, Store, Rating, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { validatePassword, validateName, validateAddress } = require('../utils/validators');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count(); // [cite: 19]
    const totalStores = await Store.count(); // [cite: 20]
    const totalRatings = await Rating.count(); // [cite: 21]

    res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats.' });
  }
};

// @desc    Admin can create new users (Admin, User, StoreOwner)
// @route   POST /api/admin/users
// @access  Private (Admin Only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body; // [cite: 22, 23, 24, 25, 26, 27]

    if (!['Admin', 'User', 'StoreOwner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role assignment.' });
    }

    if (!validateName(name)) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({ message: 'Address is required and must be at most 400 characters.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be 8-16 characters with at least one uppercase letter and one special character.' 
      });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role
    });

    res.status(201).json({
      message: 'User created successfully by Admin.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map((e) => e.message).join(', ') });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Admin can create a new store
// @route   POST /api/admin/stores
// @access  Private (Admin Only)
exports.createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length === 0 || name.length > 60) {
      return res.status(400).json({ message: 'Store name is required and must be at most 60 characters.' });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({ message: 'Store address is required and must be at most 400 characters.' });
    }

    const storeExists = await Store.findOne({ where: { email } });
    if (storeExists) {
      return res.status(400).json({ message: 'Store email already exists.' });
    }

    // Optional: Validate that the owner actually exists and is a StoreOwner
    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== 'StoreOwner') {
        return res.status(400).json({ message: 'Assigned owner ID must belong to a valid Store Owner.' });
      }
    }

    const newStore = await Store.create({ name, email, address, ownerId: ownerId || null });

    res.status(201).json({ message: 'Store created successfully.', store: newStore });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all users with filtering, sorting, and individual details
// @route   GET /api/admin/users
// @access  Private (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    // Dynamic Query Parameters for filtering and sorting
    const { search, role, sortBy, order } = req.query; // [cite: 33, 69]

    let whereClause = {};
    
    // Apply filters based on Name, Email, Address [cite: 33]
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Apply filter based on Role [cite: 33]
    if (role) {
      whereClause.role = role;
    }

    // Determine Sorting Column and Direction [cite: 69]
    const validSortFields = ['name', 'email', 'address', 'role'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'address', 'role'], // [cite: 32, 34]
      order: [[sortField, sortOrder]],
      include: [{
        model: Store,
        as: 'store',
        attributes: ['id', 'name']
      }]
    });

    // If the user is a Store Owner, we need to calculate and dynamically inject their overall store rating [cite: 35]
    const updatedUsers = await Promise.all(users.map(async (user) => {
      const userData = user.toJSON();
      if (userData.role === 'StoreOwner' && userData.store) {
        const ratingData = await Rating.findOne({
          where: { storeId: userData.store.id },
          attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
        });
        userData.rating = ratingData ? parseFloat(ratingData.get('avgRating') || 0).toFixed(1) : '0.0'; // [cite: 35]
      }
      return userData;
    }));

    res.status(200).json(updatedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all stores with average ratings, filters, and sorting
// @route   GET /api/admin/stores
// @access  Private (Admin Only)
exports.getAllStores = async (req, res) => {
  try {
    const { search, sortBy, order } = req.query; // [cite: 33, 69]

    let whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const validSortFields = ['name', 'email', 'address'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where: whereClause,
      order: [[sortField, sortOrder]],
      attributes: [
        'id',
        'name',
        'email',
        'address',
        [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('Ratings.rating')), 0), 'rating']
      ],
      include: [{
        model: Rating,
        attributes: []
      }],
      group: ['Store.id']
    });

    res.status(200).json(stores.map((store) => {
      const storeData = store.toJSON();
      return {
        ...storeData,
        rating: parseFloat(storeData.rating || 0).toFixed(1)
      };
    }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
