// models/Rating.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1, // Ratings between 1 to 5
      max: 5,
    },
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'storeId'],
    },
  ],
});

module.exports = Rating;
