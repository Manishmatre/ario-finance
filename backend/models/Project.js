const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Project name is required'] 
  },
  client: { 
    type: String, 
    required: [true, 'Client name is required'] 
  },
  type: { 
    type: String, 
    enum: ['software', 'construction'], 
    required: [true, 'Project type is required'] 
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: Date,
  budget: { 
    type: Number, 
    min: [0, 'Budget cannot be negative'] 
  },
  receivedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Received amount cannot be negative']
  },
  status: { 
    type: String, 
    enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  description: String,
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for balance
projectSchema.virtual('balance').get(function() {
  return (this.budget || 0) - (this.receivedAmount || 0);
});

// Add index for better query performance
projectSchema.index({ tenantId: 1, status: 1 });
projectSchema.index({ tenantId: 1, client: 1 });

module.exports = mongoose.model('Project', projectSchema);
