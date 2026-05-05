const express = require('express');
const router = express.Router();
const { getSummary, getCategoryDistribution, getMonthlyTrends, getBorrowingStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Dashboard endpoints (accessible by all roles)
router.get('/summary', getSummary);
router.get('/category-distribution', getCategoryDistribution);

// Detailed reports (admin only)
router.get('/monthly-trends', authorize('admin'), getMonthlyTrends);
router.get('/borrowing-stats', authorize('admin'), getBorrowingStats);

module.exports = router;
