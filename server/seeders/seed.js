const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const Borrowing = require('../models/Borrowing');
const ActivityLog = require('../models/ActivityLog');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data and drop indexes to avoid stale unique constraints
    await User.deleteMany({});
    await Borrowing.deleteMany({});
    await ActivityLog.deleteMany({});
    await Item.collection.drop().catch(() => {}); // drop entire collection to clear indexes
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin InvenTrack',
      email: 'admin@inventrack.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT'
    });

    const petugas = await User.create({
      name: 'Budi Santoso',
      email: 'petugas@inventrack.com',
      password: 'petugas123',
      role: 'petugas',
      department: 'Logistik'
    });

    const staff = await User.create({
      name: 'Rina Wati',
      email: 'staff@inventrack.com',
      password: 'staff123',
      role: 'staff',
      department: 'Keuangan'
    });

    console.log('Users created');

    // Create items one-by-one to avoid duplicate code from concurrent pre-save hooks
    const itemsData = [
      { name: 'Komputer Desktop HP ProDesk', category: 'Komputer', brand: 'HP', condition: 'Baik', status: 'Tersedia', location: 'Ruang IT', quantity: 1, description: 'Desktop workstation untuk staf IT', createdBy: admin._id },
      { name: 'Laptop Lenovo ThinkPad X1', category: 'Laptop', brand: 'Lenovo', condition: 'Baik', status: 'Tersedia', location: 'Gudang', quantity: 1, description: 'Laptop bisnis premium 14 inch', createdBy: admin._id },
      { name: 'Proyektor Epson EB-X51', category: 'Proyektor', brand: 'Epson', condition: 'Baik', status: 'Tersedia', location: 'Ruang Rapat', quantity: 1, description: 'Proyektor 3800 lumens XGA', createdBy: petugas._id },
      { name: 'Meja Kerja Ergonomis', category: 'Meja', brand: 'IKEA', condition: 'Baik', status: 'Tersedia', location: 'Lantai 2', quantity: 5, description: 'Meja kerja adjustable height', createdBy: petugas._id },
      { name: 'Kursi Kantor Executive', category: 'Kursi', brand: 'Herman Miller', condition: 'Baik', status: 'Tersedia', location: 'Lantai 1', quantity: 3, description: 'Kursi ergonomis premium', createdBy: admin._id },
      { name: 'Printer HP LaserJet Pro', category: 'Printer', brand: 'HP', condition: 'Baik', status: 'Tersedia', location: 'Ruang Cetak', quantity: 2, description: 'Printer laser monochrome A4', createdBy: petugas._id },
      { name: 'Telepon IP Cisco 8845', category: 'Telepon', brand: 'Cisco', condition: 'Baik', status: 'Tersedia', location: 'Resepsionis', quantity: 4, description: 'IP phone dengan video call', createdBy: admin._id },
      { name: 'Scanner Fujitsu ScanSnap', category: 'Scanner', brand: 'Fujitsu', condition: 'Rusak Ringan', status: 'Tersedia', location: 'Ruang Arsip', quantity: 1, description: 'Document scanner portable', createdBy: petugas._id },
      { name: 'AC Daikin Inverter 2PK', category: 'AC', brand: 'Daikin', condition: 'Baik', status: 'Tersedia', location: 'Ruang Server', quantity: 2, description: 'AC inverter hemat energi', createdBy: admin._id },
      { name: 'Laptop ASUS VivoBook', category: 'Laptop', brand: 'ASUS', condition: 'Baik', status: 'Dipinjam', location: '-', quantity: 1, description: 'Laptop untuk presentasi', createdBy: petugas._id },
      { name: 'Proyektor BenQ MH733', category: 'Proyektor', brand: 'BenQ', condition: 'Rusak Berat', status: 'Rusak', location: 'Gudang', quantity: 1, description: 'Proyektor FHD - lampu rusak', createdBy: admin._id },
      { name: 'Komputer All-in-One Lenovo', category: 'Komputer', brand: 'Lenovo', condition: 'Baik', status: 'Tersedia', location: 'Front Office', quantity: 1, description: 'AIO PC 24 inch untuk CS', createdBy: petugas._id },
      { name: 'Printer Canon PIXMA G3020', category: 'Printer', brand: 'Canon', condition: 'Baik', status: 'Tersedia', location: 'Ruang Keuangan', quantity: 1, description: 'Printer inkjet warna A4', createdBy: admin._id },
      { name: 'Webcam Logitech C920', category: 'Lainnya', brand: 'Logitech', condition: 'Baik', status: 'Tersedia', location: 'Gudang', quantity: 3, description: 'Webcam FHD untuk meeting', createdBy: petugas._id },
      { name: 'UPS APC Back-UPS 1100VA', category: 'Lainnya', brand: 'APC', condition: 'Baik', status: 'Tersedia', location: 'Ruang Server', quantity: 2, description: 'Uninterruptible Power Supply', createdBy: admin._id }
    ];

    const items = [];
    for (const data of itemsData) {
      const item = await Item.create(data);
      items.push(item);
    }

    console.log('Items created');

    // Create sample borrowings
    await Borrowing.create([
      {
        item: items[9]._id,
        borrower: staff._id,
        borrowDate: new Date('2026-04-28'),
        returnDate: new Date('2026-05-10'),
        status: 'Disetujui',
        purpose: 'Presentasi project ke klien',
        approvedBy: petugas._id
      },
      {
        item: items[2]._id,
        borrower: staff._id,
        borrowDate: new Date(),
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'Menunggu',
        purpose: 'Meeting rutin mingguan'
      }
    ]);

    console.log('Borrowings created');

    // Create some activity logs
    await ActivityLog.create([
      { user: admin._id, action: 'CREATE_ITEM', target: 'Menambahkan 15 barang inventaris awal', timestamp: new Date() },
      { user: petugas._id, action: 'APPROVE_BORROW', target: 'Menyetujui peminjaman laptop ASUS VivoBook', timestamp: new Date() },
      { user: staff._id, action: 'REQUEST_BORROW', target: 'Mengajukan peminjaman proyektor Epson', timestamp: new Date() }
    ]);

    console.log('Activity logs created');
    console.log('\n✅ Seeding completed!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin:   admin@inventrack.com / admin123');
    console.log('   Petugas: petugas@inventrack.com / petugas123');
    console.log('   Staff:   staff@inventrack.com / staff123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
