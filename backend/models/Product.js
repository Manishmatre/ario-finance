const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  unit: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  hsnCode: {
    type: String,
    index: true
  },
  gstRate: {
    type: Number,
    default: 0
  },
  basePrice: {
    type: Number,
    default: 0
  },
  stock: {
    quantity: {
      type: Number,
      default: 0
    },
    minQuantity: {
      type: Number,
      default: 0
    }
  },
  batchNumbers: [{
    batchNumber: {
      type: String,
      required: true
    },
    expiryDate: {
      type: Date
    },
    quantity: {
      type: Number,
      required: true
    },
    manufacturingDate: {
      type: Date
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: String
}, {
  timestamps: true
});

// Indexes for better performance
ProductSchema.index({ name: 1, category: 1 });
ProductSchema.index({ code: 1, category: 1 });
ProductSchema.index({ hsnCode: 1 });

// Generate product code before saving
ProductSchema.pre('save', function(next) {
  if (!this.code) {
    // Generate code based on category and sequence
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    // Find last product in the same category
    const sequence = 1;
    
    this.code = `${categoryCode}${year}${month}${sequence.toString().padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
