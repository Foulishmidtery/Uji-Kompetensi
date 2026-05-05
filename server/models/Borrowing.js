const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date,
    required: [true, 'Tanggal pengembalian harus diisi']
  },
  actualReturnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Menunggu', 'Disetujui', 'Ditolak', 'Dipinjam', 'Dikembalikan'],
    default: 'Menunggu'
  },
  purpose: {
    type: String,
    required: [true, 'Tujuan peminjaman harus diisi']
  },
  notes: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Borrowing', borrowingSchema);
