const express = require('express');
const router = express.Router();
const { getItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getItems)
  .post(authorize('petugas', 'admin'), createItem);

router.route('/:id')
  .get(getItem)
  .put(authorize('petugas', 'admin'), updateItem)
  .delete(authorize('petugas', 'admin'), deleteItem);

module.exports = router;
