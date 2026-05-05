# Dokumentasi Teknis - InvenTrack

## 1. Deskripsi Aplikasi

InvenTrack adalah aplikasi manajemen inventaris peralatan kantor berbasis web yang digunakan oleh bagian logistik untuk mencatat, melacak, dan mengelola barang inventaris. Aplikasi mendukung tiga peran pengguna: Staff, Petugas Inventaris, dan Admin.

## 2. Arsitektur Sistem

### 2.1 Diagram Arsitektur

```
┌──────────────────┐     HTTP/REST     ┌──────────────────┐     Mongoose     ┌──────────┐
│   React Client   │ ◄──────────────► │  Express Server  │ ◄──────────────► │ MongoDB  │
│   (Vite + React) │                   │  (Node.js)       │                  │          │
└──────────────────┘                   └──────────────────┘                  └──────────┘
```

### 2.2 Stack Teknologi

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Frontend | React + Vite | 19.x / 8.x |
| Routing | React Router | 7.x |
| Charting | Recharts | 3.x |
| HTTP Client | Axios | 1.x |
| Backend | Express.js | 4.x |
| ORM | Mongoose | 8.x |
| Auth | JWT + bcryptjs | - |
| Database | MongoDB | 7.x |
| Testing | Vitest + RTL | - |

## 3. Database Schema

### 3.1 User
| Field | Type | Deskripsi |
|-------|------|-----------|
| name | String | Nama lengkap |
| email | String | Email unik |
| password | String | Hash bcrypt |
| role | Enum | staff / petugas / admin |
| department | String | Departemen |

### 3.2 Item (Barang Inventaris)
| Field | Type | Deskripsi |
|-------|------|-----------|
| code | String | Kode unik auto-generate |
| name | String | Nama barang |
| category | Enum | Komputer, Laptop, Proyektor, dll |
| brand | String | Merek |
| condition | Enum | Baik / Rusak Ringan / Rusak Berat |
| status | Enum | Tersedia / Dipinjam / Rusak |
| location | String | Lokasi penyimpanan |
| quantity | Number | Jumlah |
| createdBy | ObjectId | Referensi ke User |

### 3.3 Borrowing (Peminjaman)
| Field | Type | Deskripsi |
|-------|------|-----------|
| item | ObjectId | Referensi ke Item |
| borrower | ObjectId | Referensi ke User |
| borrowDate | Date | Tanggal pinjam |
| returnDate | Date | Tanggal rencana kembali |
| actualReturnDate | Date | Tanggal kembali aktual |
| status | Enum | Menunggu / Disetujui / Ditolak / Dikembalikan |
| purpose | String | Tujuan peminjaman |
| approvedBy | ObjectId | Yang menyetujui |

### 3.4 ActivityLog
| Field | Type | Deskripsi |
|-------|------|-----------|
| user | ObjectId | User pelaku |
| action | String | Kode aksi (CREATE_ITEM, dll) |
| target | String | Deskripsi target |
| timestamp | Date | Waktu kejadian |

## 4. API Reference

### 4.1 Authentication
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register (Admin only)
- `GET /api/auth/me` — Get current user

### 4.2 Items
- `GET /api/items` — List semua (filter, search, pagination)
- `GET /api/items/:id` — Detail
- `POST /api/items` — Tambah (Petugas/Admin)
- `PUT /api/items/:id` — Edit (Petugas/Admin)
- `DELETE /api/items/:id` — Hapus (Petugas/Admin)

### 4.3 Borrowings
- `GET /api/borrowings` — List semua (Petugas/Admin)
- `GET /api/borrowings/my` — List milik sendiri
- `POST /api/borrowings` — Ajukan peminjaman
- `PUT /api/borrowings/:id/approve` — Setujui
- `PUT /api/borrowings/:id/reject` — Tolak
- `PUT /api/borrowings/:id/return` — Kembalikan

### 4.4 Reports (Admin only)
- `GET /api/reports/summary` — Ringkasan
- `GET /api/reports/category-distribution` — Distribusi kategori
- `GET /api/reports/monthly-trends` — Tren bulanan
- `GET /api/reports/borrowing-stats` — Statistik peminjaman

### 4.5 Users & Logs (Admin only)
- `GET /api/users` — List user
- `PUT /api/users/:id` — Edit user
- `DELETE /api/users/:id` — Hapus user
- `GET /api/users/logs/activity` — Log aktivitas

## 5. Role-Based Access Control

| Fitur | Staff | Petugas | Admin |
|-------|-------|---------|-------|
| Lihat inventaris | ✅ | ✅ | ✅ |
| CRUD barang | ❌ | ✅ | ✅ |
| Ajukan peminjaman | ✅ | ✅ | ✅ |
| Setujui/tolak peminjaman | ❌ | ✅ | ✅ |
| Lihat laporan | ❌ | ❌ | ✅ |
| Kelola user | ❌ | ❌ | ✅ |
| Lihat log aktivitas | ❌ | ❌ | ✅ |

## 6. Testing

Menggunakan **Vitest** sebagai test runner dan **React Testing Library** untuk component testing.

### Menjalankan Test
```bash
cd client
npm run test:run
```

### Cakupan Test
- Sidebar: rendering, navigasi sesuai role, info user
- Navbar: rendering title dan greeting
- Modal: open/close state
- ProtectedRoute: auth guard dan role guard

## 7. Cara Menjalankan

1. Pastikan MongoDB berjalan di `localhost:27017`
2. `cd server && npm install && npm run seed`
3. `cd server && npm run dev`
4. `cd client && npm install && npm run dev`
5. Buka `http://localhost:5173`
