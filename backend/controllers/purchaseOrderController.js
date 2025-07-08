const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { vendorId, items, poDate, status, remarks } = req.body;
    const tenantId = req.tenantId;
    const createdBy = req.user?.id;

    // Validate vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Generate PO reference number
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    const lastPO = await PurchaseOrder.findOne({ tenantId })
      .sort({ createdAt: -1 })
      .select('poRef');

    let sequence = 1;
    if (lastPO) {
      const match = lastPO.poRef.match(/\d+$/);
      if (match) {
        sequence = parseInt(match[0]) + 1;
      }
    }

    const poRef = `PO/${year}${month}/${sequence.toString().padStart(4, '0')}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    const purchaseOrder = await PurchaseOrder.create({
      poRef,
      vendorId,
      poDate: poDate || new Date(),
      items,
      totalAmount,
      status: status || 'draft',
      remarks,
      tenantId,
      createdBy
    });

    res.status(201).json(purchaseOrder);
  } catch (err) {
    console.error('Error creating purchase order:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status, vendorId, startDate, endDate, search } = req.query;
    const tenantId = req.tenantId;

    const query = { tenantId };
    
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;
    if (startDate) query.poDate = { $gte: new Date(startDate) };
    if (endDate) {
      if (!query.poDate) query.poDate = {};
      query.poDate.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { poRef: { $regex: search, $options: 'i' } },
        { 'items.productId': { $regex: search, $options: 'i' } }
      ];
    }

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('vendorId', 'name')
      .populate('items.productId', 'name')
      .sort({ poDate: -1 })
      .lean();

    res.json(purchaseOrders);
  } catch (err) {
    console.error('Error fetching purchase orders:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate('vendorId', 'name')
      .populate('items.productId', 'name')
      .lean();

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(purchaseOrder);
  } catch (err) {
    console.error('Error fetching purchase order:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tenantId = req.tenantId;
    const updatedBy = req.user?.id;

    // Ensure we're only updating the correct tenant's PO
    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder || purchaseOrder.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Purchase order not found or unauthorized' });
    }

    // If items are being updated, recalculate total amount
    if (updates.items) {
      updates.totalAmount = updates.items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    }

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      { ...updates, updatedBy },
      { new: true }
    ).populate('vendorId', 'name')
      .populate('items.productId', 'name');

    res.json(updatedPO);
  } catch (err) {
    console.error('Error updating purchase order:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    // Ensure we're only deleting the correct tenant's PO
    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder || purchaseOrder.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Purchase order not found or unauthorized' });
    }

    // Check if PO has any associated GRNs
    if (purchaseOrder.grns && purchaseOrder.grns.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete purchase order with associated GRNs'
      });
    }

    await PurchaseOrder.findByIdAndDelete(id);
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (err) {
    console.error('Error deleting purchase order:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getPurchaseOrderReport = async (req, res) => {
  try {
    const { startDate, endDate, vendorId } = req.query;
    const tenantId = req.tenantId;

    const query = { tenantId };
    if (startDate) query.poDate = { $gte: new Date(startDate) };
    if (endDate) query.poDate = { $lte: new Date(endDate) };
    if (vendorId) query.vendorId = vendorId;

    const purchaseOrders = await PurchaseOrder.aggregate([
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
        poRef: 1,
        poDate: 1,
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
        totalAmount: 1,
        status: 1,
        createdAt: 1,
        grns: {
          $size: '$grns'
        }
      }}
    ]);

    res.json(purchaseOrders);
  } catch (err) {
    console.error('Error generating purchase order report:', err);
    res.status(400).json({ error: err.message });
  }
};
