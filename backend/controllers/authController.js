const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const mongoose = require('mongoose');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Input validation
    if (!email || !password) {
      console.log('Login attempt with missing credentials');
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required',
        message: 'Please provide both email and password'
      });
    }

    console.log(`Login attempt for email: ${email}`);
    
    // Find user by email and explicitly include the password field
    const user = await User.findOne({ email })
      .select('+password')
      .select('+isActive');
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(401).json({ 
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is active
    if (user.isActive === false) {
      console.log(`Login attempt for deactivated account: ${email}`);
      return res.status(403).json({
        success: false,
        error: 'Account deactivated',
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ 
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }
    
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    console.log(`User ${email} logged in successfully at ${user.lastLogin}`);
    
    // Return user data (without password)
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId
    };

    // Fetch company info
    let company = null;
    if (user.tenantId) {
      company = await Company.findById(user.tenantId).lean();
    }

    res.json({ 
      success: true,
      token,
      user: userData,
      company,
      message: 'Login successful'
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: 'An error occurred while processing your request'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  // Simulate sending email
  res.json({ message: 'If this email exists, a reset link has been sent.' });
};

exports.resetPassword = async (req, res) => {
  // Simulate password reset
  res.json({ message: 'Password has been reset.' });
};

exports.register = async (req, res) => {
  const { admin, company } = req.body;
  
  // Input validation
  if (!admin || !company) {
    return res.status(400).json({ error: 'Admin and company data are required' });
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create company
    const newCompany = new Company({
      name: company.name || '',
      companyType: company.companyType || '',
      pan: company.pan || '',
      gstNo: company.gstNo || '',
      contactPerson: admin.name || '',
      contactEmail: admin.email || '',
      contactPhone: admin.phone || '',
      address: {
        addressLine1: company.address?.addressLine1 || '',
        addressLine2: company.address?.addressLine2 || '',
        city: company.address?.city || '',
        state: company.address?.state || '',
        pincode: company.address?.pincode || ''
      }
    });
    
    await newCompany.save({ session });
    
    // Create admin user
    const newUser = new User({
      name: admin.name,
      email: admin.email,
      password: admin.password,
      phone: admin.phone,
      tenantId: newCompany._id,
      role: 'admin',
    });
    
    await newUser.save({ session });
    await session.commitTransaction();
    session.endSession();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        tenantId: newCompany._id,
        email: newUser.email,
        role: 'admin'
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      token,
      user: { 
        id: newUser._id,
        email: newUser.email, 
        name: newUser.name, 
        tenantId: newUser.tenantId,
        role: 'admin',
        phone: newUser.phone || ''
      },
      company: newCompany.toObject()
    });
    
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Registration error:', err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field} already exists`, 
        field,
        message: `This ${field} is already registered.`
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An error occurred during registration. Please try again.'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password.' });
  }
};