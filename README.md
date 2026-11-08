# 🔍 Findit - Campus Lost & Found Platform

**Findit** adalah aplikasi web pusat pelaporan dan pencarian barang hilang maupun barang temuan di lingkungan kampus universitas. Proyek ini dikembangkan secara murni menggunakan **HTML5, CSS3, dan Vanilla JavaScript** tanpa ketergantungan framework berat, sehingga sangat ringan, cepat, dan mudah diuji langsung oleh dosen maupun mahasiswa.

---

## ✨ Fitur-Fitur Utama

### 1. 🔐 Sistem Autentikasi Lengkap & Saling Terkoneksi
- **Pendaftaran Akun Baru (Register):**
  - Input Nama Lengkap Mahasiswa, NIM, Fakultas/Prodi, Email Kampus/Pribadi, No. WhatsApp aktif, dan Kata Sandi / PIN.
  - **Fitur Mata (Show/Hide Password):** Tombol interaktif untuk melihat dan menyembunyikan input kata sandi/PIN agar mahasiswa dapat memastikan kebenaran pengetikan sebelum mendaftar.
  - Validasi pencegahan duplikasi NIM dan Email.
  - Pembuatan avatar inisial otomatis.
- **Masuk Akun (Login):**
  - Fleksibel: dapat login menggunakan **Email Kampus** maupun **NIM**.
  - Dilengkapi juga dengan tombol mata (*Show/Hide Password*) dan fitur **1-Click Demo Accounts** (Ahmad - Fasilkom, Nabila - FEB, Fajar - Teknik) untuk mempermudah evaluasi dosen.
- **Sesi Pengguna & Profil:**
  - Status login tersinkronisasi via `localStorage`.
  - Dropdown menu di navbar menampilkan nama panggilan, avatar, NIM, dan Fakultas.
  - Modal **Profil Mahasiswa** untuk melihat dan memperbarui informasi kontak.

### 2. 📝 Pembuatan Laporan Barang (Lost & Found Report)
- Pilihan tipe laporan: **"Saya Kehilangan Barang" (Lost)** vs **"Saya Menemukan Barang" (Found)**.
- Input detail lengkap:
  - Judul / Nama Barang
  - Kategori (Elektronik, Dokumen & Kartu, Kunci & Aksesoris, Tas & Dompet, Barang Pribadi, Pakaian, Lainnya)
  - Lokasi Spesifik Kampus (Perpustakaan, Kantin, Gedung Kuliah, dsb.)
  - Tanggal & Perkiraan Jam Kejadian
  - Deskripsi & Kronologi Singkat
  - **Ciri-Ciri Khusus / Keterangan Unik** (kunci verifikasi kepemilikan)
  - Penawaran Imbalan / Ucapan Terima Kasih (khusus barang hilang)
  - **Upload Foto Barang** dengan live preview dan konversi Base64 otomatis agar tersimpan persisten.
  - Kontak WhatsApp pelapor (otomatis terisi dari profil pengguna yang login).

### 3. 🔎 Eksplorasi & Filter Multi-Kriteria
- **Live Search Bar:** Pencarian instan berdasarkan nama barang, ciri khusus, deskripsi, atau lokasi.
- **Tab Filter Tipe:**
  - *Semua Laporan*
  - *🔴 Kehilangan*
  - *🟢 Ditemukan*
  - *✅ Selesai / Dikembalikan*
- **Filter Kategori (Quick Chips):** Tombol chip horizontal untuk memilih kategori barang dalam 1 klik.
- **Filter Lokasi Kampus:** Dropdown lokasi spesifik di lingkungan universitas.
- **Pengurutan (Sorting):** Waktu Paling Baru, Paling Lama, atau Laporan Paling Banyak Dilihat.
- Tombol **Reset Filter** otomatis muncul saat ada filter yang aktif.

### 4. 🛡️ Verifikasi Klaim Kepemilikan (Anti-Fraud System)
- Fitur realistis untuk lingkungan kampus: mencegah orang sembarangan mengaku sebagai pemilik barang berharga.
- Pengaju klaim wajib mengisi formulir bukti rahasia (contoh: wallpaper lockscreen HP, nomor seri tersembunyi, isi kartu di dalam dompet).
- Tombol langsung terhubung ke **WhatsApp Web/App** pelapor dengan pesan otomatis terformat rapi.

### 5. 📊 Dashboard "Laporan Saya" (Manajemen Laporan Pengguna)
- Halaman khusus pengguna login untuk mengelola laporan yang pernah dibuat:
  - **Tandai Selesai / Kembali:** Mengubah status barang menjadi *Resolved* jika barang sudah diserahkan.
  - **Hapus Laporan:** Menghapus laporan dari sistem jika tidak lagi diperlukan.
  - **Lihat Detail:** Meninjau kembali data laporan.

### 6. 🎨 Desain UI/UX Manusiawi (Human-Crafted, Non-AI Cliché, Tidak Monoton)
- **Bukan visual klise AI:** Tidak ada gradasi gelap neon ungu/cyan futuristik yang melelahkan mata atau efek kaca blur yang tidak terbaca.
- **Identitas Warna Tematik & Aksesibel:**
  - *Electric Royal Indigo* (`#4338ca`) sebagai aksen utama akademis yang percaya diri dan modern.
  - *Vivid Crimson Rose* (`#e11d48`) untuk status **Kehilangan** berdaya kontras tinggi.
  - *Fresh Emerald Green* (`#059669`) untuk status **Ditemukan** yang menenangkan dan meyakinkan.
  - *Warm Golden Amber* (`#d97706`) untuk penanda imbalan dan verifikasi bukti.
- **Kategori Berwarna (Menghilangkan Monotoni):**
  - Tiap kategori barang (Elektronik, Dokumen, Kunci, Tas, Barang Pribadi, Pakaian) memiliki aksen warna dan ikon tersendiri pada kartu katalog maupun chip filter.
- **Kartu Panduan Edukatif Beraksen Warna:** Masing-masing dari 4 kartu panduan keselamatan kampus memiliki aksen visual khusus (Indigo, Violet, Emerald, dan Amber).
- **Fitur Ekstra Siap Uji:**
  - **Inspeksi Klaim Masuk:** Pemilik laporan dapat memeriksa daftar kandidat pengklaim barang, membaca bukti rahasianya, dan menyetujui penyerahan barang dalam 1 klik.
  - **Cetak Bukti Laporan Resmi (Print Sheet):** Mengonversi laporan barang hilang menjadi surat resmi bertanda tangan petugas keamanan kampus dengan format cetak rapi.
  - **Bagikan Info Laporan:** Menyalin ringkasan informasi barang siap kirim ke grup WhatsApp kelas atau fakultas.
- **Animasi Halus & Responsivitas:** Notifikasi Toast yang interaktif, live pulsing dot status kampus, dan transisi hover tactile.

---

## 📁 Struktur Direktori

```text
findit/
│
├── index.html          # Struktur utama antarmuka (Navbar, Hero, Katalog, Modals, Footer)
├── css/
│   └── style.css       # Desain visual, CSS Grid/Flexbox, animasi, dan responsivitas
├── js/
│   ├── data.js         # Data dummy awal realistis kampus & inisialisasi LocalStorage
│   ├── auth.js         # Logika autentikasi: register, login (Email/NIM), logout, session
│   └── app.js          # Controller aplikasi: filter, render card, upload gambar, klaim, toast
└── README.md           # Dokumentasi teknis proyek
```

---

## 🚀 Cara Menjalankan Proyek

Tidak diperlukan instalasi Node.js atau web server khusus! Anda dapat langsung menjalankannya dengan cara berikut:

1. **Buka Langsung di Browser:**
   - Cukup klik dua kali (double click) file `index.html` di komputer Anda, atau
   - Klik kanan file `index.html` -> pilih **Open With** -> **Google Chrome / Microsoft Edge / Firefox**.

2. **Menggunakan VS Code Live Server (Opsional):**
   - Buka folder `findit` di Visual Studio Code.
   - Klik kanan file `index.html` -> pilih **Open with Live Server**.
   - Halaman akan otomatis terbuka di `http://127.0.0.1:5500`.

---

## 🔑 Akun Demo Pengujian Cepat

Untuk memudahkan dosen atau penguji mencoba semua fitur tanpa harus mendaftar terlebih dahulu:

| Nama Mahasiswa | Email / NIM | Kata Sandi | Fakultas |
|---|---|---|---|
| Ahmad Rizky Pratama | `ahmad.rizky@mahasiswa.ac.id` / `2108561001` | `password123` | Fasilkom |
| Nabila Putri Cantika | `nabila.putri@mahasiswa.ac.id` / `2209102034` | `password123` | FEB |
| Fajar Satria Yudha | `fajar.satria@mahasiswa.ac.id` / `2005013099` | `password123` | Teknik |

*(Atau klik langsung chip akun demo di dalam modal login untuk pengisian otomatis).*

---

## 🎓 Catatan untuk Tugas Kuliah
Proyek ini memenuhi standar penilaian:
- **Clean Code & Modularitas:** Pemisahan file yang rapi antara data mock, autentikasi, dan manipulasi DOM.
- **Penyimpanan Persisten:** Menggunakan Web Storage API (`localStorage`) sehingga data laporan baru, status barang, dan akun baru tidak hilang saat halaman di-refresh.
- **Aksesibilitas & Keamanan:** Menyediakan panduan serah terima aman di kampus dan verifikasi bukti kepemilikan.

