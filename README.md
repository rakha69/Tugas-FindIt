# Findit — Platform Radar Kehilangan & Temuan Barang Kampus

Pernah ketinggalan KTM di perpustakaan, atau nemu AirPods di kantin tapi bingung mau lapor ke mana? **Findit** hadir buat menyelesaikan masalah itu di lingkungan kampus.

Findit adalah aplikasi web interaktif yang dirancang khusus untuk sivitas akademika agar mahasiswa bisa **melaporkan barang hilang**, **mengumumkan barang temuan**, memantau titik gedung kampus melalui **Radar Zona Kampus**, dan melakukan **verifikasi klaim kepemilikan** secara aman.

Proyek ini dibangun menggunakan **React 18**, **Vite**, dan **Framer Motion** untuk menghasilkan antarmuka yang responsif, organik, dan mulus pada setiap transisi halaman maupun panel detail.

---

## Fitur Utama

### 🧭 Radar Zona Kampus & Bento Command Center
- **Filter Gedung Interaktif:** Klik langsung zona gedung kampus (Perpustakaan, Kantin Utama, Parkiran Teknik, GKB, Labkom, Musholla/Rektorat) pada panel radar untuk memfilter laporan di titik tersebut secara real-time.
- **Prioritas Pencarian (Spotlight Pass):** Menampilkan laporan kehilangan terbaru yang membutuhkan perhatian segera di bagian atas katalog.
- **Pencarian & Kategori Cepat:** Filter berdasarkan kata kunci, lokasi, status laporan (*Semua*, *Kehilangan*, *Ditemukan*, *Selesai*), dan chip kategori barang.

### 🛡️ Proteksi Ciri-Ciri Unik & Verifikasi Klaim
- **Privasi Ciri Barang Temuan:** Untuk laporan barang yang *Ditemukan*, kolom ciri-ciri unik **disembunyikan otomatis dari publik** supaya tidak bisa disalahgunakan oleh pihak yang mengaku-ngaku.
- **Alur Klaim Terstruktur:** Pemilik sah wajib mengisi formulir **Ajukan Klaim** dengan mencantumkan NIM serta menyebutkan ciri spesifik barang sebelum berlanjut ke konfirmasi WhatsApp.

### 🔐 Autentikasi Mahasiswa & Dashboard Laporan Saya
- **Login & Registrasi Cepat:** Masuk menggunakan Email Kampus atau NIM, dilengkapi fitur lihat/sembunyikan kata sandi dan 3 tombol **Akun Demo** sekali klik untuk pengujian cepat.
- **Ruang Kelola Pelapor:** Pantau laporan yang pernah dibuat, tinjau daftar pengajuan klaim yang masuk beserta bukti rahasianya, setujui klaim, atau tandai kasus selesai.

---

## Teknologi yang Digunakan

- **React 18** (Functional Components & Hooks)
- **Vite 5** (Frontend Build Tooling & HMR)
- **Framer Motion** (Spring Physics Transitions, Slide-Over Sheet, & Shared `layoutId` Animations)
- **LocalStorage Persistence** (Penyimpanan state lokal di browser untuk akun, sesi, laporan, dan klaim)

---

## Struktur Proyek

```text
findit/
├── src/
│   ├── main.jsx                # Entry point aplikasi React
│   ├── App.jsx                 # Komponen utama, Radar Bento, Slide-Over Sheet, & Modal
│   ├── data/
│   │   └── initialData.js      # Data awal, konfigurasi zona kampus, & migrasi localStorage
│   ├── services/
│   │   └── authService.js      # Manajemen autentikasi & sesi pengguna
│   └── styles/
│       └── app.css             # Desain sistem, Bento grid, & responsivitas mobile
├── assets/
│   └── images/                 # Aset foto laporan (KTM, Kunci Motor, Tumbler)
├── dist/                       # Hasil build produksi siap jalan untuk GitHub Pages
├── index.html                  # Shell HTML utama
├── vite.config.js              # Konfigurasi bundler Vite
└── package.json
```

---

## Cara Menjalankan di Lokal

1. Pastikan **Node.js** sudah terpasang, lalu jalankan instalasi dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan (Development Mode):
   ```bash
   npm run dev
   ```
3. Untuk memproduksi bundle statis (`dist/`):
   ```bash
   npm run build
   ```

---

## Akun Demo Pengujian

| Nama | Email / NIM | Password | Fakultas |
|---|---|---|---|
| Ahmad Rizky Pratama | `ahmad.rizky@mahasiswa.ac.id` / `2108561001` | `password123` | Fasilkom |
| Nabila Putri Cantika | `nabila.putri@mahasiswa.ac.id` / `2209102034` | `password123` | FEB |
| Fajar Satria Yudha | `fajar.satria@mahasiswa.ac.id` / `2005013099` | `password123` | Teknik |

---

*Dibuat oleh Hafidz Muhammad Rakha Shidqi*
