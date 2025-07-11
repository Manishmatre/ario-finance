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
    let projects = await Project.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 });

    // For each project, recalculate receivedAmount from payments
    const projectIds = projects.map(p => p._id);
    const payments = await ProjectPayment.find({ projectId: { $in: projectIds }, tenantId: req.tenantId });
    const paymentsByProject = {};
    payments.forEach(p => {
      const pid = p.projectId.toString();
      if (!paymentsByProject[pid]) paymentsByProject[pid] = [];
      paymentsByProject[pid].push(p);
    });
    projects = projects.map(project => {
      const projObj = project.toObject();
      const sum = (paymentsByProject[project._id.toString()] || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      projObj.receivedAmount = sum;
      projObj.budget = Number(projObj.budget) || 0;
      return projObj;
    });

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
    // Recalculate receivedAmount
    const receivedAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const projObj = project.toObject();
    projObj.receivedAmount = receivedAmount;
    projObj.budget = Number(projObj.budget) || 0;
    res.json({
      ...projObj,
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

    // 4. Save payment and transaction
    await payment.save({ session });
    await txn.save({ session });

    // 5. If payment is bank transfer and bankAccountId is provided, update bank balance
    if (paymentMethod === 'bank_transfer' && bankAccountId) {
      const BankAccount = require('../models/BankAccount');
      const bankAcc = await BankAccount.findOne({ _id: bankAccountId, tenantId: req.tenantId }).session(session);
      if (bankAcc) {
        bankAcc.currentBalance = (bankAcc.currentBalance || 0) + Number(amount);
        await bankAcc.save({ session });
      }
    }

    // 6. Recalculate and persist receivedAmount as sum of all payments for this project
    const payments = await ProjectPayment.find({ projectId: project._id, tenantId: req.tenantId }).session(session);
    const sum = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    project.receivedAmount = sum;
    await project.save({ session });

    // 7. Update payment with transaction ID
    payment.transactionId = txn._id;
    await payment.save({ session });
    
    // 8. Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 9. Emit real-time update
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
    
    // 2. Get project and recalculate receivedAmount after deleting payment
    const project = await Project.findById(payment.projectId).session(session);
    // 3. Delete payment and transaction
    await ProjectPayment.deleteOne({ _id: payment._id }).session(session);
    if (txn) {
      await TransactionLine.deleteOne({ _id: txn._id }).session(session);
    }
    // 4. If payment was bank transfer and bankAccountId is present, subtract from bank balance
    if (payment.paymentMethod === 'bank_transfer' && payment.bankAccountId) {
      const BankAccount = require('../models/BankAccount');
      const bankAcc = await BankAccount.findOne({ _id: payment.bankAccountId, tenantId: req.tenantId }).session(session);
      if (bankAcc) {
        bankAcc.currentBalance = (bankAcc.currentBalance || 0) - Number(payment.amount);
        await bankAcc.save({ session });
      }
    }
    if (project) {
      const payments = await ProjectPayment.find({ projectId: project._id, tenantId: req.tenantId }).session(session);
      const sum = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      project.receivedAmount = sum;
      await project.save({ session });
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

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Exclude receivedAmount from being updated by user input
    const { receivedAmount, ...rest } = req.body;
    Object.assign(project, rest);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    // Optionally: delete related payments and transactions
    await ProjectPayment.deleteMany({ projectId: project._id });
    // You may also want to delete related TransactionLines if needed
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
