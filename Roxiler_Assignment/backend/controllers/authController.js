// controllers/authController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validatePassword, validateName, validateAddress } = require('../utils/validators');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// @desc    Register a normal user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // 1. Enforce Role 'User' for standard signups
    const role = 'User'; 

    if (!validateName(name)) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({ message: 'Address is required and must be at most 400 characters.' });
    }

    // 2. Custom Password Complexity Check
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be 8-16 characters long, containing at least one uppercase letter and one special character.' 
      });
    }

    // 3. Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // 4. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create User (Sequelize model triggers Name/Address validations automatically)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role
    });

    res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map((e) => e.message).join(', ') });
    }
    res.status(400).json({ message: error.message || 'Registration failed.' });
  }
};

// @desc    Single login system for all users
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.status(200).json({
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Update password (For Normal Users and Store Owners)
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    // Validate new password rules
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        message: 'New password must be 8-16 characters long, containing at least one uppercase letter and one special character.' 
      });
    }

    // Hash and update
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error updating password.' });
  }
};
