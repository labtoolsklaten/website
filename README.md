# 🛍️ Katalog & Bio-Link Premium

Aplikasi **Katalog Digital & Bio-Link** modern yang dirancang untuk UMKM, Kreator, dan Penjual Produk Digital. Bangun identitas online Anda dan mulai berjualan dalam hitungan menit dengan antarmuka yang elegan, responsif, dan mudah dikelola.

![Premium UI](https://img.shields.io/badge/UI-Premium-blueviolet?style=for-the-badge)
![Fast Delivery](https://img.shields.io/badge/Delivery-WhatsApp-green?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Built%20With-React%20%2B%20PHP-blue?style=for-the-badge)

---

## ✨ Fitur Unggulan

### 📱 Antarmuka Pengunjung (Frontend)
- **Glassmorphism Design**: Tampilan transparan yang modern dan mewah.
- **Dual Store View**: Pengunjung dapat memilih tampilan **Grid** (visual besar) atau **List** (ringkas).
- **Bio-Link Integrated**: Gabungkan semua link media sosial Anda dalam satu halaman.
- **Checkout Cepat**: Alur pemesanan yang simpel dengan pengumpulan data Nama, WhatsApp, dan Email.
- **Metode Pembayaran**: Mendukung Transfer Bank Manual dan **Scan QRIS** otomatis.

### 🛡️ Dashboard Admin (CMS)
- **Manajemen Profil**: Ubah nama, bio, dan foto profil dengan fitur upload langsung.
- **Manajemen Katalog**: Tambah, edit, dan hapus produk dengan mudah.
- **Upload Gambar**: Fitur upload foto produk dan kode QRIS langsung ke server (tanpa perlu link luar).
- **Manajemen Pesanan**: Pantau riwayat pesanan, verifikasi status lunas, dan kirim link produk otomatis ke WhatsApp pelanggan.
- **Tombol "Hubungi Saja"**: Memungkinkan admin tetap terhubung dengan pembeli via WhatsApp tanpa mengirim link produk.

---

## 🚀 Teknologi yang Digunakan

| Komponen | Teknologi |
| --- | --- |
| **Frontend** | React.js v18, Vite, Framer Motion (Animasi), Lucide Icons |
| **Styling** | Vanilla CSS (Custom Design System) |
| **Backend** | PHP (Native API) |
| **Database** | JSON Flat-File (Ringan & Cepat, Tanpa SQL) |
| **Integrasi** | WhatsApp API Redirect |

---

## 🛠️ Instalasi Lokal

1. **Persiapan**: Pastikan Anda memiliki Web Server (Laragon/XAMPP) dan Node.js terinstal.
2. **Clone Project**: Taruh folder project di dalam `www/` atau `htdocs/`.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Jalankan Development Mode**:
   ```bash
   npm run dev
   ```
5. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 🌐 Cara Hosting (Deployment)

Untuk meng-online-kan aplikasi ini, Anda hanya perlu mengunggah isi folder **`dist`** ke hosting Anda.

### Penting untuk Hosting di Domain Utama:
1.  Buka `src/App.jsx`, ubah `basename="/katalog/dist/"` menjadi `basename="/"`.
2.  Buka `dist/.htaccess`, ubah `RewriteBase /katalog/dist/` menjadi `RewriteBase /` dan sesuaikan path `index.html`.
3.  Pastikan folder `api/uploads/` memiliki izin akses (**Permission 755/777**) agar fitur upload gambar berjalan.

---

## 🔐 Keamanan Admin
Default Login:
- **Username**: `admin`
- **Password**: `admin123`
*(Ubah password Anda di dalam file `public/api/manage.php` sebelum dipublikasikan)*

---

## 📄 Lisensi
Dibuat dengan ❤️ untuk kemajuan UMKM Digital Indonesia.

---
*Developed by Antigravity AI*