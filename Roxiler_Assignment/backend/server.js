// server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const coreRoutes = require('./routes/coreRoutes');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Middleware
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/core', coreRoutes);

// Sample Route to check if backend works
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Sync Database and Start Server
sequelize.sync({ force: false }) // 'force: false' prevents dropping tables on every restart
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
