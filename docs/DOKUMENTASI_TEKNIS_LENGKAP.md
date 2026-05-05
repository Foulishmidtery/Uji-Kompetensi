# Dokumentasi Teknis Lengkap - InvenTrack 🚀

**InvenTrack** adalah aplikasi manajemen inventaris berbasis web modern (MERN Stack + Vite) yang dirancang untuk mempermudah pelacakan, peminjaman, dan pencatatan barang logistik kantor. Dokumentasi ini mencakup arsitektur, struktur kode, logika bisnis, hasil pengujian, serta panduan *debugging* dan *profiling* untuk standar produksi.

---

## 1. Arsitektur & Teknologi

### 1.1 Topologi Sistem
Aplikasi ini menggunakan pendekatan *Client-Server* terpisah (*Decoupled Architecture*):
- **Frontend (Klien)**: Dibangun dengan React 19.x dan Vite. Berjalan di atas HTTP port `5173`. Menggunakan pola *Single Page Application (SPA)*.
- **Backend (Server)**: Dibangun dengan Node.js dan Express.js. Berjalan di port `5000`. Menyediakan antarmuka RESTful API murni (JSON).
- **Database**: MongoDB (via Mongoose) berjalan di `localhost:27017`.

### 1.2 Stack Teknologi Utama
- **UI/UX**: HTML5, CSS3 (*Glassmorphism Design*), `lucide-react`, `react-hot-toast` (Notifikasi).
- **Charting & Ekspor**: `recharts` (Grafik Analisis), `jspdf` & `xlsx` (Ekspor PDF/Excel), `qrcode.react` (Sistem Barcode).
- **Keamanan**: JWT (*JSON Web Tokens*) untuk otorisasi, `bcryptjs` untuk enkripsi password.
- **Pengujian (Testing)**: `vitest`, `@testing-library/react`, `jsdom`.

---

## 2. Struktur Kode & Folder

### 2.1 Backend (`/server`)
- `/config/db.js`: Logika koneksi ke MongoDB.
- `/controllers`: Logika bisnis pemrosesan *request*.
  - `authController.js`: Menangani proses otentikasi (Login, Register).
  - `itemController.js`: Menangani CRUD data barang fisik.
  - `borrowingController.js`: Menangani alur peminjaman (Approval/Reject/Return).
  - `reportController.js`: Melakukan agregasi data (Statistik, Chart) khusus untuk Admin.
- `/middleware`: Filter dan pengaman jalur API.
  - `authMiddleware.js`: Mengekstrak dan memvalidasi JWT dari *Header Authorization*.
  - `errorHandler.js`: Menangkap error terpusat lalu diformat menjadi JSON standar.
- `/models`: Skema Mongoose (*Item, User, Borrowing, ActivityLog*).
- `/routes`: Pintu masuk API (Routing Express).
- `server.js`: Titik awal (*Entry point*) backend.

### 2.2 Frontend (`/client`)
- `/src/components`: Elemen visual yang dapat dipakai ulang (*Reusable*).
  - `Navbar.jsx` & `Sidebar.jsx`: Komponen navigasi utama.
  - `Modal.jsx`: Kotak dialog/popup (*controlled component*).
  - `ProtectedRoute.jsx`: Komponen pembungkus (*wrapper*) untuk memblokir akses dari user yang belum login atau beda hak akses (Role-based).
- `/src/pages`: Halaman utama aplikasi (Dashboard, Inventaris, Peminjaman, Laporan, User).
- `/src/context`: *Global State Management*.
  - `AuthContext.jsx`: Menyimpan token dan data user aktif.
  - `ThemeContext.jsx`: Mengatur mode terang/gelap (Dark Mode).
- `/src/services/api.js`: *Instance Axios* yang disetel khusus untuk menempelkan `Bearer Token` secara otomatis pada setiap request.
- `/src/styles/index.css`: Pusat tata letak dan desain visual (Variabel CSS, Animasi, Glassmorphism).
- `/src/__tests__`: Kumpulan file skenario pengujian unit (*Unit Testing*).

---

## 3. Logika Bisnis (Business Logic)

### 3.1 Alur Otentikasi (Authentication Flow)
1. **Login**: User memasukkan Email dan Password. Backend (`authController`) memverifikasi *hash* bcrypt. Jika benar, server memberikan *Token JWT* (berlaku 30 hari).
2. **Penyimpanan Klien**: Frontend menyimpan token ini di `localStorage`.
3. **Intersepsi Request**: Setiap kali frontend memanggil API (misalnya `api.get('/items')`), Axios Interceptor otomatis mengambil token dari `localStorage` dan menempelkannya di *Header HTTP*.
4. **Validasi Rute**: Jika token kedaluwarsa atau dimanipulasi, `authMiddleware` backend akan menolak dengan kode `401 Unauthorized`.

### 3.2 Siklus Hidup Peminjaman (Borrowing Lifecycle)
Aplikasi membedakan barang berdasarkan Status: `Tersedia`, `Dipinjam`, `Rusak`.
1. **Pengajuan (Pending)**: Staf meminta barang. Entri *Borrowing* dibuat dengan status `Menunggu`.
2. **Persetujuan (Approval)**: Petugas mengeklik "Setujui". Status peminjaman berubah menjadi `Disetujui`, dan status `Item` di database otomatis berubah menjadi `Dipinjam` (*Sync Logic*).
3. **Pengembalian (Return)**: Saat barang dikembalikan fisik, status peminjaman jadi `Dikembalikan`, tanggal kembali aktual tercatat, dan status `Item` kembali menjadi `Tersedia`.

---

## 4. Pengujian Unit (Unit Testing) dengan React Vite

Kami menggunakan **Vitest** (Test Runner bawaan ekosistem Vite) dan **React Testing Library** (RTL). Pengujian difokuskan pada rendering komponen dan *mocking* konteks (*Context*).

### 4.1 Hasil Pengujian (Test Results)
Skenario pengujian yang dilakukan terhadap 4 komponen inti (`Sidebar`, `Navbar`, `Modal`, `ProtectedRoute`) mendapatkan hasil **LULUS 100%**.
Berikut adalah *output log* dari terminal saat tes dieksekusi:

```bash
> ujikom@0.0.0 test:run
> vitest run

 RUN  v4.1.5 D:/Coding/UJIKOM/client

 ✓ src/__tests__/components.test.jsx (9 tests) 136ms
   ✓ Sidebar Component (3)
     ✓ renders the app logo
     ✓ shows admin navigation items
     ✓ displays user name
   ✓ Navbar Component (2)
     ✓ renders the page title
     ✓ displays user greeting
   ✓ Modal Component (2)
     ✓ renders when open
     ✓ does not render when closed
   ✓ ProtectedRoute Component (2)
     ✓ renders children for authenticated users
     ✓ renders children when user has correct role

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  13:11:28
   Duration  3.48s
```

### 4.2 Cara Menjalankan Tes
Buka terminal dan arahkan ke folder `/client`.
Jalankan perintah: `npm run test` (Mode pemantauan langsung / Watch) atau `npm run test:run` (Mode eksekusi sekali / CI).

---

## 5. Konfigurasi Debugging (VS Code & React DevTools)

Untuk memastikan pengembang dapat melacak aliran data (Data Flow) tanpa bergantung penuh pada `console.log`, telah dibuatkan konfigurasi Debugger bawaan Visual Studio Code.

### 5.1 Debugging Visual Studio Code (Full-Stack)
Terdapat file `.vscode/launch.json` dengan dua profil *debug*:
1. **Debug Express Server**: Memungkinkan Anda menaruh *Breakpoint* (titik merah di baris angka VS Code) di `controller` Node.js. Server akan berhenti sejenak saat API dipanggil agar Anda bisa mengecek variabel.
2. **Debug Vite React (Chrome)**: Meluncurkan Google Chrome dalam mode *Inspect* khusus yang tersambung kembali ke kode sumber (Source Maps) React Anda di VS Code.

**Cara Pakai**:
- Pergi ke Tab **Run and Debug** di sebelah kiri layar VS Code (Ikon Play + Kutu).
- Di *dropdown* bagian atas, pilih **"Debug Full Stack InvenTrack"** lalu klik Play hijau. VS Code akan langsung memantau backend dan frontend sekaligus!

### 5.2 React Developer Tools
Untuk *debugging visual UI*, silakan install ekstensi browser "React Developer Tools".
Ini akan menambahkan tab **Components** di Chrome/Edge DevTools Anda (`F12`). Anda bisa melihat *State* yang sedang aktif di `InventoryPage` secara *real-time*.

---

## 6. Profiling & Analisis Performa

Untuk menganalisis performa *memory leak* atau beban CPU, kita menggunakan spesifikasi yang khusus untuk ekosistem Javascript.

### 6.1 Backend Profiling (Node.js `--prof`)
Node.js memiliki *Profiler* bawaan (menggantikan kebutuhan *Py-Spy* / *VisualVM* pada ekosistem lain).
- **Cara Penggunaan**:
  Jalankan server dengan flag `--prof`:
  ```bash
  node --prof server.js
  ```
- **Hasil**: Server akan memuntahkan file `isolate-0xNNNNNNN-v8.log`.
- **Analisis**: Konversi file log tersebut menjadi dokumen yang bisa dibaca manusia dengan perintah:
  ```bash
  node --prof-process isolate-0xNNNNNNN-v8.log > laporan_performa.txt
  ```
  Di dalam laporan ini, Anda bisa melihat fungsi Controller mana yang menghabiskan CPU (*Tick counts*) paling berat.

### 6.2 Frontend Profiling (React Profiler)
Digunakan untuk mengecek *Render Bottlenecks*.
- **Cara Penggunaan**:
  1. Buka aplikasi di Chrome. Tekan `F12`.
  2. Buka tab **Profiler** (dari ekstensi React DevTools).
  3. Tekan tombol lingkaran biru (**Record**).
  4. Lakukan interaksi (misalnya berpindah tab, membuka Modal, memfilter data).
  5. Tekan tombol merah (**Stop**).
- **Analisis**: React akan menampilkan grafik *Flamegraph* yang menyorot merah komponen-komponen (seperti `<Modal>` atau `<tr>`) yang me-render terlalu lama (di atas 16ms) sehingga Anda tahu komponen mana yang harus dioptimasi dengan `React.memo` atau `useCallback`.

### 6.3 Hasil Profiling Aktual (InvenTrack)
Berdasarkan pengujian *Flamegraph* (React Profiler) yang dilakukan pada fase *initial mount* (`createRoot()`):
- **Total Render Time**: 21ms.
- **Passive Effects**: 7.9ms.
- Komponen terberat pada pemuatan awal adalah `<App />` (17.2ms) dan `<BrowserRouter>` (14.7ms) karena melakukan inisialisasi routing dan pengecekan *AuthContext* (`<AuthProvider>`).
- **Kesimpulan**: Aplikasi berjalan **sangat optimal**. Tidak ada komponen individual yang me-render di atas batas ideal (semua *context provider* merender di bawah 1-2ms). Grafik didominasi warna hijau/kuning (*Fast render*), tidak ada blok merah (*Slow render/Bottleneck*). Render awal 21ms sangat responsif untuk pengguna.
