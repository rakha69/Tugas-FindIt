/**
 * Layanan Autentikasi Mahasiswa Findit
 * Menggunakan key localStorage yang sama agar sesi user sebelumnya tetap berjalan
 */

const STORAGE_USERS = "findit_users";
const STORAGE_SESSION = "findit_currentUser";

export const AuthService = {
  getUsers() {
    const raw = localStorage.getItem(STORAGE_USERS);
    return raw ? JSON.parse(raw) : [];
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  },

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_SESSION);
    return raw ? JSON.parse(raw) : null;
  },

  login(identifier, password, portalRole = "student") {
    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanId || !cleanPass) {
      return {
        success: false,
        message: portalRole === "admin"
          ? "NIP/Email Petugas dan kata sandi otorisasi wajib diisi."
          : "Email/NIM dan kata sandi wajib diisi."
      };
    }

    const users = this.getUsers();
    const matchedUser = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId ||
          (u.nim && u.nim.toLowerCase() === cleanId) ||
          (u.nip && u.nip.toLowerCase() === cleanId)) &&
        u.password === cleanPass
    );

    if (!matchedUser) {
      return {
        success: false,
        message: portalRole === "admin"
          ? "NIP Petugas atau kata sandi otorisasi tidak valid."
          : "Email/NIM atau kata sandi tidak cocok."
      };
    }

    // Validasi Pemisahan Role Portal Login
    if (portalRole === "admin" && matchedUser.role !== "admin") {
      return {
        success: false,
        message: "Akses Ditolak: Akun ini terdaftar sebagai Mahasiswa, bukan Petugas/Admin Kampus."
      };
    }

    if (portalRole === "student" && matchedUser.role === "admin") {
      return {
        success: false,
        message: "Akun ini adalah Petugas Keamanan Kampus. Silakan beralih ke tab 'Petugas & Admin Kampus'."
      };
    }

    const sessionData = { ...matchedUser };
    delete sessionData.password;
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(sessionData));

    return {
      success: true,
      message: matchedUser.role === "admin"
        ? `Selamat bertugas di Pusat Keamanan, ${matchedUser.name}!`
        : `Selamat datang kembali, ${matchedUser.name}!`,
      user: sessionData
    };
  },

  register(data) {
    const { name, email, nim, faculty, phone, password } = data;

    if (!name || !email || !nim || !phone || !password) {
      return { success: false, message: "Semua kolom wajib diisi." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNim = nim.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: "Format email tidak valid." };
    }

    if (password.length < 6) {
      return { success: false, message: "Kata sandi minimal 6 karakter." };
    }

    const users = this.getUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Email sudah terdaftar." };
    }

    if (users.some((u) => u.nim.toLowerCase() === cleanNim.toLowerCase())) {
      return { success: false, message: "NIM sudah terdaftar di sistem." };
    }

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const newUser = {
      id: "usr-" + Date.now(),
      role: "student",
      name: name.trim(),
      email: cleanEmail,
      nim: cleanNim,
      faculty: faculty ? faculty.trim() : "Civitas Kampus",
      phone: phone.trim(),
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=0d9488,0f766e,115e59&textColor=ffffff`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    const sessionData = { ...newUser };
    delete sessionData.password;
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(sessionData));

    return {
      success: true,
      message: `Akun berhasil dibuat! Selamat datang, ${newUser.name}.`,
      user: sessionData
    };
  },

  logout() {
    localStorage.removeItem(STORAGE_SESSION);
    return { success: true, message: "Sesi akun telah berakhir." };
  },

  updateProfile(updatedFields) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: "Tidak ada sesi aktif." };

    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex === -1) return { success: false, message: "Pengguna tidak ditemukan." };

    const updatedUser = {
      ...users[userIndex],
      ...updatedFields,
      id: currentUser.id
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);

    const sessionData = { ...updatedUser };
    delete sessionData.password;
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(sessionData));

    return {
      success: true,
      message: "Profil berhasil diperbarui!",
      user: sessionData
    };
  }
};

