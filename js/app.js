/**
 * FINDIT - Main Application Logic
 * Menangani interaksi UI, filter data, pembuatan laporan, klaim verifikasi, dan sinkronisasi auth
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  let currentFilters = {
    keyword: "",
    category: "",
    location: "",
    type: "all", // 'all' | 'lost' | 'found' | 'resolved'
    sort: "newest" // 'newest' | 'oldest' | 'views'
  };

  let uploadedImageBase64 = null;
  let activeDetailItem = null;

  // DOM Elements
  const itemsGrid = document.getElementById("itemsGrid");
  const myItemsGrid = document.getElementById("myItemsGrid");
  const currentItemsCount = document.getElementById("currentItemsCount");
  const btnResetFilters = document.getElementById("btnResetFilters");

  // Counter Badges
  const badgeCountAll = document.getElementById("badgeCountAll");
  const badgeCountLost = document.getElementById("badgeCountLost");
  const badgeCountFound = document.getElementById("badgeCountFound");
  const badgeCountResolved = document.getElementById("badgeCountResolved");

  // Hero Stats
  const statTotalReports = document.getElementById("statTotalReports");
  const statResolvedReports = document.getElementById("statResolvedReports");
  const statActiveReports = document.getElementById("statActiveReports");

  // Views
  const viewExplore = document.getElementById("viewExplore");
  const viewMyReports = document.getElementById("viewMyReports");
  const navLinkHome = document.getElementById("navLinkHome");
  const navLinkMyReports = document.getElementById("navLinkMyReports");
  const navMyReportsItem = document.getElementById("navMyReportsItem");
  const myReportsCountBadge = document.getElementById("myReportsCountBadge");

  // Auth Nav Elements
  const guestActions = document.getElementById("guestActions");
  const userActions = document.getElementById("userActions");
  const navUserAvatar = document.getElementById("navUserAvatar");
  const navUserName = document.getElementById("navUserName");
  const btnUserDropdown = document.getElementById("btnUserDropdown");
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownUserNim = document.getElementById("dropdownUserNim");

  // Modals
  const authModal = document.getElementById("authModal");
  const reportModal = document.getElementById("reportModal");
  const detailModal = document.getElementById("detailModal");
  const claimModal = document.getElementById("claimModal");
  const profileModal = document.getElementById("profileModal");

  // =========================================================================
  // UTILITY HELPERS
  // =========================================================================
  function getItems() {
    const raw = localStorage.getItem("findit_items");
    return raw ? JSON.parse(raw) : [];
  }

  function saveItems(items) {
    localStorage.setItem("findit_items", JSON.stringify(items));
  }

  // Toast Notification System
  function showToast(title, message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconClass = "ri-information-line";
    if (type === "success") iconClass = "ri-checkbox-circle-line";
    if (type === "danger") iconClass = "ri-error-warning-line";

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${escapeHTML(title)}</div>
        <div class="toast-message">${escapeHTML(message)}</div>
      </div>
      <button class="toast-close" aria-label="Tutup">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => toast.remove());

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        setTimeout(() => toast.remove(), 250);
      }
    }, 4000);
  }

  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Indonesian Relative Time Formatter
  function formatRelativeTime(dateString) {
    if (!dateString) return "Beberapa saat lalu";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay === 1) return "Kemarin";
    if (diffDay < 7) return `${diffDay} hari yang lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  // WhatsApp Link Helper
  function createWhatsAppLink(phoneNumber, itemTitle, itemType) {
    let cleanPhone = (phoneNumber || "").replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    const typeLabel = itemType === "lost" ? "kehilangan" : "temuan";
    const text = encodeURIComponent(
      `Halo, saya menghubungi Anda melalui platform Findit Kampus terkait laporan ${typeLabel} barang: "${itemTitle}". Apakah masih relevan untuk dikonfirmasi? Terima kasih.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }

  // =========================================================================
  // AUTH STATE INTEGRATION
  // =========================================================================
  Auth.onAuthStateChanged((user) => {
    if (user) {
      // Tampilan sudah login
      guestActions.style.display = "none";
      userActions.style.display = "flex";
      navMyReportsItem.style.display = "block";

      navUserName.textContent = user.name.split(" ")[0];
      navUserAvatar.src = user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100";
      dropdownUserName.textContent = user.name;
      dropdownUserNim.textContent = `NIM: ${user.nim} (${user.faculty || "Mahasiswa"})`;

      // Update badge laporan milik user
      updateUserReportsBadge();
    } else {
      // Tampilan guest (belum login)
      guestActions.style.display = "flex";
      userActions.style.display = "none";
      navMyReportsItem.style.display = "none";

      // Jika sedang membuka tab 'Laporan Saya', kembalikan ke Beranda
      if (viewMyReports.style.display !== "none") {
        switchToExploreView();
      }
    }
    renderItems();
  });

  function updateUserReportsBadge() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    const items = getItems();
    const myCount = items.filter((item) => item.reporterId === user.id).length;
    myReportsCountBadge.textContent = myCount;
  }

  // Toggle User Dropdown
  btnUserDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    if (userDropdownMenu.classList.contains("show")) {
      userDropdownMenu.classList.remove("show");
    }
  });

  // Logout Handler
  document.getElementById("btnLogout").addEventListener("click", () => {
    Auth.logout();
    showToast("Berhasil Keluar", "Anda telah keluar dari sesi akun.", "info");
    userDropdownMenu.classList.remove("show");
  });

  // Mobile Menu Toggle
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const navMenu = document.getElementById("navMenu");
  mobileNavToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
  });

  // =========================================================================
  // VIEW SWITCHING (JELAJAHI VS LAPORAN SAYA)
  // =========================================================================
  function switchToExploreView() {
    viewExplore.style.display = "block";
    viewMyReports.style.display = "none";
    navLinkHome.classList.add("active");
    navLinkMyReports.classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function switchToMyReportsView() {
    const user = Auth.getCurrentUser();
    if (!user) {
      openAuthModal("login");
      showToast("Akses Dibatasi", "Silakan masuk terlebih dahulu untuk melihat laporan Anda.", "danger");
      return;
    }
    viewExplore.style.display = "none";
    viewMyReports.style.display = "block";
    navLinkHome.classList.remove("active");
    navLinkMyReports.classList.add("active");
    renderMyItems();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navLinkHome.addEventListener("click", (e) => {
    e.preventDefault();
    switchToExploreView();
  });

  navLinkMyReports.addEventListener("click", (e) => {
    e.preventDefault();
    switchToMyReportsView();
  });

  document.getElementById("menuMyReports").addEventListener("click", (e) => {
    e.preventDefault();
    userDropdownMenu.classList.remove("show");
    switchToMyReportsView();
  });

  document.getElementById("btnBackToExplore").addEventListener("click", () => {
    switchToExploreView();
  });

  document.getElementById("navBrandLogo").addEventListener("click", (e) => {
    e.preventDefault();
    switchToExploreView();
  });

  // =========================================================================
  // FILTERING, SEARCH & RENDERING LOGIC
  // =========================================================================
  function updateCounters(items) {
    const allCount = items.length;
    const lostCount = items.filter((i) => i.type === "lost" && i.status !== "resolved").length;
    const foundCount = items.filter((i) => i.type === "found" && i.status !== "resolved").length;
    const resolvedCount = items.filter((i) => i.status === "resolved").length;

    badgeCountAll.textContent = allCount;
    badgeCountLost.textContent = lostCount;
    badgeCountFound.textContent = foundCount;
    badgeCountResolved.textContent = resolvedCount;

    statTotalReports.textContent = allCount;
    statResolvedReports.textContent = resolvedCount;
    statActiveReports.textContent = lostCount + foundCount;
  }

  function renderItems() {
    const allItems = getItems();
    updateCounters(allItems);

    // Filter Items
    let filtered = allItems.filter((item) => {
      // Type Tab Filter
      if (currentFilters.type === "lost") {
        if (item.type !== "lost" || item.status === "resolved") return false;
      } else if (currentFilters.type === "found") {
        if (item.type !== "found" || item.status === "resolved") return false;
      } else if (currentFilters.type === "resolved") {
        if (item.status !== "resolved") return false;
      }

      // Category Filter
      if (currentFilters.category && item.category !== currentFilters.category) {
        return false;
      }

      // Location Filter (Search by substring in item.location)
      if (currentFilters.location) {
        const itemLoc = (item.location || "").toLowerCase();
        const filterLoc = currentFilters.location.toLowerCase();
        if (!itemLoc.includes(filterLoc)) return false;
      }

      // Keyword Search Filter (Search in title, desc, category, specificFeatures)
      if (currentFilters.keyword) {
        const q = currentFilters.keyword.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        const matchCat = (item.category || "").toLowerCase().includes(q);
        const matchFeat = (item.specificFeatures || "").toLowerCase().includes(q);
        const matchLoc = (item.location || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchFeat && !matchLoc) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (currentFilters.sort === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (currentFilters.sort === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (currentFilters.sort === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

    // Update result status count
    currentItemsCount.textContent = filtered.length;

    // Show / Hide Reset Filter Button
    const hasActiveFilters =
      currentFilters.keyword !== "" ||
      currentFilters.category !== "" ||
      currentFilters.location !== "" ||
      currentFilters.type !== "all";
    btnResetFilters.style.display = hasActiveFilters ? "inline-flex" : "none";

    // Render HTML Cards
    if (filtered.length === 0) {
      itemsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="ri-inbox-line"></i></div>
          <h3 class="empty-title">Tidak Ada Laporan yang Cocok</h3>
          <p class="empty-desc">
            Coba gunakan kata kunci lain, periksa ejaan, atau reset filter untuk melihat semua barang yang dilaporkan di kampus.
          </p>
          <button class="btn btn-outline btn-sm" id="btnEmptyReset">
            <i class="ri-refresh-line"></i> Reset Semua Filter
          </button>
        </div>
      `;
      const btnEmptyReset = document.getElementById("btnEmptyReset");
      if (btnEmptyReset) {
        btnEmptyReset.addEventListener("click", resetAllFilters);
      }
      return;
    }

    itemsGrid.innerHTML = filtered
      .map((item) => createItemCardHTML(item, false))
      .join("");

    // Attach Event Listeners to cards
    attachItemCardEvents();
  }

  function createItemCardHTML(item, isMyReport = false) {
    const isResolved = item.status === "resolved";
    let badgeHTML = "";
    if (isResolved) {
      badgeHTML = `<span class="badge-status badge-resolved"><i class="ri-checkbox-circle-fill"></i> SELESAI</span>`;
    } else if (item.type === "lost") {
      badgeHTML = `<span class="badge-status badge-lost"><i class="ri-alert-fill"></i> KEHILANGAN</span>`;
    } else {
      badgeHTML = `<span class="badge-status badge-found"><i class="ri-search-eye-line"></i> DITEMUKAN</span>`;
    }

    const rewardBadge =
      item.reward && item.type === "lost" && !isResolved
        ? `<span class="badge-reward"><i class="ri-gift-line"></i> Ada Imbalan</span>`
        : "";

    const imageSrc =
      item.image ||
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";

    const timeAgo = formatRelativeTime(item.createdAt);

    // Dynamic category icons and color classes (eliminates visual monotony)
    const catIcons = {
      "Elektronik": "ri-macbook-line",
      "Dokumen & Kartu": "ri-id-card-line",
      "Kunci & Aksesoris": "ri-key-2-line",
      "Tas & Dompet": "ri-wallet-3-line",
      "Barang Pribadi": "ri-cup-line",
      "Pakaian": "ri-t-shirt-line",
      "Lainnya": "ri-price-tag-3-line"
    };

    const catClassMap = {
      "Elektronik": "tag-elektronik",
      "Dokumen & Kartu": "tag-dokumen-kartu",
      "Kunci & Aksesoris": "tag-kunci-aksesoris",
      "Tas & Dompet": "tag-tas-dompet",
      "Barang Pribadi": "tag-barang-pribadi",
      "Pakaian": "tag-pakaian",
      "Lainnya": "tag-lainnya"
    };

    const iconClass = catIcons[item.category] || "ri-price-tag-3-line";
    const tagClass = catClassMap[item.category] || "tag-lainnya";

    return `
      <div class="item-card" data-id="${item.id}">
        <div class="item-card-image-wrap">
          <img src="${imageSrc}" alt="${escapeHTML(item.title)}" class="item-card-image" loading="lazy">
          ${badgeHTML}
          ${rewardBadge}
        </div>

        <div class="item-card-body">
          <div class="item-card-meta">
            <span class="item-category-tag ${tagClass}">
              <i class="${iconClass}"></i> ${escapeHTML(item.category)}
            </span>
            <span><i class="ri-time-line"></i> ${timeAgo}</span>
          </div>

          <h3 class="item-card-title">${escapeHTML(item.title)}</h3>
          <p class="item-card-desc">${escapeHTML(item.description)}</p>

          <div class="item-card-details">
            <div class="detail-line" title="${escapeHTML(item.location)}">
              <i class="ri-map-pin-line"></i>
              <span>${escapeHTML(item.location)}</span>
            </div>
            <div class="detail-line">
              <i class="ri-calendar-line"></i>
              <span>${item.date} ${item.time ? "• " + item.time : ""}</span>
            </div>
          </div>

          ${
            isMyReport
              ? `
              <div class="item-manage-bar">
                <button class="btn btn-outline btn-sm btn-toggle-status" data-id="${item.id}" style="flex: 1;">
                  <i class="ri-check-line"></i> ${isResolved ? "Buka Kembali" : "Tandai Selesai"}
                </button>
                ${
                  item.claims && item.claims.length > 0
                    ? `<button class="btn btn-outline btn-sm btn-view-claims" data-id="${item.id}" style="color: var(--primary); border-color: var(--primary-border); background-color: var(--primary-light); font-weight: 700;" title="Ada yang mengklaim barang ini">
                        <i class="ri-user-search-line"></i> Klaim (${item.claims.length})
                       </button>`
                    : ""
                }
                <button class="btn btn-danger btn-sm btn-delete-item" data-id="${item.id}" title="Hapus Laporan">
                  <i class="ri-delete-bin-line"></i>
                </button>
                <button class="btn btn-primary btn-sm btn-view-detail" data-id="${item.id}">
                  Detail
                </button>
              </div>
            `
              : `
              <div class="item-card-footer">
                <div class="reporter-brief">
                  <i class="ri-user-smile-line"></i>
                  <span>${escapeHTML(item.reporterName ? item.reporterName.split(" ")[0] : "Mahasiswa")}</span>
                </div>
                <button class="btn btn-outline btn-detail btn-view-detail" data-id="${item.id}">
                  Lihat Detail <i class="ri-arrow-right-s-line"></i>
                </button>
              </div>
            `
          }
        </div>
      </div>
    `;
  }

  function attachItemCardEvents() {
    document.querySelectorAll(".btn-view-detail").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        openDetailModal(id);
      });
    });
  }

  // =========================================================================
  // "LAPORAN SAYA" RENDERING
  // =========================================================================
  function renderMyItems() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const allItems = getItems();
    const myItems = allItems.filter((i) => i.reporterId === user.id);

    if (myItems.length === 0) {
      myItemsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="ri-file-add-line"></i></div>
          <h3 class="empty-title">Belum Ada Laporan yang Dibuat</h3>
          <p class="empty-desc">
            Anda belum pernah membuat laporan kehilangan atau temuan barang. Buat laporan pertama Anda sekarang!
          </p>
          <button class="btn btn-primary btn-sm" id="btnEmptyCreateReport">
            <i class="ri-add-line"></i> Buat Laporan Sekarang
          </button>
        </div>
      `;
      const btn = document.getElementById("btnEmptyCreateReport");
      if (btn) btn.addEventListener("click", () => openReportModal());
      return;
    }

    myItemsGrid.innerHTML = myItems
      .map((item) => createItemCardHTML(item, true))
      .join("");

    // Attach event listeners for status toggle & delete
    myItemsGrid.querySelectorAll(".btn-toggle-status").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        toggleItemResolvedStatus(id);
      });
    });

    myItemsGrid.querySelectorAll(".btn-delete-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        deleteItem(id);
      });
    });

    myItemsGrid.querySelectorAll(".btn-view-detail").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        openDetailModal(id);
      });
    });

    myItemsGrid.querySelectorAll(".btn-view-claims").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        openClaimsListModal(id);
      });
    });
  }

  function toggleItemResolvedStatus(itemId) {
    const items = getItems();
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const currentStatus = items[itemIndex].status;
    items[itemIndex].status = currentStatus === "resolved" ? "active" : "resolved";
    saveItems(items);

    showToast(
      "Status Diperbarui",
      items[itemIndex].status === "resolved"
        ? "Laporan telah ditandai selesai (barang sudah kembali/ditemukan)!"
        : "Laporan dibuka kembali.",
      "success"
    );

    renderMyItems();
    renderItems();
  }

  function deleteItem(itemId) {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    let items = getItems();
    items = items.filter((i) => i.id !== itemId);
    saveItems(items);

    showToast("Laporan Dihapus", "Laporan berhasil dihapus dari sistem.", "info");
    updateUserReportsBadge();
    renderMyItems();
    renderItems();
  }

  // =========================================================================
  // SEARCH & FILTER CONTROLS
  // =========================================================================
  const heroSearchForm = document.getElementById("heroSearchForm");
  const searchKeyword = document.getElementById("searchKeyword");
  const searchCategory = document.getElementById("searchCategory");
  const searchLocation = document.getElementById("searchLocation");

  heroSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentFilters.keyword = searchKeyword.value.trim();
    currentFilters.category = searchCategory.value;
    currentFilters.location = searchLocation.value;

    // Sinkronkan Category Chips jika kategori dipilih di dropdown
    syncCategoryChips(currentFilters.category);

    switchToExploreView();
    renderItems();
  });

  // Type Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilters.type = btn.dataset.type;
      renderItems();
    });
  });

  // Category Chips
  document.querySelectorAll(".category-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".category-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilters.category = chip.dataset.cat;
      searchCategory.value = chip.dataset.cat;
      renderItems();
    });
  });

  function syncCategoryChips(categoryValue) {
    document.querySelectorAll(".category-chip").forEach((chip) => {
      if (chip.dataset.cat === categoryValue) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
  }

  // Sort Order Dropdown
  document.getElementById("sortOrder").addEventListener("change", (e) => {
    currentFilters.sort = e.target.value;
    renderItems();
  });

  // Reset Filters
  function resetAllFilters() {
    currentFilters = {
      keyword: "",
      category: "",
      location: "",
      type: "all",
      sort: "newest"
    };

    searchKeyword.value = "";
    searchCategory.value = "";
    searchLocation.value = "";
    document.getElementById("sortOrder").value = "newest";

    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('.tab-btn[data-type="all"]').classList.add("active");

    syncCategoryChips("");
    renderItems();
  }

  btnResetFilters.addEventListener("click", resetAllFilters);

  // Footer Navigation links
  document.getElementById("footerLinkHome").addEventListener("click", (e) => {
    e.preventDefault();
    resetAllFilters();
    switchToExploreView();
  });

  document.getElementById("footerLinkLost").addEventListener("click", (e) => {
    e.preventDefault();
    resetAllFilters();
    currentFilters.type = "lost";
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('.tab-btn[data-type="lost"]').classList.add("active");
    switchToExploreView();
    renderItems();
  });

  document.getElementById("footerLinkFound").addEventListener("click", (e) => {
    e.preventDefault();
    resetAllFilters();
    currentFilters.type = "found";
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('.tab-btn[data-type="found"]').classList.add("active");
    switchToExploreView();
    renderItems();
  });

  // =========================================================================
  // DETAIL MODAL LOGIC
  // =========================================================================
  function openDetailModal(itemId) {
    const items = getItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    activeDetailItem = item;

    // Increment Views
    item.views = (item.views || 0) + 1;
    saveItems(items);

    // Populate Fields
    const detailBadgeStatus = document.getElementById("detailBadgeStatus");
    if (item.status === "resolved") {
      detailBadgeStatus.className = "badge-status badge-resolved";
      detailBadgeStatus.innerHTML = `<i class="ri-checkbox-circle-fill"></i> SELESAI / SUDAH KEMBALI`;
    } else if (item.type === "lost") {
      detailBadgeStatus.className = "badge-status badge-lost";
      detailBadgeStatus.innerHTML = `<i class="ri-alert-fill"></i> KEHILANGAN`;
    } else {
      detailBadgeStatus.className = "badge-status badge-found";
      detailBadgeStatus.innerHTML = `<i class="ri-search-eye-line"></i> BARANG DITEMUKAN`;
    }

    document.getElementById("detailItemHeaderTitle").textContent = item.category;
    document.getElementById("detailTitle").textContent = item.title;
    document.getElementById("detailDesc").textContent = item.description;
    document.getElementById("detailCategory").textContent = item.category;
    document.getElementById("detailLocation").textContent = item.location;
    document.getElementById("detailDate").textContent = item.date;
    document.getElementById("detailTime").textContent = item.time || "Tidak disebutkan";
    document.getElementById("detailFeatures").textContent = item.specificFeatures || "Tidak ada ciri khusus terdaftar";
    document.getElementById("detailStatusText").textContent =
      item.status === "resolved" ? "Kasus Ditutup (Barang sudah diserahkan)" : "Masih Aktif Dicari";

    // Reward Banner
    const detailRewardBanner = document.getElementById("detailRewardBanner");
    const detailRewardText = document.getElementById("detailRewardText");
    if (item.reward && item.type === "lost" && item.status !== "resolved") {
      detailRewardBanner.style.display = "block";
      detailRewardText.textContent = item.reward;
    } else {
      detailRewardBanner.style.display = "none";
    }

    // Photo
    const detailImage = document.getElementById("detailImage");
    detailImage.src =
      item.image ||
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";

    // Reporter Info
    document.getElementById("detailReporterName").textContent = item.reporterName || "Mahasiswa Anonim";
    document.getElementById("detailReporterFaculty").textContent = item.reporterFaculty || "Civitas Kampus";
    document.getElementById("detailReporterAvatar").src =
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.reporterName || "User")}&backgroundColor=2563eb&textColor=ffffff`;

    // WhatsApp Contact Link
    const btnContactWA = document.getElementById("btnContactWA");
    btnContactWA.href = createWhatsAppLink(item.reporterPhone, item.title, item.type);

    // Claim Button visibility
    const btnOpenClaimModal = document.getElementById("btnOpenClaimModal");
    if (item.status === "resolved") {
      btnOpenClaimModal.style.display = "none";
    } else {
      btnOpenClaimModal.style.display = "inline-flex";
      btnOpenClaimModal.textContent =
        item.type === "found" ? "Ini Barang Saya (Ajukan Klaim)" : "Saya Menemukan Barang Ini";
    }

    detailModal.classList.add("active");
  }

  document.getElementById("btnCloseDetailModal").addEventListener("click", () => {
    detailModal.classList.remove("active");
  });

  // Share & Print Handlers for Detail Modal
  const btnShareItem = document.getElementById("btnShareItem");
  if (btnShareItem) {
    btnShareItem.addEventListener("click", () => {
      if (!activeDetailItem) return;
      const typeLabel = activeDetailItem.type === "lost" ? "KEHILANGAN" : "TEMUAN";
      const shareText = `[Findit Kampus - Info ${typeLabel}]\nBarang: ${activeDetailItem.title}\nLokasi: ${activeDetailItem.location}\nKategori: ${activeDetailItem.category}\n\nSilakan cek detail lengkapnya di aplikasi Findit Kampus!`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          showToast("Berhasil Disalin!", "Teks ringkasan laporan telah disalin ke clipboard untuk dibagikan.", "success");
        }).catch(() => {
          showToast("Bagikan Info", shareText, "info");
        });
      } else {
        showToast("Bagikan Info", shareText, "info");
      }
    });
  }

  const btnPrintItem = document.getElementById("btnPrintItem");
  if (btnPrintItem) {
    btnPrintItem.addEventListener("click", () => {
      window.print();
    });
  }

  // =========================================================================
  // CLAIMS LIST MODAL LOGIC (INCOMING CLAIMS REVIEW FOR REPORT CREATOR)
  // =========================================================================
  const claimsListModal = document.getElementById("claimsListModal");
  const claimsListContainer = document.getElementById("claimsListContainer");
  const btnCloseClaimsListModal = document.getElementById("btnCloseClaimsListModal");

  function openClaimsListModal(itemId) {
    const items = getItems();
    const item = items.find((i) => i.id === itemId);
    if (!item || !claimsListModal || !claimsListContainer) return;

    if (!item.claims || item.claims.length === 0) {
      claimsListContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--slate-500);">
          <i class="ri-inbox-line" style="font-size: 2.5rem; color: var(--slate-400);"></i>
          <p style="margin-top: 0.5rem; font-weight: 600;">Belum ada pengajuan klaim untuk barang ini.</p>
        </div>
      `;
    } else {
      claimsListContainer.innerHTML = item.claims.map((claim, idx) => {
        const waLink = createWhatsAppLink(claim.claimantPhone, item.title, "klaim kepemilikan");
        return `
          <div class="claim-submission-card">
            <div class="claim-header-row">
              <div class="claimant-info">
                <h4><i class="ri-user-star-line" style="color: var(--primary);"></i> ${escapeHTML(claim.claimantName)}</h4>
                <p>NIM: ${escapeHTML(claim.claimantNim)} • Diajukan: ${formatRelativeTime(claim.claimedAt)}</p>
              </div>
              <span class="badge-status badge-found" style="position: static; font-size: 0.72rem; padding: 0.2rem 0.65rem;">
                Kandidat #${idx + 1}
              </span>
            </div>
            
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--slate-700); margin-bottom: 0.35rem;">
              <i class="ri-key-line" style="color: var(--accent-amber);"></i> Bukti / Keterangan Rahasia yang Diajukan:
            </div>
            <div class="claim-proof-box">
              "${escapeHTML(claim.proof)}"
            </div>

            <div class="claim-actions-row">
              <a href="${waLink}" target="_blank" class="btn btn-success btn-sm" style="text-decoration: none;">
                <i class="ri-whatsapp-line"></i> Hubungi via WhatsApp
              </a>
              <button class="btn btn-primary btn-sm btn-approve-claim" data-itemid="${item.id}">
                <i class="ri-check-double-line"></i> Setujui &amp; Tandai Selesai
              </button>
            </div>
          </div>
        `;
      }).join("");

      // Listener tombol setujui klaim
      claimsListContainer.querySelectorAll(".btn-approve-claim").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const itId = e.currentTarget.dataset.itemid;
          toggleItemResolvedStatus(itId);
          claimsListModal.classList.remove("active");
          showToast("Klaim Diterima", "Barang telah berhasil diserahkan dan status ditandai Selesai!", "success");
        });
      });
    }

    claimsListModal.classList.add("active");
  }

  if (btnCloseClaimsListModal) {
    btnCloseClaimsListModal.addEventListener("click", () => {
      claimsListModal.classList.remove("active");
    });
  }

  // =========================================================================
  // CLAIM MODAL LOGIC
  // =========================================================================
  document.getElementById("btnOpenClaimModal").addEventListener("click", () => {
    if (!Auth.isLoggedIn()) {
      detailModal.classList.remove("active");
      openAuthModal("login");
      showToast("Perlu Masuk", "Silakan login terlebih dahulu untuk mengajukan klaim verifikasi barang.", "info");
      return;
    }

    const currentUser = Auth.getCurrentUser();
    document.getElementById("claimItemId").value = activeDetailItem ? activeDetailItem.id : "";
    document.getElementById("claimName").value = currentUser.name || "";
    document.getElementById("claimNim").value = currentUser.nim || "";
    document.getElementById("claimPhone").value = currentUser.phone || "";
    document.getElementById("claimProof").value = "";

    detailModal.classList.remove("active");
    claimModal.classList.add("active");
  });

  document.getElementById("btnCloseClaimModal").addEventListener("click", () => {
    claimModal.classList.remove("active");
  });

  document.getElementById("btnCancelClaim").addEventListener("click", () => {
    claimModal.classList.remove("active");
  });

  document.getElementById("formClaim").addEventListener("submit", (e) => {
    e.preventDefault();
    const itemId = document.getElementById("claimItemId").value;
    const proof = document.getElementById("claimProof").value.trim();
    const user = Auth.getCurrentUser();

    if (!proof) {
      showToast("Gagal", "Bukti rahasia kepemilikan wajib diisi!", "danger");
      return;
    }

    const items = getItems();
    const item = items.find((i) => i.id === itemId);
    if (item) {
      if (!item.claims) item.claims = [];
      item.claims.push({
        claimantId: user ? user.id : "anon",
        claimantName: document.getElementById("claimName").value,
        claimantNim: document.getElementById("claimNim").value,
        claimantPhone: document.getElementById("claimPhone").value,
        proof: proof,
        claimedAt: new Date().toISOString()
      });
      saveItems(items);
    }

    claimModal.classList.remove("active");
    showToast(
      "Klaim Terkirim",
      "Pengajuan klaim dan verifikasi Anda telah tersimpan. Pelapor akan segera menghubungi kontak Anda.",
      "success"
    );
  });

  // =========================================================================
  // REPORT MODAL (CREATE REPORT) LOGIC
  // =========================================================================
  const btnToggleLost = document.getElementById("btnToggleLost");
  const btnToggleFound = document.getElementById("btnToggleFound");
  const reportTypeInput = document.getElementById("reportType");
  const groupReward = document.getElementById("groupReward");

  btnToggleLost.addEventListener("click", () => {
    btnToggleLost.classList.add("active");
    btnToggleFound.classList.remove("active");
    reportTypeInput.value = "lost";
    groupReward.style.display = "block";
  });

  btnToggleFound.addEventListener("click", () => {
    btnToggleFound.classList.add("active");
    btnToggleLost.classList.remove("active");
    reportTypeInput.value = "found";
    groupReward.style.display = "none";
  });

  function openReportModal() {
    if (!Auth.isLoggedIn()) {
      openAuthModal("login");
      showToast("Perlu Masuk", "Silakan login atau daftar akun terlebih dahulu untuk membuat laporan.", "danger");
      return;
    }

    const currentUser = Auth.getCurrentUser();

    // Reset Form
    document.getElementById("formReport").reset();
    btnToggleLost.click();
    document.getElementById("reportDate").value = new Date().toISOString().split("T")[0];
    document.getElementById("reportPhone").value = currentUser.phone || "";
    clearImagePreview();

    reportModal.classList.add("active");
  }

  document.getElementById("btnOpenCreateReport").addEventListener("click", openReportModal);
  document.getElementById("btnFastReportModal").addEventListener("click", openReportModal);
  const btnMyReportsCreate = document.getElementById("btnMyReportsCreate");
  if (btnMyReportsCreate) {
    btnMyReportsCreate.addEventListener("click", openReportModal);
  }

  document.getElementById("btnCloseReportModal").addEventListener("click", () => {
    reportModal.classList.remove("active");
  });

  document.getElementById("btnCancelReport").addEventListener("click", () => {
    reportModal.classList.remove("active");
  });

  // Image Upload with Preview & Base64 Converter
  const dropZone = document.getElementById("dropZone");
  const reportImageInput = document.getElementById("reportImageInput");
  const imagePreview = document.getElementById("imagePreview");
  const btnRemoveImage = document.getElementById("btnRemoveImage");

  dropZone.addEventListener("click", (e) => {
    if (e.target === btnRemoveImage || btnRemoveImage.contains(e.target)) return;
    reportImageInput.click();
  });

  reportImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast("Ukuran File Terlalu Besar", "Maksimal ukuran foto adalah 3MB.", "danger");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        uploadedImageBase64 = event.target.result;
        imagePreview.src = uploadedImageBase64;
        imagePreview.style.display = "block";
        btnRemoveImage.style.display = "inline-flex";
      };
      reader.readAsDataURL(file);
    }
  });

  btnRemoveImage.addEventListener("click", (e) => {
    e.stopPropagation();
    clearImagePreview();
  });

  function clearImagePreview() {
    uploadedImageBase64 = null;
    reportImageInput.value = "";
    imagePreview.src = "";
    imagePreview.style.display = "none";
    btnRemoveImage.style.display = "none";
  }

  // Handle Form Report Submit
  document.getElementById("formReport").addEventListener("submit", (e) => {
    e.preventDefault();
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;

    const title = document.getElementById("reportTitle").value.trim();
    const type = reportTypeInput.value;
    const category = document.getElementById("reportCategory").value;
    const location = document.getElementById("reportLocation").value.trim();
    const date = document.getElementById("reportDate").value;
    const time = document.getElementById("reportTime").value;
    const desc = document.getElementById("reportDesc").value.trim();
    const features = document.getElementById("reportFeatures").value.trim();
    const reward = document.getElementById("reportReward").value.trim();
    const phone = document.getElementById("reportPhone").value.trim();

    // Gambar fallback berdasarkan kategori jika user tidak upload
    let finalImage = uploadedImageBase64;
    if (!finalImage) {
      const fallbackImages = {
        "Elektronik": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
        "Dokumen & Kartu": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80",
        "Kunci & Aksesoris": "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&q=80",
        "Tas & Dompet": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
        "Barang Pribadi": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80",
        "Pakaian": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80",
        "Lainnya": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80"
      };
      finalImage = fallbackImages[category] || fallbackImages["Lainnya"];
    }

    const newItem = {
      id: "item-" + Date.now(),
      type: type,
      title: title,
      category: category,
      location: location,
      date: date,
      time: time,
      description: desc,
      specificFeatures: features,
      reward: type === "lost" ? reward : "",
      image: finalImage,
      status: "active",
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterFaculty: currentUser.faculty || "Mahasiswa",
      reporterPhone: phone || currentUser.phone,
      createdAt: new Date().toISOString(),
      views: 0,
      claims: []
    };

    const items = getItems();
    items.unshift(newItem); // Tambahkan ke paling atas
    saveItems(items);

    reportModal.classList.remove("active");
    clearImagePreview();

    showToast(
      "Laporan Berhasil Diterbitkan!",
      `Laporan barang "${title}" sekarang aktif dan dapat dilihat oleh seluruh civitas kampus.`,
      "success"
    );

    updateUserReportsBadge();
    renderItems();

    // Jika sedang di view 'Laporan Saya', render juga di sana
    if (viewMyReports.style.display !== "none") {
      renderMyItems();
    }
  });

  // =========================================================================
  // AUTH MODAL & FORM SWITCHER
  // =========================================================================
  const formLogin = document.getElementById("formLogin");
  const formRegister = document.getElementById("formRegister");
  const tabBtnLogin = document.getElementById("tabBtnLogin");
  const tabBtnRegister = document.getElementById("tabBtnRegister");
  const authModalTitle = document.getElementById("authModalTitle");

  function openAuthModal(mode = "login") {
    authModal.classList.add("active");

    // Kembalikan visibilitas password ke mode tersembunyi setiap kali modal dibuka
    document.querySelectorAll(".password-field-wrapper input").forEach((inp) => {
      inp.type = "password";
    });
    document.querySelectorAll(".btn-toggle-password i").forEach((icon) => {
      icon.className = "ri-eye-line";
    });

    if (mode === "login") {
      tabBtnLogin.classList.add("active");
      tabBtnRegister.classList.remove("active");
      formLogin.style.display = "block";
      formRegister.style.display = "none";
      authModalTitle.innerHTML = `<i class="ri-user-line" style="color: var(--primary);"></i> Masuk ke Akun`;
    } else {
      tabBtnRegister.classList.add("active");
      tabBtnLogin.classList.remove("active");
      formRegister.style.display = "block";
      formLogin.style.display = "none";
      authModalTitle.innerHTML = `<i class="ri-user-add-line" style="color: var(--primary);"></i> Pendaftaran Akun Mahasiswa`;
    }
  }

  // Toggle Password Visibility (Fitur Mata / Show-Hide Password & PIN)
  document.querySelectorAll(".btn-toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) return;

      const icon = btn.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.className = "ri-eye-off-line";
        }
        btn.setAttribute("aria-label", "Sembunyikan kata sandi");
        btn.setAttribute("title", "Sembunyikan Kata Sandi");
      } else {
        input.type = "password";
        if (icon) {
          icon.className = "ri-eye-line";
        }
        btn.setAttribute("aria-label", "Lihat kata sandi");
        btn.setAttribute("title", "Lihat Kata Sandi");
      }
    });
  });

  document.getElementById("btnOpenLogin").addEventListener("click", () => openAuthModal("login"));
  document.getElementById("btnOpenRegister").addEventListener("click", () => openAuthModal("register"));
  document.getElementById("btnCloseAuthModal").addEventListener("click", () => {
    authModal.classList.remove("active");
  });

  tabBtnLogin.addEventListener("click", () => openAuthModal("login"));
  tabBtnRegister.addEventListener("click", () => openAuthModal("register"));

  // Clickable Demo Credentials Pills
  document.querySelectorAll(".demo-account-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.getElementById("loginIdentifier").value = pill.dataset.email;
      document.getElementById("loginPassword").value = pill.dataset.pass;
      showToast("Kredensial Terisi", "Klik 'Masuk Sekarang' untuk menguji akun demo.", "info");
    });
  });

  // Submit Login
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("loginIdentifier").value;
    const pass = document.getElementById("loginPassword").value;

    const res = Auth.login(id, pass);
    if (res.success) {
      authModal.classList.remove("active");
      formLogin.reset();
      showToast("Login Berhasil", res.message, "success");
    } else {
      showToast("Login Gagal", res.message, "danger");
    }
  });

  // Submit Register
  formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const nim = document.getElementById("regNim").value;
    const faculty = document.getElementById("regFaculty").value;
    const email = document.getElementById("regEmail").value;
    const phone = document.getElementById("regPhone").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (password !== confirmPassword) {
      showToast("Validasi Password", "Konfirmasi password tidak cocok dengan password yang dimasukkan!", "danger");
      return;
    }

    const res = Auth.register({ name, nim, faculty, email, phone, password });
    if (res.success) {
      authModal.classList.remove("active");
      formRegister.reset();
      showToast("Pendaftaran Sukses", res.message, "success");
    } else {
      showToast("Pendaftaran Gagal", res.message, "danger");
    }
  });

  // =========================================================================
  // USER PROFILE MODAL
  // =========================================================================
  document.getElementById("menuProfile").addEventListener("click", (e) => {
    e.preventDefault();
    userDropdownMenu.classList.remove("show");
    const user = Auth.getCurrentUser();
    if (!user) return;

    document.getElementById("profileAvatarImg").src = user.avatar;
    document.getElementById("profileHeaderName").textContent = user.name;
    document.getElementById("profileHeaderEmail").textContent = user.email;
    document.getElementById("profileName").value = user.name;
    document.getElementById("profileNim").value = user.nim;
    document.getElementById("profileFaculty").value = user.faculty || "";
    document.getElementById("profilePhone").value = user.phone || "";

    profileModal.classList.add("active");
  });

  document.getElementById("btnCloseProfileModal").addEventListener("click", () => {
    profileModal.classList.remove("active");
  });

  document.getElementById("formUpdateProfile").addEventListener("submit", (e) => {
    e.preventDefault();
    const newName = document.getElementById("profileName").value.trim();
    const newFaculty = document.getElementById("profileFaculty").value.trim();
    const newPhone = document.getElementById("profilePhone").value.trim();

    const res = Auth.updateProfile({
      name: newName,
      faculty: newFaculty,
      phone: newPhone
    });

    if (res.success) {
      profileModal.classList.remove("active");
      showToast("Profil Disimpan", res.message, "success");
    } else {
      showToast("Gagal Memperbarui", res.message, "danger");
    }
  });

  // Close Modals on clicking outside overlay
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      e.target.classList.remove("active");
    }
  });

  // Initial load render
  renderItems();
});

