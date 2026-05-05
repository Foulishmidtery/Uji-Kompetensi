const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all items
// @route   GET /api/items
exports.getItems = async (req, res, next) => {
  try {
    const { search, category, status, condition, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (condition) query.condition = condition;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('createdBy', 'name');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create item
// @route   POST /api/items
exports.createItem = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const item = await Item.create(req.body);

    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_ITEM',
      target: `Menambahkan barang: ${item.name} (${item.code})`,
      targetId: item._id
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_ITEM',
      target: `Mengupdate barang: ${item.name} (${item.code})`,
      targetId: item._id,
      details: req.body
    });

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE_ITEM',
      target: `Menghapus barang: ${item.name} (${item.code})`,
      targetId: item._id
    });

    await Item.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Barang berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};
