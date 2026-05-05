const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Nama barang harus diisi'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Kategori harus diisi'],
    enum: ['Komputer', 'Laptop', 'Proyektor', 'Meja', 'Kursi', 'Printer', 'Telepon', 'Scanner', 'AC', 'Lainnya']
  },
  brand: {
    type: String,
    default: ''
  },
  condition: {
    type: String,
    enum: ['Baik', 'Rusak Ringan', 'Rusak Berat'],
    default: 'Baik'
  },
  status: {
    type: String,
    enum: ['Tersedia', 'Dipinjam', 'Rusak'],
    default: 'Tersedia'
  },
  location: {
    type: String,
    default: ''
  },
  acquisitionDate: {
    type: Date,
    default: Date.now
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate item code before saving
itemSchema.pre('save', async function(next) {
  if (!this.code) {
    const count = await mongoose.model('Item').countDocuments();
    this.code = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);
