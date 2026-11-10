/**
 * Data Awal & Konfigurasi Zona Kampus Findit
 */

export const INITIAL_USERS = [
  {
    id: "usr-01",
    name: "Ahmad Rizky Pratama",
    email: "ahmad.rizky@mahasiswa.ac.id",
    nim: "2108561001",
    faculty: "Fakultas Ilmu Komputer",
    phone: "081234567890",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-10-15T08:00:00.000Z"
  },
  {
    id: "usr-02",
    name: "Nabila Putri Cantika",
    email: "nabila.putri@mahasiswa.ac.id",
    nim: "2209102034",
    faculty: "Fakultas Ekonomi & Bisnis",
    phone: "089876543210",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-10-20T10:30:00.000Z"
  },
  {
    id: "usr-03",
    name: "Fajar Satria Yudha",
    email: "fajar.satria@mahasiswa.ac.id",
    nim: "2005013099",
    faculty: "Fakultas Teknik",
    phone: "085712345678",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-11-01T14:15:00.000Z"
  }
];

export const INITIAL_ITEMS = [
  {
    id: "item-101",
    type: "lost",
    title: "KTM atas nama Muhammad Thoriq Bintang Pamungkas",
    category: "Dokumen & Kartu",
    location: "Perpustakaan Pusat Lantai 2",
    date: "2026-11-07",
    time: "13:30",
    description: "Tertinggal di meja kubikal dekat jendela area barat. Dompet kartu warna hitam transparan, berisi KTM atas nama Muhammad Thoriq Bintang Pamungkas dan kartu perpustakaan.",
    specificFeatures: "Goresan tipis di sudut kanan bawah KTM.",
    reward: "Ada ucapan terima kasih + traktiran kopi",
    image: "assets/images/KTM.JPG",
    status: "active",
    reporterId: "usr-01",
    reporterName: "Muhammad Thoriq Bintang Pamungkas",
    reporterFaculty: "Fasilkom",
    reporterPhone: "081310214043",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    views: 48,
    claims: []
  },
  {
    id: "item-102",
    type: "found",
    title: "AirPods Pro Gen 2 Case Putih",
    category: "Elektronik",
    location: "Kantin Utama Depan Stand Jus Buah",
    date: "2026-11-08",
    time: "09:45",
    description: "Ditemukan case AirPods Pro beserta kedua earphone-nya tergeletak di kursi bangku panjang kantin saat jam sarapan. Saat ini diamankan di meja kasir kantin.",
    specificFeatures: "Case ada silikon bening dengan gantungan gembok merah kecil. Di bagian dalam ada inisial ukiran laser.",
    reward: "",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
    status: "active",
    reporterId: "usr-02",
    reporterName: "Nabila Putri Cantika",
    reporterFaculty: "FEB",
    reporterPhone: "089876543210",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    views: 112,
    claims: []
  },
  {
    id: "item-103",
    type: "lost",
    title: "Kunci Motor Honda Vario 160 + Remote Smart Key",
    category: "Kunci & Aksesoris",
    location: "Area Parkir Motor Gedung B (Teknik)",
    date: "2026-11-06",
    time: "16:15",
    description: "Kemungkinan terjatuh saat mengeluarkan jas hujan dari jok motor atau di koridor antara parkiran dan lobi Gedung B.",
    specificFeatures: "Gantungan kunci akrilik karakter Spy x Family (Anya Forger) dan ada kunci gembok kecil berwarna kuning kuningan.",
    reward: "Imbalan Rp 100.000 untuk yang menemukan",
    image: "assets/images/kunci motor.jpg",
    status: "active",
    reporterId: "usr-03",
    reporterName: "Fajar Satria Yudha",
    reporterFaculty: "Fakultas Teknik",
    reporterPhone: "085712345678",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    views: 89,
    claims: []
  },
  {
    id: "item-104",
    type: "found",
    title: "Tumbler Corkcicle Canteen 16oz Warna Sage Green",
    category: "Barang Pribadi",
    location: "Ruang Kelas 304 Gedung Kuliah Bersama",
    date: "2026-11-07",
    time: "15:20",
    description: "Tertinggal di bawah meja baris ketiga setelah mata kuliah Kalkulus selesai. Kondisi masih sangat mulus dan berisi air dingin.",
    specificFeatures: "Ada goresan kecil di bagian tutup botol dan stiker kecil bertuliskan 'Stay Hydrated' di bagian bawah.",
    reward: "",
    image: "assets/images/tumbler.jpg",
    status: "active",
    reporterId: "usr-01",
    reporterName: "Ahmad Rizky Pratama",
    reporterFaculty: "Fasilkom",
    reporterPhone: "081234567890",
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    views: 64,
    claims: []
  },
  {
    id: "item-105",
    type: "found",
    title: "Kalkulator Ilmiah Casio fx-991EX ClassWiz",
    category: "Elektronik",
    location: "Laboratorium Komputer Dasar 1",
    date: "2026-11-05",
    time: "11:00",
    description: "Ditemukan di samping monitor PC nomor 14 sesudah praktikum Statistika. Sekarang dititipkan di ruang Asisten Lab.",
    specificFeatures: "Tutup geser kalkulator ada coretan spidol perak berupa angka rombongan praktikum.",
    reward: "",
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80",
    status: "resolved",
    reporterId: "usr-03",
    reporterName: "Fajar Satria Yudha",
    reporterFaculty: "Fakultas Teknik",
    reporterPhone: "085712345678",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    views: 135,
    claims: [
      {
        claimantName: "Dimas Anggara",
        claimantNim: "2108561044",
        claimantPhone: "081399887766",
        proof: "Nomor registrasi lab di cover kalkulator cocok dengan absensi saya.",
        status: "approved",
        claimedAt: "2026-11-06T14:00:00.000Z"
      }
    ]
  },
  {
    id: "item-106",
    type: "lost",
    title: "Dompet Lipat Kulit Cokelat Merk Eiger",
    category: "Tas & Dompet",
    location: "Musholla Lantai 1 Gedung Rektorat",
    date: "2026-11-08",
    time: "12:45",
    description: "Lupa diambil dari tempat wudhu / rak sajadah saat sholat Dzuhur berjamaah. Berisi KTP, SIM C, STNK motor Vario, dan beberapa uang tunai.",
    specificFeatures: "Warna cokelat tua sudah agak memudar di pinggirannya, ada logo segitiga Eiger kecil warna perak di pojok depan.",
    reward: "Uang tunai Rp 150.000 (dokumen sangat penting untuk ujian akhir)",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    status: "active",
    reporterId: "usr-02",
    reporterName: "Nabila Putri Cantika",
    reporterFaculty: "FEB",
    reporterPhone: "089876543210",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    views: 73,
    claims: []
  }
];

export const CAMPUS_ZONES = [
  { id: "Perpustakaan", label: "Perpustakaan Pusat", short: "Perpus", icon: "ri-book-open-line", code: "Z-01" },
  { id: "Kantin", label: "Kantin Utama", short: "Kantin", icon: "ri-cup-line", code: "Z-02" },
  { id: "Parkir", label: "Parkiran & Teknik", short: "Parkir B", icon: "ri-motorbike-line", code: "Z-03" },
  { id: "Gedung Kuliah Bersama", label: "Gedung Kuliah Bersama", short: "GKB", icon: "ri-building-4-line", code: "Z-04" },
  { id: "Laboratorium", label: "Laboratorium", short: "Labkom", icon: "ri-macbook-line", code: "Z-05" },
  { id: "Musholla", label: "Musholla & Rektorat", short: "Rektorat", icon: "ri-compass-3-line", code: "Z-06" }
];

export const CATEGORIES = [
  { id: "", label: "Semua Kategori", icon: "ri-apps-2-line" },
  { id: "Dokumen & Kartu", label: "Dokumen & Kartu", icon: "ri-id-card-line" },
  { id: "Elektronik", label: "Elektronik", icon: "ri-macbook-line" },
  { id: "Kunci & Aksesoris", label: "Kunci & Aksesoris", icon: "ri-key-2-line" },
  { id: "Tas & Dompet", label: "Tas & Dompet", icon: "ri-wallet-3-line" },
  { id: "Barang Pribadi", label: "Barang Pribadi", icon: "ri-cup-line" },
  { id: "Pakaian", label: "Pakaian", icon: "ri-t-shirt-line" },
  { id: "Lainnya", label: "Lainnya", icon: "ri-more-fill" }
];

export function initDatabase() {
  if (!localStorage.getItem("findit_users")) {
    localStorage.setItem("findit_users", JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem("findit_items")) {
    localStorage.setItem("findit_items", JSON.stringify(INITIAL_ITEMS));
  }
  migrateLocalImages();
}

export function migrateLocalImages() {
  const PATCH_MAP = {
    "item-101": {
      image: "assets/images/KTM.JPG",
      title: "KTM atas nama Muhammad Thoriq Bintang Pamungkas",
      reporterName: "Muhammad Thoriq Bintang Pamungkas",
      reporterPhone: "081310214043",
      description: "Tertinggal di meja kubikal dekat jendela area barat. Dompet kartu warna hitam transparan, berisi KTM atas nama Muhammad Thoriq Bintang Pamungkas dan kartu perpustakaan.",
      specificFeatures: "Goresan tipis di sudut kanan bawah KTM."
    },
    "item-103": { image: "assets/images/kunci motor.jpg" },
    "item-104": { image: "assets/images/tumbler.jpg", reporterPhone: "081234567890" }
  };

  const raw = localStorage.getItem("findit_items");
  if (!raw) return;

  let items;
  try {
    items = JSON.parse(raw);
  } catch (e) {
    return;
  }

  let changed = false;
  items = items.map((item) => {
    const patch = PATCH_MAP[item.id];
    if (!patch) return item;

    let updated = { ...item };
    let itemChanged = false;
    for (const [key, val] of Object.entries(patch)) {
      if (updated[key] !== val) {
        updated[key] = val;
        itemChanged = true;
      }
    }
    if (itemChanged) changed = true;
    return updated;
  });

  if (changed) {
    localStorage.setItem("findit_items", JSON.stringify(items));
  }
}

export function getStoredItems() {
  const raw = localStorage.getItem("findit_items");
  return raw ? JSON.parse(raw) : INITIAL_ITEMS;
}

export function saveStoredItems(items) {
  localStorage.setItem("findit_items", JSON.stringify(items));
}
