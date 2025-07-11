const PurchaseBill = require('../models/PurchaseBill');
const { uploadFile } = require('../utils/storage');
const TransactionLine = require('../models/TransactionLine');
const BankAccount = require('../models/BankAccount');
const Vendor = require('../models/Vendor');
const { getIO } = require('../socket');

exports.uploadBill = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const { vendorId, billNo, billDate, amount, projectId } = req.body;
    console.log('Received uploadBill request');
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    let fileUrl;
    try {
      fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      console.log('Cloudinary upload success, fileUrl:', fileUrl);
      if (!fileUrl || typeof fileUrl !== 'string' || !/^https?:\/\//.test(fileUrl)) {
        console.error('Cloudinary did not return a valid URL:', fileUrl);
      }
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      return res.status(500).json({ error: 'File upload failed', details: uploadErr.message || uploadErr });
    }
    let fixedVendorId = vendorId;
    if (vendorId && typeof vendorId === 'object') {
      fixedVendorId = vendorId._id || vendorId.value || '';
      if (Array.isArray(vendorId)) fixedVendorId = vendorId[0];
      if (typeof fixedVendorId === 'object') fixedVendorId = String(fixedVendorId);
    }
    const bill = await PurchaseBill.create({
      vendorId: fixedVendorId, billNo, billDate, amount, projectId,
      fileUrl, tenantId: req.tenantId, createdBy: req.user?.id
    });
    const populatedBill = await PurchaseBill.findById(bill._id).populate('vendorId', 'name');
    // Create and emit a real notification
    const Notification = require('../models/Notification');
    const io = getIO();
    const notification = await Notification.create({
      userId: null, // or set to a specific user if needed
      type: 'billCreated',
      message: `A new bill (${bill.billNo}) was created for vendor ${populatedBill.vendorId?.name || ''}`,
      data: { billId: bill._id, vendor: populatedBill.vendorId?.name },
    });
    io.emit('notification', notification);
    res.status(201).json(populatedBill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.payBill = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const bill = await PurchaseBill.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!bill) return res.status(404).json({ error: 'Not found' });
    if (bill.isPaid) return res.status(400).json({ error: 'Bill already paid' });

    // Minimal status-only update
    if (req.body && Object.keys(req.body).length === 1 && req.body.isPaid === true) {
      bill.isPaid = true;
      await bill.save();
      return res.json(bill);
    }

    const { ourBankAccount, paymentMode, amount, narration } = req.body;
    let paymentAmount = amount || bill.amount;
    let narrationText = narration || `Payment for Bill ${bill.billNo}`;

    // 1. Find vendor account (by vendor name/code/tenant)
    const vendor = await Vendor.findById(bill.vendorId);
    if (!vendor) return res.status(400).json({ error: 'Vendor not found' });
    // Remove all Account model and Chart of Accounts logic. Use only BankAccount.
    // const vendorAccount = await Account.findOne({ name: vendor.name, tenantId: req.tenantId });
    // if (!vendorAccount) return res.status(400).json({ error: 'Vendor account not found in Chart of Accounts' });

    // 2. Find our bank account (by _id)
    let bankAccountDoc = null;
    let bankAccount = null;
    if (ourBankAccount) {
      bankAccountDoc = await BankAccount.findOne({ _id: ourBankAccount, tenantId: req.tenantId });
      if (!bankAccountDoc) return res.status(400).json({ error: 'Company bank account not found' });
      // Remove all Account model and Chart of Accounts logic. Use only BankAccount.
      // bankAccount = await Account.findOne({ name: bankAccountDoc.bankName, tenantId: req.tenantId });
      // if (!bankAccount) return res.status(400).json({ error: 'Bank account not found in Chart of Accounts' });
    } else {
      return res.status(400).json({ error: 'Bank account required for this payment mode' });
    }

    // Only allow bank transfer payment modes
    if (!["UPI", "NEFT", "RTGS", "IMPS", "Cheque"].includes(paymentMode)) {
      return res.status(400).json({ error: 'Only bank transfer payment modes are allowed' });
    }

    // 3. Create transaction (bank-centric)
    const txn = await TransactionLine.create({
      date: new Date(),
      bankAccountId: bankAccountDoc._id,
      debitAccount: bankAccountDoc._id,
      creditAccount: null,
      vendorId: vendor._id,
      amount: -Math.abs(paymentAmount), // Always negative for bill payments
      narration: narrationText,
      tenantId: req.tenantId,
      createdBy: req.user?.id
    });

    // 4. Add payment record to bill
    bill.payments = bill.payments || [];
    bill.payments.push({
      amount: paymentAmount,
      date: new Date(),
      paymentMode,
      bankAccount: bankAccountDoc._id,
      transactionId: txn._id,
      vendorBankAccount: req.body.vendorBankAccount || undefined
    });

    // 5. Update bill payment status
    const totalPaid = bill.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    if (totalPaid >= bill.amount) {
      bill.isPaid = true;
      bill.paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      bill.isPaid = false;
      bill.paymentStatus = 'partial';
    } else {
      bill.isPaid = false;
      bill.paymentStatus = 'pending';
    }
    bill.relatedTxnId = txn._id;
    await bill.save();

    // 6. Update bank account balance
    bankAccountDoc.currentBalance = (bankAccountDoc.currentBalance || 0) - paymentAmount;
    await bankAccountDoc.save();

    res.json({ bill, txn });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listBills = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const bills = await PurchaseBill.find({ tenantId: req.tenantId }).populate('vendorId', 'name');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const bill = await PurchaseBill.findOne({ _id: req.params.id, tenantId: req.tenantId }).populate('vendorId', 'name');
    if (!bill) return res.status(404).json({ error: 'Not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    let vendorId = req.body.vendorId;
    let fixedVendorId = vendorId;
    if (vendorId && typeof vendorId === 'object') {
      fixedVendorId = vendorId._id || vendorId.value || '';
      if (Array.isArray(vendorId)) fixedVendorId = vendorId[0];
      if (typeof fixedVendorId === 'object') fixedVendorId = String(fixedVendorId);
    }
    let updateData = {
      ...req.body,
      vendorId: fixedVendorId
    };
    if (req.file) {
      try {
        const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
        updateData.fileUrl = fileUrl;
      } catch (uploadErr) {
        console.error('Cloudinary upload error (updateBill):', uploadErr);
        return res.status(500).json({ error: 'File upload failed', details: uploadErr.message || uploadErr });
      }
    }
    const bill = await PurchaseBill.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updateData,
      { new: true }
    ).populate('vendorId', 'name');
    if (!bill) return res.status(404).json({ error: 'Not found' });
    const io = getIO();
io.emit('billUpdated', bill);
    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    if (!req.tenantId) return res.status(400).json({ error: 'Missing tenantId' });
    const bill = await PurchaseBill.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!bill) return res.status(404).json({ error: 'Not found' });
    const io = getIO();
io.emit('billDeleted', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
