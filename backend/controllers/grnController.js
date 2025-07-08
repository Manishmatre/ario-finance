const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs').promises;

// Helper functions
const generateGRNNumber = async (tenantId) => {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  
  const lastGRN = await GRN.findOne({ tenantId })
    .sort({ createdAt: -1 })
    .select('grnNumber');

  let sequence = 1;
  if (lastGRN) {
    const match = lastGRN.grnNumber.match(/\d+$/);
    if (match) {
      sequence = parseInt(match[0]) + 1;
    }
  }

  return `GRN/${year}${month}/${sequence.toString().padStart(4, '0')}`;
};

// Routes
exports.createGRN = async (req, res) => {
  try {
    const { poRef, vendorId, items, remarks } = req.body;
    const tenantId = req.tenantId;
    const createdBy = req.user?.id;

    // Validate purchase order
    const po = await PurchaseOrder.findOne({ poRef, vendorId, tenantId });
    if (!po) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Generate GRN number
    const grnNumber = await exports.generateGRNNumber(tenantId);

    // Handle bill file upload if provided
    let billFileUrl = null;
    if (req.file) {
      billFileUrl = path.join('/uploads', req.file.filename);
    }

    // Create GRN
    const grn = await GRN.create({
      grnNumber,
      poRef,
      vendorId,
      grnDate: new Date(),
      items,
      billDetails: {
        billNumber: req.body.billNumber,
        billDate: req.body.billDate,
        billAmount: req.body.billAmount,
        billFile: billFileUrl,
        billMatched: false
      },
      status: 'pending',
      remarks,
      tenantId,
      createdBy
    });

    // Update purchase order status
    await PurchaseOrder.findByIdAndUpdate(po._id, {
      $push: { grns: grn._id },
      status: 'partially_received',
      updatedBy: createdBy
    });

    res.status(201).json(grn);
  } catch (err) {
    console.error('Error creating GRN:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getGRNs = async (req, res) => {
  try {
    const { status, vendorId, startDate, endDate, search } = req.query;
    const tenantId = req.tenantId;

    const query = { tenantId };
    
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;
    if (startDate) query.grnDate = { $gte: new Date(startDate) };
    if (endDate) {
      if (!query.grnDate) query.grnDate = {};
      query.grnDate.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { grnNumber: { $regex: search, $options: 'i' } },
        { poRef: { $regex: search, $options: 'i' } },
        { 'billDetails.billNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const grns = await GRN.find(query)
      .populate('vendorId', 'name')
      .populate('items.productId', 'name')
      .sort({ grnDate: -1 })
      .lean();

    res.json(grns);
  } catch (err) {
    console.error('Error fetching GRNs:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findById(id)
      .populate('vendorId', 'name')
      .populate('items.productId', 'name')
      .lean();

    if (!grn) {
      return res.status(404).json({ error: 'GRN not found' });
    }

    res.json(grn);
  } catch (err) {
    console.error('Error fetching GRN:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tenantId = req.tenantId;
    const updatedBy = req.user?.id;

    // Ensure we're only updating the correct tenant's GRN
    const grn = await GRN.findById(id);
    if (!grn || grn.tenantId !== tenantId) {
      return res.status(404).json({ error: 'GRN not found or unauthorized' });
    }

    // If items are being updated, recalculate total amount
    if (updates.items) {
      updates.totalAmount = updates.items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    }

    // Handle bill file update
    if (req.file) {
      updates.billDetails = updates.billDetails || {};
      updates.billDetails.billFile = path.join('/uploads', req.file.filename);
    }

    const updatedGRN = await GRN.findByIdAndUpdate(
      id,
      { ...updates, updatedBy },
      { new: true }
    ).populate('vendorId', 'name')
      .populate('items.productId', 'name');

    res.json(updatedGRN);
  } catch (err) {
    console.error('Error updating GRN:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    // Ensure we're only deleting the correct tenant's GRN
    const grn = await GRN.findById(id);
    if (!grn || grn.tenantId !== tenantId) {
      return res.status(404).json({ error: 'GRN not found or unauthorized' });
    }

    // Check if GRN has any associated bills
    if (grn.billDetails?.billMatched) {
      return res.status(400).json({
        error: 'Cannot delete GRN with matched bill'
      });
    }

    // Update purchase order by removing this GRN
    await PurchaseOrder.updateOne(
      { poRef: grn.poRef, tenantId },
      { $pull: { grns: id } }
    );

    await GRN.findByIdAndDelete(id);
    res.json({ message: 'GRN deleted successfully' });
  } catch (err) {
    console.error('Error deleting GRN:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.matchBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { billNumber, billDate, billAmount } = req.body;

    const grn = await GRN.findByIdAndUpdate(
      id,
      {
        'billDetails.billNumber': billNumber,
        'billDetails.billDate': billDate,
        'billDetails.billAmount': billAmount,
        'billDetails.billMatched': true,
        status: 'matched',
        updatedBy: req.user?.id
      },
      { new: true }
    ).populate('vendorId', 'name')
      .populate('items.productId', 'name');

    if (!grn) {
      return res.status(404).json({ error: 'GRN not found' });
    }

    res.json(grn);
  } catch (err) {
    console.error('Error matching bill:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getGRNReport = async (req, res) => {
  try {
    const { startDate, endDate, vendorId } = req.query;
    const tenantId = req.tenantId;

    const query = { tenantId };
    if (startDate) query.grnDate = { $gte: new Date(startDate) };
    if (endDate) query.grnDate = { $lte: new Date(endDate) };
    if (vendorId) query.vendorId = vendorId;

    const grns = await GRN.aggregate([
      { $match: query },
      { $lookup: {
        from: 'vendors',
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor'
      }},
      { $unwind: '$vendor' },
      { $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'products'
      }},
      { $project: {
        grnNumber: 1,
        poRef: 1,
        grnDate: 1,
        vendor: { name: 1 },
        items: {
          $map: {
            input: '$items',
            as: 'item',
            in: {
              $mergeObjects: [
                '$$item',
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$products',
                        as: 'prod',
                        cond: { $eq: ['$$prod._id', '$$item.productId'] }
                      }
                    },
                    0
                  ]
                }
              ]
            }
          }
        },
        totalAmount: { $sum: '$items.totalAmount' },
        status: 1,
        createdAt: 1
      }}
    ]);

    res.json(grns);
  } catch (err) {
    console.error('Error generating GRN report:', err);
    res.status(400).json({ error: err.message });
  }
};
