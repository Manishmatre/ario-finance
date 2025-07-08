const mongoose = require('mongoose');

const GRNSchema = new mongoose.Schema({
  grnNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  poRef: {
    type: String,
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  grnDate: {
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
    batchNumber: String,
    expiryDate: Date,
    receivedQuantity: {
      type: Number,
      default: 0
    }
  }],
  billDetails: {
    billNumber: String,
    billDate: Date,
    billAmount: Number,
    billFile: String,
    billMatched: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'partially_matched', 'completed'],
    default: 'pending'
  },
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount
GRNSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
});

// Indexes for better performance
GRNSchema.index({ poRef: 1, vendorId: 1 });
GRNSchema.index({ billDetails: { billNumber: 1, billDate: 1 } });

module.exports = mongoose.model('GRN', GRNSchema);
