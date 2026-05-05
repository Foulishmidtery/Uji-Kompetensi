const Item = require('../models/Item');
const Borrowing = require('../models/Borrowing');

// @desc    Get inventory summary
// @route   GET /api/reports/summary
exports.getSummary = async (req, res, next) => {
  try {
    const totalItems = await Item.countDocuments();
    const available = await Item.countDocuments({ status: 'Tersedia' });
    const borrowed = await Item.countDocuments({ status: 'Dipinjam' });
    const damaged = await Item.countDocuments({ status: 'Rusak' });

    const totalBorrowings = await Borrowing.countDocuments();
    const pendingBorrowings = await Borrowing.countDocuments({ status: 'Menunggu' });
    const activeBorrowings = await Borrowing.countDocuments({ status: 'Disetujui' });
    const returnedBorrowings = await Borrowing.countDocuments({ status: 'Dikembalikan' });

    res.json({
      success: true,
      data: {
        inventory: { totalItems, available, borrowed, damaged },
        borrowings: { totalBorrowings, pendingBorrowings, activeBorrowings, returnedBorrowings }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category distribution
// @route   GET /api/reports/category-distribution
exports.getCategoryDistribution = async (req, res, next) => {
  try {
    const distribution = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: distribution.map(d => ({ name: d._id, value: d.count }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly borrowing trends
// @route   GET /api/reports/monthly-trends
exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      months.push({ start, end });
    }

    const trends = await Promise.all(
      months.map(async ({ start, end }) => {
        const requested = await Borrowing.countDocuments({
          createdAt: { $gte: start, $lte: end }
        });
        const returned = await Borrowing.countDocuments({
          actualReturnDate: { $gte: start, $lte: end }
        });
        return {
          month: start.toLocaleString('id-ID', { month: 'short', year: 'numeric' }),
          peminjaman: requested,
          pengembalian: returned
        };
      })
    );

    res.json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
};

// @desc    Get borrowing stats
// @route   GET /api/reports/borrowing-stats
exports.getBorrowingStats = async (req, res, next) => {
  try {
    const statusStats = await Borrowing.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topItems = await Borrowing.aggregate([
      { $group: { _id: '$item', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'itemInfo'
        }
      },
      { $unwind: '$itemInfo' },
      {
        $project: {
          name: '$itemInfo.name',
          code: '$itemInfo.code',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: statusStats.map(s => ({ name: s._id, value: s.count })),
        topItems
      }
    });
  } catch (error) {
    next(error);
  }
};
