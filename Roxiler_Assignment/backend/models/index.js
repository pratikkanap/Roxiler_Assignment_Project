// models/index.js
const sequelize = require('../config/db');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Relationships
// 1. A Store is owned by a StoreOwner (User)
User.hasOne(Store, { foreignKey: 'ownerId', as: 'store', onDelete: 'SET NULL' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// 2. Ratings Link Users and Stores
User.hasMany(Rating, { foreignKey: 'userId', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'userId' });

Store.hasMany(Rating, { foreignKey: 'storeId', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'storeId' });

	// Composite unique index for (userId, storeId) declared on the Rating model

module.exports = { sequelize, User, Store, Rating };
