const Borrowing = require('../models/Borrowing');
const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all borrowings
// @route   GET /api/borrowings
exports.getBorrowings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Borrowing.countDocuments(query);
    const borrowings = await Borrowing.find(query)
      .populate('item', 'name code category')
      .populate('borrower', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: borrowings,
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

// @desc    Get my borrowings
// @route   GET /api/borrowings/my
exports.getMyBorrowings = async (req, res, next) => {
  try {
    const borrowings = await Borrowing.find({ borrower: req.user._id })
      .populate('item', 'name code category')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: borrowings });
  } catch (error) {
    next(error);
  }
};

// @desc    Create borrowing request
// @route   POST /api/borrowings
exports.createBorrowing = async (req, res, next) => {
  try {
    const { item: itemId, returnDate, purpose, notes } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
    }
    if (item.status !== 'Tersedia') {
      return res.status(400).json({ success: false, message: 'Barang tidak tersedia untuk dipinjam' });
    }

    const borrowing = await Borrowing.create({
      item: itemId,
      borrower: req.user._id,
      returnDate,
      purpose,
      notes
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'REQUEST_BORROW',
      target: `Mengajukan peminjaman: ${item.name} (${item.code})`,
      targetId: borrowing._id
    });

    const populated = await Borrowing.findById(borrowing._id)
      .populate('item', 'name code category')
      .populate('borrower', 'name email department');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve borrowing
// @route   PUT /api/borrowings/:id/approve
exports.approveBorrowing = async (req, res, next) => {
  try {
    let borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) {
      return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan' });
    }
    if (borrowing.status !== 'Menunggu') {
      return res.status(400).json({ success: false, message: 'Peminjaman sudah diproses' });
    }

    borrowing.status = 'Disetujui';
    borrowing.approvedBy = req.user._id;
    await borrowing.save();

    // Update item status
    await Item.findByIdAndUpdate(borrowing.item, { status: 'Dipinjam' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'APPROVE_BORROW',
      target: `Menyetujui peminjaman #${borrowing._id}`,
      targetId: borrowing._id
    });

    const populated = await Borrowing.findById(borrowing._id)
      .populate('item', 'name code category')
      .populate('borrower', 'name email department')
      .populate('approvedBy', 'name');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject borrowing
// @route   PUT /api/borrowings/:id/reject
exports.rejectBorrowing = async (req, res, next) => {
  try {
    let borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) {
      return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan' });
    }
    if (borrowing.status !== 'Menunggu') {
      return res.status(400).json({ success: false, message: 'Peminjaman sudah diproses' });
    }

    borrowing.status = 'Ditolak';
    borrowing.approvedBy = req.user._id;
    borrowing.notes = req.body.notes || borrowing.notes;
    await borrowing.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'REJECT_BORROW',
      target: `Menolak peminjaman #${borrowing._id}`,
      targetId: borrowing._id
    });

    const populated = await Borrowing.findById(borrowing._id)
      .populate('item', 'name code category')
      .populate('borrower', 'name email department')
      .populate('approvedBy', 'name');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Return item
// @route   PUT /api/borrowings/:id/return
exports.returnBorrowing = async (req, res, next) => {
  try {
    let borrowing = await Borrowing.findById(req.params.id);
    if (!borrowing) {
      return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan' });
    }
    if (borrowing.status !== 'Disetujui') {
      return res.status(400).json({ success: false, message: 'Barang belum dipinjam atau sudah dikembalikan' });
    }

    borrowing.status = 'Dikembalikan';
    borrowing.actualReturnDate = new Date();
    await borrowing.save();

    // Update item status back to available
    const itemCondition = req.body.condition || 'Baik';
    const itemStatus = itemCondition === 'Rusak Berat' ? 'Rusak' : 'Tersedia';
    await Item.findByIdAndUpdate(borrowing.item, {
      status: itemStatus,
      condition: itemCondition
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'RETURN_ITEM',
      target: `Mengembalikan barang dari peminjaman #${borrowing._id}`,
      targetId: borrowing._id
    });

    const populated = await Borrowing.findById(borrowing._id)
      .populate('item', 'name code category')
      .populate('borrower', 'name email department')
      .populate('approvedBy', 'name');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
