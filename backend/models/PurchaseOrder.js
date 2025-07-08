const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  poRef: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  poDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    description: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'cancelled', 'partially_received', 'completed'],
    default: 'draft'
  },
  grns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GRN'
  }],
  remarks: String,
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

// Calculate totalAmount before saving
PurchaseOrderSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  next();
});

// Indexes for better performance
PurchaseOrderSchema.index({ vendorId: 1, status: 1 });
PurchaseOrderSchema.index({ poRef: 1, vendorId: 1 });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
