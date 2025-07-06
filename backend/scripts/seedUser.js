const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = new User({
    email: 'admin@company.com',
    password: 'password', // will be hashed
    name: 'Demo Admin',
    tenantId: 'demoTenant'
  });
  await user.save();
  console.log('Seeded admin user: admin@company.com / password');
  process.exit();
}

seed(); 