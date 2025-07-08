const Lender = require('../models/Lender');

exports.getAllLenders = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const lenders = await Lender.find(query)
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const stats = {
      total: lenders.length,
      active: lenders.filter(l => l.status === 'ACTIVE').length,
      totalLoans: lenders.reduce((sum, l) => sum + (l.totalLoans || 0), 0),
      banks: lenders.filter(l => l.type === 'BANK').length
    };

    res.json({
      lenders,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLender = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'type', 'address', 'contactPerson'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(req.body.phone)) {
      return res.status(400).json({
        error: 'Phone number must be 10 digits'
      });
    }

    const lender = new Lender(req.body);
    await lender.save();
    res.status(201).json(lender);
  } catch (error) {
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }
    res.status(500).json({ error: 'Failed to create lender' });
  }
};

exports.getLender = async (req, res) => {
  try {
    const lender = await Lender.findById(req.params.id);
    if (!lender) {
      return res.status(404).json({ error: 'Lender not found' });
    }
    res.json(lender);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLender = async (req, res) => {
  try {
    const lender = await Lender.findById(req.params.id);
    if (!lender) {
      return res.status(404).json({ error: 'Lender not found' });
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'type', 'address', 'contactPerson'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        fields: missingFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(req.body.phone)) {
      return res.status(400).json({
        error: 'Phone number must be 10 digits'
      });
    }

    // Update lender
    Object.assign(lender, req.body);
    await lender.save();
    res.json(lender);
  } catch (error) {
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }
    res.status(500).json({ error: 'Failed to update lender' });
  }
};

exports.deleteLender = async (req, res) => {
  try {
    const lender = await Lender.findByIdAndDelete(req.params.id);
    if (!lender) {
      return res.status(404).json({ error: 'Lender not found' });
    }
    res.json({ message: 'Lender deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
