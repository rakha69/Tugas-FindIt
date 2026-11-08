# Findit — Platform Barang Hilang & Temuan Kampus

Pernah nggak ketinggalan KTM di perpustakaan, atau nemu AirPods di kantin tapi bingung mau lapor ke mana? Nah, **Findit** hadir buat ngesolve masalah itu.

Findit adalah platform digital berbasis web yang dibuat khusus untuk lingkungan kampus, biar mahasiswa bisa **melaporkan barang yang hilang** atau **mengumumkan barang temuan** dengan mudah — dan yang kehilangan bisa langsung menemukan info itu tanpa harus nyebarin pesan ke grup kelas satu per satu.

Proyek ini dibuat murni pakai **HTML, CSS, dan JavaScript** — tanpa framework, tanpa backend, tanpa instalasi apapun. Langsung buka, langsung jalan.

---

## Fitur-Fitur

### 🔐 Daftar & Masuk Akun

Sebelum bisa bikin laporan, pengguna perlu daftar dulu. Proses registrasinya nggak ribet — cukup isi nama, NIM, fakultas, email, nomor WhatsApp, dan buat PIN/kata sandi.

Beberapa hal yang diperhatikan di sini:
- **Tombol mata (👁️)** di field kata sandi — biar bisa ngecek pengetikan PIN udah bener atau belum sebelum submit
- **Validasi duplikasi** — NIM dan email yang sama nggak bisa didaftarkan dua kali
- **Avatar otomatis** dari inisial nama, jadi nggak perlu upload foto profil

Untuk login, bisa pakai **email** atau langsung pakai **NIM** — mana yang lebih hafal. Ada juga tombol mata di field password-nya.

Sesi login tersimpan di browser, jadi nggak perlu login ulang setiap kali buka halaman. Kalau mau ganti info kontak, bisa langsung edit dari menu profil di navbar.

---

### 📝 Buat Laporan Barang

Ini inti dari Findit. Tombol "Laporkan Barang" di halaman utama membuka form laporan yang bisa dipilih dua tipenya:

- **Saya Kehilangan Barang** — kamu yang kehilangan dan lagi nyari
- **Saya Menemukan Barang** — kamu nemu barang orang lain dan mau bantu kembaliin

Yang bisa diisi di form:
- Nama/judul barang
- Kategori (Elektronik, Dokumen & Kartu, Kunci, Tas, Barang Pribadi, Pakaian, dll.)
- Lokasi spesifik di kampus (Perpustakaan, Kantin, Parkiran, dll.)
- Tanggal dan perkiraan jam kejadian
- Deskripsi singkat kronologi atau kondisi barang
- **Ciri-ciri khusus** — ini penting banget, berguna buat verifikasi kepemilikan nantinya
- Tawaran imbalan (kalau kehilangan dan mau kasih reward)
- **Upload foto barang** — langsung bisa preview sebelum submit

Semua laporan tersimpan permanen di browser dan langsung muncul di halaman utama.

---

### 🔎 Cari & Filter Laporan

Di halaman utama tersedia berbagai cara buat nyari laporan:

- **Search bar** — ketik nama barang, ciri khusus, atau lokasi, hasilnya langsung muncul real-time
- **Tab filter:** Semua / Kehilangan / Ditemukan / Selesai
- **Chip kategori** — klik sekali buat filter per kategori (Elektronik, Dokumen, Kunci, dsb.)
- **Dropdown lokasi** — filter berdasarkan lokasi spesifik di kampus
- **Urutan tampilan** — bisa diurutkan dari yang terbaru, terlama, atau paling banyak dilihat
- Tombol **Reset Filter** otomatis muncul kalau ada filter yang aktif

---

### 🛡️ Klaim Kepemilikan Barang

Kalau nemu laporan yang kelihatannya milikmu, ada tombol "Ajukan Klaim". Di sini kamu diminta isi bukti rahasia — misalnya isi dompet, wallpaper HP, atau ciri khusus yang cuma pemilik asli yang tau.

Ini sengaja dibuat supaya nggak sembarang orang bisa ngaku-ngaku. Setelah isi bukti, ada tombol langsung ke **WhatsApp** pelapor dengan pesan otomatis yang sudah terformat rapi.

---

### 📋 Kelola Laporan Sendiri

Ada halaman khusus "Laporan Saya" buat ngecek dan ngurusin laporan yang pernah kamu buat:

- **Lihat klaim masuk** — siapa aja yang sudah ngajukan klaim, berikut bukti rahasianya
- **Setujui klaim** — kalau buktinya cocok, klik approve dan status barang otomatis jadi "Selesai"
- **Tandai selesai manual** — kalau barang udah balik tapi lewat jalur lain
- **Hapus laporan** — kalau laporan udah nggak relevan

---

### 🖨️ Cetak & Bagikan Laporan

Di halaman detail setiap laporan, ada dua fitur tambahan:

- **Cetak** — laporan bisa dicetak dalam format surat resmi lengkap dengan kolom tanda tangan petugas keamanan kampus (berguna kalau perlu laporan fisik ke satpam atau kemahasiswaan)
- **Bagikan** — menyalin ringkasan info barang yang siap dikirim ke grup WhatsApp kelas atau angkatan

---

## Struktur Folder

```
findit/
├── index.html              # Halaman utama (navbar, katalog, semua modal)
├── css/
│   └── style.css           # Semua styling, layout, animasi, dan responsivitas
├── js/
│   ├── data.js             # Data awal & inisialisasi localStorage
│   ├── auth.js             # Login, register, logout, session pengguna
│   └── app.js              # Logic utama: filter, render, klaim, toast, dll.
├── assets/
│   └── images/             # Foto barang untuk laporan demo
└── README.md
```

---

## Cara Pakai

Nggak perlu install apa-apa. Cukup:

1. **Double click** file `index.html` — langsung buka di browser
2. Atau klik kanan → **Open With** → pilih Chrome / Edge / Firefox

Kalau pakai VS Code, bisa pakai ekstensi **Live Server** — klik kanan `index.html` → *Open with Live Server*.

---

## Akun Demo

Buat langsung coba semua fitur tanpa daftar dulu, tersedia 3 akun demo:

| Nama | Email / NIM | Password | Fakultas |
|---|---|---|---|
| Ahmad Rizky Pratama | `ahmad.rizky@mahasiswa.ac.id` / `2108561001` | `password123` | Fasilkom |
| Nabila Putri Cantika | `nabila.putri@mahasiswa.ac.id` / `2209102034` | `password123` | FEB |
| Fajar Satria Yudha | `fajar.satria@mahasiswa.ac.id` / `2005013099` | `password123` | Teknik |

Di halaman login juga ada tombol chip nama akun demo — klik langsung otomatis terisi, tinggal login.

---

## Catatan Teknis

- Semua data (akun & laporan) disimpan di **localStorage** browser — persisten selama cache belum dihapus
- Foto barang yang diupload disimpan dalam format **Base64** langsung di localStorage
- Tidak ada server, tidak ada database eksternal, tidak ada koneksi internet yang dibutuhkan untuk menjalankan aplikasi ini
- Dibuat untuk memenuhi tugas mata kuliah — murni HTML, CSS, dan Vanilla JavaScript

---

*Dibuat oleh Muhammad Thoriq Bintang Pamungkas*
