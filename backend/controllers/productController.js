const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { name, category, unit, description, hsnCode, gstRate, basePrice, stock, batchNumbers } = req.body;
    const tenantId = req.tenantId;
    const createdBy = req.user?.id;

    const product = await Product.create({
      name,
      category,
      unit,
      description,
      hsnCode,
      gstRate,
      basePrice,
      stock: {
        quantity: stock?.quantity || 0,
        minQuantity: stock?.minQuantity || 0
      },
      batchNumbers,
      tenantId,
      createdBy
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, search, isActive } = req.query;
    const tenantId = req.tenantId;

    const query = { tenantId };
    
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { hsnCode: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .sort({ name: 1 })
      .lean();

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const tenantId = req.tenantId;
    const updatedBy = req.user?.id;

    // Ensure we're only updating the correct tenant's product
    const product = await Product.findById(id);
    if (!product || product.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedBy },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    // Ensure we're only deleting the correct tenant's product
    const product = await Product.findById(id);
    if (!product || product.tenantId !== tenantId) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    // Soft delete by setting isActive to false
    await Product.findByIdAndUpdate(id, { isActive: false });
    
    res.json({ message: 'Product deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating product:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getProductReport = async (req, res) => {
  try {
    const { category, search, isActive } = req.query;
    const tenantId = req.tenantId;

    const pipeline = [
      { $match: { tenantId } },
      { $lookup: {
        from: 'grns',
        localField: '_id',
        foreignField: 'items.productId',
        as: 'grnHistory'
      }},
      { $lookup: {
        from: 'purchaseorders',
        localField: '_id',
        foreignField: 'items.productId',
        as: 'poHistory'
      }},
      { $project: {
        name: 1,
        code: 1,
        category: 1,
        unit: 1,
        basePrice: 1,
        stock: 1,
        grnCount: { $size: '$grnHistory' },
        poCount: { $size: '$poHistory' },
        totalGrnAmount: {
          $reduce: {
            input: '$grnHistory.items',
            initialValue: 0,
            in: {
              $add: [
                '$$value',
                {
                  $cond: {
                    if: { $eq: ['$$this.productId', '$_id'] },
                    then: '$$this.totalAmount',
                    else: 0
                  }
                }
              ]
            }
          }
        }
      }}
    ];

    if (category) pipeline.unshift({ $match: { category } });
    if (isActive !== undefined) pipeline.unshift({ $match: { isActive: isActive === 'true' } });
    if (search) {
      pipeline.unshift({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
            { hsnCode: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    const products = await Product.aggregate(pipeline);
    res.json(products);
  } catch (err) {
    console.error('Error generating product report:', err);
    res.status(400).json({ error: err.message });
  }
};
