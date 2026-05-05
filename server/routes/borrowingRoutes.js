const express = require('express');
const router = express.Router();
const {
  getBorrowings,
  getMyBorrowings,
  createBorrowing,
  approveBorrowing,
  rejectBorrowing,
  returnBorrowing
} = require('../controllers/borrowingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my', getMyBorrowings);
router.post('/', createBorrowing);

router.get('/', authorize('petugas', 'admin'), getBorrowings);
router.put('/:id/approve', authorize('petugas', 'admin'), approveBorrowing);
router.put('/:id/reject', authorize('petugas', 'admin'), rejectBorrowing);
router.put('/:id/return', authorize('petugas', 'admin'), returnBorrowing);

module.exports = router;
