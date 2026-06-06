// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: [20, 60], // Min 20, Max 60 characters
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Standard email validation rules
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    // Length & complexity validations will be handled in the signup controller 
    // before hashing, as hashed passwords exceed 16 characters.
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [0, 400], // Max 400 characters
    },
  },
  role: {
    type: DataTypes.ENUM('Admin', 'User', 'StoreOwner'),
    allowNull: false,
  },
});

module.exports = User;
