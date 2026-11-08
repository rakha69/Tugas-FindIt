/**
 * FINDIT - Sistem Autentikasi & Manajemen Pengguna
 * Terkoneksi dengan LocalStorage: Registrasi, Login (Email / NIM), Sesi Aktif, dan Profil
 */

const Auth = {
  STORAGE_USERS: "findit_users",
  STORAGE_SESSION: "findit_currentUser",
  listeners: [],

  // Dapatkan seluruh daftar pengguna yang terdaftar
  getUsers() {
    const raw = localStorage.getItem(this.STORAGE_USERS);
    return raw ? JSON.parse(raw) : [];
  },

  // Simpan daftar pengguna
  saveUsers(users) {
    localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users));
  },

  // Dapatkan pengguna yang sedang login saat ini
  getCurrentUser() {
    const raw = localStorage.getItem(this.STORAGE_SESSION);
    return raw ? JSON.parse(raw) : null;
  },

  // Periksa apakah ada sesi login aktif
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  // Mendaftarkan callback ketika status auth berubah (login/logout)
  onAuthStateChanged(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
      // Panggil segera dengan status saat ini
      callback(this.getCurrentUser());
    }
  },

  // Beritahu semua listener
  notifyListeners() {
    const user = this.getCurrentUser();
    this.listeners.forEach((cb) => {
      try {
        cb(user);
      } catch (err) {
        console.error("Auth listener error:", err);
      }
    });
  },

  /**
   * Login pengguna
   * @param {string} identifier - Bisa menggunakan Email kampus atau NIM
   * @param {string} password - Password akun
   * @returns {Object} { success: boolean, message: string, user?: Object }
   */
  login(identifier, password) {
    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: "Email/NIM dan Password wajib diisi!" };
    }

    const users = this.getUsers();
    const matchedUser = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || (u.nim && u.nim.toLowerCase() === cleanId)) &&
        u.password === cleanPass
    );

    if (!matchedUser) {
      return {
        success: false,
        message: "Email/NIM atau password yang Anda masukkan salah."
      };
    }

    // Set sesi aktif (tanpa password disimpan di session untuk keamanan)
    const sessionData = { ...matchedUser };
    delete sessionData.password;
    localStorage.setItem(this.STORAGE_SESSION, JSON.stringify(sessionData));

    this.notifyListeners();
    return {
      success: true,
      message: `Selamat datang kembali, ${matchedUser.name}!`,
      user: sessionData
    };
  },

  /**
   * Pendaftaran akun baru
   * @param {Object} data { name, email, nim, faculty, phone, password }
   * @returns {Object} { success: boolean, message: string, user?: Object }
   */
  register(data) {
    const { name, email, nim, faculty, phone, password } = data;

    // Validasi dasar
    if (!name || !email || !nim || !phone || !password) {
      return { success: false, message: "Semua kolom bertanda bintang (*) wajib diisi!" };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNim = nim.trim();

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: "Format alamat email tidak valid!" };
    }

    // Validasi panjang password
    if (password.length < 6) {
      return { success: false, message: "Password minimal harus 6 karakter!" };
    }

    const users = this.getUsers();

    // Cek duplikasi email
    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: "Email sudah terdaftar. Silakan gunakan email lain atau masuk." };
    }

    // Cek duplikasi NIM
    const nimExists = users.some((u) => u.nim.toLowerCase() === cleanNim.toLowerCase());
    if (nimExists) {
      return { success: false, message: "NIM sudah terdaftar dalam sistem Findit!" };
    }

    // Generate Avatar inisial yang rapi
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const newUser = {
      id: "usr-" + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      nim: cleanNim,
      faculty: faculty ? faculty.trim() : "Civitas Kampus",
      phone: phone.trim(),
      password: password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=2563eb,1d4ed8,3b82f6&textColor=ffffff`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    // Otomatis login setelah registrasi berhasil
    const sessionData = { ...newUser };
    delete sessionData.password;
    localStorage.setItem(this.STORAGE_SESSION, JSON.stringify(sessionData));

    this.notifyListeners();
    return {
      success: true,
      message: `Akun berhasil dibuat! Selamat datang, ${newUser.name}.`,
      user: sessionData
    };
  },

  /**
   * Logout sesi pengguna saat ini
   */
  logout() {
    localStorage.removeItem(this.STORAGE_SESSION);
    this.notifyListeners();
    return { success: true, message: "Anda berhasil keluar dari akun." };
  },

  /**
   * Update data profil pengguna
   */
  updateProfile(updatedFields) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: "Tidak ada sesi aktif." };

    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === currentUser.id);

    if (userIndex === -1) {
      return { success: false, message: "Pengguna tidak ditemukan." };
    }

    // Update data di database users
    const updatedUser = {
      ...users[userIndex],
      ...updatedFields,
      id: currentUser.id // jaga ID agar tidak berubah
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);

    // Update data di sesi aktif
    const sessionData = { ...updatedUser };
    delete sessionData.password;
    localStorage.setItem(this.STORAGE_SESSION, JSON.stringify(sessionData));

    this.notifyListeners();
    return {
      success: true,
      message: "Profil Anda berhasil diperbarui!",
      user: sessionData
    };
  }
};

