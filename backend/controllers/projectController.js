const Project = require('../models/Project');
const ProjectPayment = require('../models/ProjectPayment');
const TransactionLine = require('../models/TransactionLine');
const mongoose = require('mongoose');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      tenantId: req.tenantId,
      createdBy: req.user?.id
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single project with payments
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const payments = await ProjectPayment.find({ 
      projectId: req.params.id,
      tenantId: req.tenantId 
    }).sort({ paymentDate: -1 });
    
    res.json({
      ...project.toObject(),
      payments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Record a payment for a project
exports.recordPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { amount, paymentDate, paymentMethod, referenceNumber, bankAccountId, notes } = req.body;
    const projectId = req.params.id;

    // 1. Verify project exists
    const project = await Project.findById(projectId).session(session);
    if (!project) {
      throw new Error('Project not found');
    }

    // 2. Create payment record
    const payment = new ProjectPayment({
      projectId,
      amount,
      paymentDate: paymentDate || Date.now(),
      paymentMethod,
      referenceNumber,
      bankAccountId,
      notes,
      tenantId: req.tenantId,
      createdBy: req.user?.id
    });
    
    // 3. Create accounting transaction
    const txn = new TransactionLine({
      date: paymentDate || new Date(),
      bankAccountId, // FIX: set required bankAccountId field
      debitAccount: bankAccountId, // Bank account receiving money
      creditAccount: 'income:project', // Income account for project payments
      amount,
      narration: `Payment received for project: ${project.name}`,
      reference: `PP-${projectId}-${Date.now()}`,
      tenantId: req.tenantId,
      createdBy: req.user?.id,
      metadata: {
        type: 'project_income',
        projectId: project._id,
        paymentId: payment._id
      }
    });

    // 4. Update project's received amount
    project.receivedAmount = (project.receivedAmount || 0) + amount;
    
    // 5. Save all changes in a transaction
    await payment.save({ session });
    await txn.save({ session });
    await project.save({ session });
    
    // 6. Update payment with transaction ID
    payment.transactionId = txn._id;
    await payment.save({ session });
    
    // 7. Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 8. Emit real-time update
    // io.emit('projectPaymentReceived', { projectId, amount });
    
    res.status(201).json(payment);
    
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

// Get all payments for a project
exports.getProjectPayments = async (req, res) => {
  try {
    const payments = await ProjectPayment.find({
      projectId: req.params.id,
      tenantId: req.tenantId
    })
    .sort({ paymentDate: -1 })
    .populate('bankAccountId', 'name accountNumber bankName');
    
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all payments for a client
exports.getPaymentsByClient = async (req, res) => {
  try {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });
    // Find all projects for this client
    const projects = await Project.find({ client: clientId, tenantId: req.tenantId });
    const projectIds = projects.map(p => p._id);
    // Find all payments for these projects
    const payments = await ProjectPayment.find({ projectId: { $in: projectIds }, tenantId: req.tenantId })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a payment (with transaction handling)
exports.deletePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const payment = await ProjectPayment.findById(req.params.paymentId).session(session);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // 1. Get related transaction
    const txn = await TransactionLine.findById(payment.transactionId).session(session);
    
    // 2. Get project and update received amount
    const project = await Project.findById(payment.projectId).session(session);
    if (project) {
      project.receivedAmount = Math.max(0, (project.receivedAmount || 0) - payment.amount);
      await project.save({ session });
    }
    
    // 3. Delete payment and transaction
    await ProjectPayment.deleteOne({ _id: payment._id }).session(session);
    if (txn) {
      await TransactionLine.deleteOne({ _id: txn._id }).session(session);
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({ message: 'Payment deleted successfully' });
    
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};

// Get a single project payment by ID
exports.getProjectPaymentById = async (req, res) => {
  try {
    const payment = await ProjectPayment.findById(req.params.paymentId)
      .populate({ path: 'projectId', populate: { path: 'client' } })
      .populate('bankAccountId')
      .lean();
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    // Optionally fetch transaction info
    let transaction = null;
    if (payment.transactionId) {
      transaction = await TransactionLine.findById(payment.transactionId).lean();
    }
    res.json({
      ...payment,
      project: payment.projectId,
      transaction
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
};
