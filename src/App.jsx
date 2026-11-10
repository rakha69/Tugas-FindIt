import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  CAMPUS_ZONES,
  CATEGORIES,
  initDatabase,
  getStoredItems,
  saveStoredItems
} from "./data/initialData.js";
import { AuthService } from "./services/authService.js";

const APPLE_SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.8
};

const SOFT_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 28
};

function formatIncidentDate(dateStr) {
  if (!dateStr) return "Tanggal tidak dicantumkan";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

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

export default function App() {
  // Inisialisasi penyimpanan lokal & migrasi nomor KTM
  useEffect(() => {
    initDatabase();
  }, []);

  const [items, setItems] = useState(() => {
    initDatabase();
    return getStoredItems();
  });

  const [currentUser, setCurrentUser] = useState(() => AuthService.getCurrentUser());
  const [activeView, setActiveView] = useState("explore"); // 'explore' | 'my-reports' | 'guide'

  // State Filter
  const [keyword, setKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'lost' | 'found' | 'resolved'
  const [sortBy, setSortBy] = useState("newest");

  // State Modals & Sheets
  const [selectedItem, setSelectedItem] = useState(null);
  const [authModalMode, setAuthModalMode] = useState(null); // null | 'login' | 'register'
  const [pendingReportAfterLogin, setPendingReportAfterLogin] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState(null);
  const [claimsReviewItem, setClaimsReviewItem] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const pushToast = (title, message, tone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const syncItems = (updatedItems) => {
    setItems(updatedItems);
    saveStoredItems(updatedItems);
  };

  // Hitungan Tab & Radar
  const counts = useMemo(() => {
    const all = items.length;
    const lost = items.filter((i) => i.type === "lost" && i.status !== "resolved").length;
    const found = items.filter((i) => i.type === "found" && i.status !== "resolved").length;
    const resolved = items.filter((i) => i.status === "resolved").length;
    const myCount = currentUser
      ? items.filter((i) => i.reporterId === currentUser.id).length
      : 0;
    return { all, lost, found, resolved, myCount };
  }, [items, currentUser]);

  // State Simulasi Cek Fisik & Verifikasi (Interactive Inspection Checklist)
  const [inspectionPreset, setInspectionPreset] = useState("dokumen"); // 'dokumen' | 'elektronik' | 'kunci'
  const [checkedSteps, setCheckedSteps] = useState([true, false, false]);

  const inspectionProtocols = {
    dokumen: {
      label: "KTM & Dompet",
      icon: "ri-id-card-line",
      steps: [
        {
          title: "Cocokkan NIM & Foto Identitas",
          desc: "Pastikan wajah & NIM pengklaim sesuai dengan yang tertera di kartu."
        },
        {
          title: "Tanyakan Isi Saku Tersembunyi",
          desc: "Minta sebutkan kartu lain, struk, atau ciri goresan yang dirahasiakan."
        },
        {
          title: "Serah Terima di Titik Publik",
          desc: "Bertemu di Meja Sirkulasi Perpustakaan atau Pos Satpam Rektorat."
        }
      ]
    },
    elektronik: {
      label: "Gadget & Audio",
      icon: "ri-macbook-line",
      steps: [
        {
          title: "Uji Koneksi Otomatis / Lockscreen",
          desc: "Cek apakah perangkat langsung terhubung (auto-pair) atau cocok gambar lockscreen-nya."
        },
        {
          title: "Periksa Inisial / Casing / Nomor Seri",
          desc: "Verifikasi ukiran laser, stiker, atau goresan bodi yang tidak tampak di foto."
        },
        {
          title: "Serah Terima di Titik Publik",
          desc: "Bertemu di Ruang Asisten Lab atau Lobi Utama Fakultas saat jam kuliah."
        }
      ]
    },
    kunci: {
      label: "Kunci & Barang",
      icon: "ri-key-2-line",
      steps: [
        {
          title: "Detail Gantungan & Anak Kunci",
          desc: "Pastikan jumlah anak kunci, karakter gantungan, atau stiker botol sesuai."
        },
        {
          title: "Validasi Kronologi Jam & Kelas",
          desc: "Cocokkan waktu tertinggal dengan jadwal pemakaian ruangan/parkiran."
        },
        {
          title: "Serah Terima di Titik Publik",
          desc: "Bertemu di Pos Keamanan Parkiran atau Lobi Gedung Kuliah Bersama."
        }
      ]
    }
  };

  const toggleInspectionStep = (idx) => {
    setCheckedSteps((prev) => prev.map((val, i) => (i === idx ? !val : val)));
  };

  const readinessScore = Math.round(
    (checkedSteps.filter(Boolean).length / checkedSteps.length) * 100
  );

  // Item Kehilangan Spotlight (Urgent Pass)
  const urgentSpotlightItem = useMemo(() => {
    return items.find((i) => i.type === "lost" && i.status !== "resolved") || null;
  }, [items]);

  // Daftar Item Terfilter
  const filteredItems = useMemo(() => {
    let list = items.filter((item) => {
      if (typeFilter === "lost" && (item.type !== "lost" || item.status === "resolved")) {
        return false;
      }
      if (typeFilter === "found" && (item.type !== "found" || item.status === "resolved")) {
        return false;
      }
      if (typeFilter === "resolved" && item.status !== "resolved") {
        return false;
      }
      if (categoryFilter && item.category !== categoryFilter) {
        return false;
      }
      if (locationFilter) {
        const loc = (item.location || "").toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }
      if (keyword.trim()) {
        const q = keyword.trim().toLowerCase();
        const inTitle = (item.title || "").toLowerCase().includes(q);
        const inDesc = (item.description || "").toLowerCase().includes(q);
        const inLoc = (item.location || "").toLowerCase().includes(q);
        const inCat = (item.category || "").toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inLoc && !inCat) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "views") return (b.views || 0) - (a.views || 0);
      return 0;
    });

    return list;
  }, [items, typeFilter, categoryFilter, locationFilter, keyword, sortBy]);

  const myItems = useMemo(() => {
    if (!currentUser) return [];
    return items.filter((i) => i.reporterId === currentUser.id);
  }, [items, currentUser]);

  const hasActiveFilters =
    keyword.trim() !== "" ||
    locationFilter !== "" ||
    categoryFilter !== "" ||
    typeFilter !== "all";

  const resetFilters = () => {
    setKeyword("");
    setLocationFilter("");
    setCategoryFilter("");
    setTypeFilter("all");
    setSortBy("newest");
  };

  // Buka Detail Sheet & tambah views
  const handleOpenDetail = (item) => {
    const updated = items.map((it) =>
      it.id === item.id ? { ...it, views: (it.views || 0) + 1 } : it
    );
    syncItems(updated);
    const fresh = updated.find((it) => it.id === item.id) || item;
    setSelectedItem(fresh);
  };

  // Klik tombol Lapor Barang
  const handleTriggerReport = () => {
    if (!currentUser) {
      setPendingReportAfterLogin(true);
      setAuthModalMode("login");
      pushToast(
        "Masuk Terlebih Dahulu",
        "Silakan masuk ke akun kampus Anda untuk mulai membuat laporan.",
        "info"
      );
      return;
    }
    setIsReportModalOpen(true);
  };

  // Tandai selesai / buka kembali
  const handleToggleResolved = (itemId) => {
    const updated = items.map((it) => {
      if (it.id !== itemId) return it;
      const nextStatus = it.status === "resolved" ? "active" : "resolved";
      return { ...it, status: nextStatus };
    });
    syncItems(updated);
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(updated.find((i) => i.id === itemId) || null);
    }
    pushToast("Status Diperbarui", "Status laporan berhasil diperbarui.", "success");
  };

  // Hapus laporan
  const handleDeleteItem = (itemId) => {
    if (!window.confirm("Yakin ingin menghapus laporan ini secara permanen?")) return;
    const updated = items.filter((it) => it.id !== itemId);
    syncItems(updated);
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(null);
    }
    pushToast("Laporan Dihapus", "Data laporan telah dihapus dari sistem.", "info");
  };

  return (
    <div className="app-wrapper">
      {/* ==================== FLOATING APPLE GLASS DOCK NAVBAR ==================== */}
      <header className="top-dock-wrapper">
        <div className="top-dock">
          <div
            className="brand-cluster"
            onClick={() => {
              setActiveView("explore");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="brand-orb">
              <i className="ri-compass-discover-line"></i>
            </div>
            <div>
              <div className="brand-title">
                Find<span>it</span>.
              </div>
              <div className="brand-tag">Campus Radar 2.0</div>
            </div>
          </div>

          {/* Segmented Navigation Pills with Framer Motion layoutId */}
          <LayoutGroup id="top-dock-nav">
            <nav className="dock-nav-pills">
              <button
                type="button"
                className={`dock-pill-btn ${activeView === "explore" ? "active" : ""}`}
                onClick={() => setActiveView("explore")}
              >
                {activeView === "explore" && (
                  <motion.span
                    layoutId="dockNavPill"
                    className="dock-pill-bg"
                    transition={APPLE_SPRING}
                  />
                )}
                <i className="ri-radar-line"></i>
                <span>Eksplorasi Radar</span>
              </button>

              {currentUser && (
                <button
                  type="button"
                  className={`dock-pill-btn ${activeView === "my-reports" ? "active" : ""}`}
                  onClick={() => setActiveView("my-reports")}
                >
                  {activeView === "my-reports" && (
                    <motion.span
                      layoutId="dockNavPill"
                      className="dock-pill-bg"
                      transition={APPLE_SPRING}
                    />
                  )}
                  <i className="ri-folder-user-line"></i>
                  <span>Laporan Saya</span>
                  <span className="dock-count-chip">{counts.myCount}</span>
                </button>
              )}

              <button
                type="button"
                className={`dock-pill-btn ${activeView === "guide" ? "active" : ""}`}
                onClick={() => setActiveView("guide")}
              >
                {activeView === "guide" && (
                  <motion.span
                    layoutId="dockNavPill"
                    className="dock-pill-bg"
                    transition={APPLE_SPRING}
                  />
                )}
                <i className="ri-shield-check-line"></i>
                <span>Panduan Aman</span>
              </button>
            </nav>
          </LayoutGroup>

          {/* User / Guest Actions */}
          <div className="dock-actions">
            {!currentUser ? (
              <>
                <button
                  type="button"
                  className="btn-apple btn-glass btn-sm"
                  onClick={() => setAuthModalMode("login")}
                >
                  <i className="ri-login-circle-line"></i> Masuk
                </button>
                <button
                  type="button"
                  className="btn-apple btn-ink btn-sm"
                  onClick={() => setAuthModalMode("register")}
                >
                  Daftar Akun
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-apple btn-emerald btn-sm"
                  onClick={handleTriggerReport}
                >
                  <i className="ri-add-circle-line"></i> Lapor Barang
                </button>
                <button
                  type="button"
                  className="btn-apple btn-glass btn-sm"
                  onClick={() => setIsProfileModalOpen(true)}
                  title="Profil Mahasiswa"
                >
                  <i className="ri-user-smile-line"></i>
                  <span>{currentUser.name.split(" ")[0]}</span>
                </button>
                <button
                  type="button"
                  className="btn-apple btn-coral-soft btn-sm"
                  onClick={() => {
                    AuthService.logout();
                    setCurrentUser(null);
                    setActiveView("explore");
                    pushToast("Berhasil Keluar", "Sesi akun Anda telah ditutup.", "info");
                  }}
                  title="Keluar"
                >
                  <i className="ri-logout-box-r-line"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT SWITCHER WITH APPLE TRANSITIONS ==================== */}
      <main className="container-shell">
        <AnimatePresence mode="wait">
          {activeView === "explore" && (
            <motion.div
              key="view-explore"
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={APPLE_SPRING}
            >
              {/* ASYMMETRIC BENTO COMMAND CENTER */}
              <section className="bento-command-grid">
                {/* Left Bento: Editorial Hero & Search */}
                <div className="bento-hero-card">
                  <div>
                    <div className="live-status-pill">
                      <span className="pulse-dot"></span>
                      <span>Ekosistem Pelacakan Barang Kampus Terverifikasi</span>
                    </div>
                    <h1 className="bento-headline">
                      Kehilangan atau Menemukan Barang di Kampus? Lacak di <em>Findit.</em>
                    </h1>
                    <p className="bento-subtext">
                      Dirancang agar civitas akademika dapat melaporkan, memfilter titik gedung secara
                      interaktif, dan memverifikasi klaim kepemilikan dengan aman.
                    </p>

                    {/* Centered Primary CTA Button */}
                    <div className="hero-cta-centered">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        id="btnHeroReport"
                        className="btn-apple btn-emerald btn-lg"
                        onClick={handleTriggerReport}
                      >
                        <i className="ri-add-circle-fill" style={{ fontSize: "1.2rem" }}></i>
                        <span>Laporkan Barang Sekarang</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Clean Search Bar (Keyword + Campus Location only, no duplicate category dropdown) */}
                  <form
                    className="apple-search-bar"
                    onSubmit={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <div className="search-slot">
                      <i className="ri-search-2-line"></i>
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Ketik nama barang (cth: KTM, AirPods, Kunci Vario, Dompet...)"
                      />
                      {keyword && (
                        <button
                          type="button"
                          onClick={() => setKeyword("")}
                          style={{ color: "var(--ink-400)", fontSize: "1rem" }}
                          aria-label="Bersihkan kata kunci"
                        >
                          <i className="ri-close-circle-fill"></i>
                        </button>
                      )}
                    </div>

                    <div className="search-slot">
                      <i className="ri-map-pin-2-line"></i>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      >
                        <option value="">Semua Titik Lokasi</option>
                        <option value="Perpustakaan">Perpustakaan Pusat</option>
                        <option value="Kantin">Kantin Utama</option>
                        <option value="Parkir">Parkiran &amp; Gedung Teknik</option>
                        <option value="Gedung Kuliah Bersama">Gedung Kuliah Bersama (GKB)</option>
                        <option value="Laboratorium">Laboratorium Komputer</option>
                        <option value="Musholla">Musholla &amp; Rektorat</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-apple btn-ink">
                      <i className="ri-Sparkling-2-line"></i> Cari
                    </button>
                  </form>
                </div>

                {/* Right Bento: Interactive Inspection Checklist (Simulasi Cek Fisik & Verifikasi) */}
                <div className="bento-radar-card">
                  <div>
                    <div className="radar-header">
                      <div className="radar-title-group">
                        <h3>Simulasi Cek Fisik Barang</h3>
                        <p>Panduan verifikasi sebelum serah terima di kampus</p>
                      </div>
                      <span
                        className="radar-badge"
                        style={{
                          background:
                            readinessScore === 100
                              ? "rgba(16, 185, 129, 0.25)"
                              : "rgba(255, 255, 255, 0.1)",
                          color: readinessScore === 100 ? "#6ee7b7" : "#e2e8f0"
                        }}
                      >
                        <i className="ri-shield-check-fill"></i> {readinessScore}% Terverifikasi
                      </span>
                    </div>

                    {/* Category Preset Switcher */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.4rem",
                        background: "rgba(255, 255, 255, 0.06)",
                        padding: "0.28rem",
                        borderRadius: "var(--radius-pill)",
                        marginBottom: "0.95rem"
                      }}
                    >
                      {Object.entries(inspectionProtocols).map(([key, cfg]) => {
                        const active = inspectionPreset === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setInspectionPreset(key);
                              setCheckedSteps([true, false, false]);
                            }}
                            style={{
                              padding: "0.4rem 0.5rem",
                              borderRadius: "var(--radius-pill)",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              color: active ? "#141413" : "rgba(255,255,255,0.7)",
                              background: active ? "#ffffff" : "transparent",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.3rem",
                              transition: "all 0.18s ease"
                            }}
                          >
                            <i className={cfg.icon}></i>
                            <span>{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Interactive Checkable Steps */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                      {inspectionProtocols[inspectionPreset].steps.map((step, idx) => {
                        const isChecked = checkedSteps[idx];
                        return (
                          <motion.button
                            key={`${inspectionPreset}-${idx}`}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => toggleInspectionStep(idx)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              background: isChecked
                                ? "rgba(13, 148, 136, 0.22)"
                                : "rgba(255, 255, 255, 0.05)",
                              border: isChecked
                                ? "1px solid rgba(94, 234, 212, 0.45)"
                                : "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "var(--radius-md)",
                              padding: "0.68rem 0.85rem",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.65rem",
                              color: "#fff",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "7px",
                                background: isChecked
                                  ? "var(--brand-emerald)"
                                  : "rgba(255, 255, 255, 0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: "0.1rem",
                                fontSize: "0.85rem"
                              }}
                            >
                              {isChecked ? (
                                <i className="ri-check-line"></i>
                              ) : (
                                <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{idx + 1}</span>
                              )}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "0.82rem",
                                  fontWeight: 700,
                                  textDecoration: isChecked ? "none" : "none",
                                  color: isChecked ? "#5eead4" : "#ffffff"
                                }}
                              >
                                {step.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.73rem",
                                  color: "rgba(255, 255, 255, 0.62)",
                                  lineHeight: 1.35
                                }}
                              >
                                {step.desc}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Verification Progress Bar Footer */}
                  <div
                    style={{
                      marginTop: "0.95rem",
                      paddingTop: "0.8rem",
                      borderTop: "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    <div
                      style={{
                        height: 6,
                        width: "100%",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 99,
                        overflow: "hidden",
                        marginBottom: "0.5rem"
                      }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ width: `${readinessScore}%` }}
                        transition={APPLE_SPRING}
                        style={{
                          height: "100%",
                          background:
                            readinessScore === 100
                              ? "linear-gradient(90deg, #10b981, #34d399)"
                              : "var(--brand-emerald)"
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.7)"
                      }}
                    >
                      <span>
                        {readinessScore === 100
                          ? "✅ Seluruh syarat aman terpenuhi — Siap Serah Terima!"
                          : "Centang poin di atas saat memverifikasi barang di lokasi"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCheckedSteps(
                            readinessScore === 100 ? [false, false, false] : [true, true, true]
                          )
                        }
                        style={{ color: "#5eead4", fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        {readinessScore === 100 ? "Ulangi" : "Centang Semua"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* URGENT BOARDING PASS STRIP */}
              {urgentSpotlightItem && !hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="urgent-pass-strip"
                >
                  <div className="urgent-pass-left">
                    <span className="pass-tag">
                      <i className="ri-alarm-warning-fill"></i> Prioritas Pencarian
                    </span>
                    <span className="urgent-pass-title">{urgentSpotlightItem.title}</span>
                    <span className="urgent-pass-loc">
                      <i className="ri-map-pin-line"></i> {urgentSpotlightItem.location}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-apple btn-glass btn-sm"
                    onClick={() => handleOpenDetail(urgentSpotlightItem)}
                  >
                    Periksa Laporan <i className="ri-arrow-right-up-line"></i>
                  </button>
                </motion.div>
              )}

              {/* APPLE SEGMENTED TABS & SORT */}
              <div className="SegmentedControlBar">
                <LayoutGroup id="segmented-filter-tabs">
                  <div className="segmented-tabs">
                    {[
                      { id: "all", label: "Semua Laporan", count: counts.all, icon: "ri-Stack-line" },
                      {
                        id: "lost",
                        label: "Kehilangan",
                        count: counts.lost,
                        icon: "ri-error-warning-line"
                      },
                      {
                        id: "found",
                        label: "Ditemukan",
                        count: counts.found,
                        icon: "ri-checkbox-circle-line"
                      },
                      {
                        id: "resolved",
                        label: "Selesai",
                        count: counts.resolved,
                        icon: "ri-check-double-line"
                      }
                    ].map((tab) => {
                      const active = typeFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          className={`seg-btn ${active ? "active" : ""}`}
                          onClick={() => setTypeFilter(tab.id)}
                        >
                          {active && (
                            <motion.span
                              layoutId="segFilterPill"
                              className="seg-pill-bg"
                              transition={APPLE_SPRING}
                            />
                          )}
                          <i className={tab.icon}></i>
                          <span>{tab.label}</span>
                          <span className="seg-count">{tab.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>

                <div className="filter-right-controls">
                  <select
                    className="apple-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Urutan: Terbaru</option>
                    <option value="oldest">Urutan: Terlama</option>
                    <option value="views">Paling Banyak Dilihat</option>
                  </select>
                </div>
              </div>

              {/* HORIZONTAL CATEGORY CHIPS (Single Source of Truth for Categories) */}
              <div className="category-pills-scroll">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    key={cat.id || "all"}
                    type="button"
                    className={`cat-pill ${categoryFilter === cat.id ? "active" : ""}`}
                    onClick={() => setCategoryFilter(cat.id)}
                  >
                    <i className={cat.icon}></i>
                    <span>{cat.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* FEED STATUS BAR */}
              <div className="feed-status-row">
                <div>
                  Menampilkan <strong>{filteredItems.length}</strong> laporan barang di kampus
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn-apple btn-glass btn-sm"
                    onClick={resetFilters}
                  >
                    <i className="ri-refresh-line"></i> Reset Semua Filter
                  </button>
                )}
              </div>

              {/* ASYMMETRIC BENTO / EDITORIAL FEED GRID */}
              {filteredItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="safety-bento-section"
                  style={{ textAlign: "center", padding: "3.5rem 1.5rem" }}
                >
                  <i
                    className="ri-inbox-2-line"
                    style={{ fontSize: "2.8rem", color: "var(--ink-400)" }}
                  ></i>
                  <h3 style={{ marginTop: "0.75rem", fontSize: "1.2rem", fontWeight: 800 }}>
                    Tidak Ada Laporan yang Cocok
                  </h3>
                  <p style={{ color: "var(--ink-600)", margin: "0.4rem auto 1.2rem", maxWidth: 420 }}>
                    Coba gunakan kata kunci pencarian lain atau reset filter lokasi dan kategori.
                  </p>
                  <button type="button" className="btn-apple btn-ink" onClick={resetFilters}>
                    Reset Filter Pencarian
                  </button>
                </motion.div>
              ) : (
                <motion.div layout className="organic-feed-grid">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, index) => {
                      const isResolved = item.status === "resolved";
                      const isFeatured = index === 0 && filteredItems.length >= 3 && !hasActiveFilters;

                      return (
                        <motion.article
                          layout
                          key={item.id}
                          initial={{ opacity: 0, y: 20, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.94 }}
                          transition={{
                            ...SOFT_SPRING,
                            delay: Math.min(index * 0.04, 0.2)
                          }}
                          className={`organic-card ${isFeatured ? "card-featured" : ""}`}
                          onClick={() => handleOpenDetail(item)}
                        >
                          <div className="card-media">
                            <img src={item.image} alt={item.title} loading="lazy" />
                            {isResolved ? (
                              <span className="floating-status-tag tag-resolved">
                                <i className="ri-checkbox-circle-fill"></i> Selesai
                              </span>
                            ) : item.type === "lost" ? (
                              <span className="floating-status-tag tag-lost">
                                <i className="ri-error-warning-fill"></i> Kehilangan
                              </span>
                            ) : (
                              <span className="floating-status-tag tag-found">
                                <i className="ri-hand-heart-fill"></i> Ditemukan
                              </span>
                            )}

                            {item.reward && item.type === "lost" && !isResolved && (
                              <span className="floating-reward-pill">
                                <i className="ri-gift-2-fill"></i> Ada Apresiasi
                              </span>
                            )}
                          </div>

                          <div className="card-content">
                            <div>
                              <div className="card-meta-top">
                                <span className="card-cat-chip">
                                  <i className="ri-price-tag-3-line"></i> {item.category}
                                </span>
                                <span>
                                  <i className="ri-calendar-event-line"></i>{" "}
                                  {formatIncidentDate(item.date)}
                                </span>
                              </div>

                              <h3 className="card-title">{item.title}</h3>
                              <p className="card-desc">{item.description}</p>

                              <div className="card-location-box">
                                <div className="card-location-line">
                                  <i className="ri-map-pin-2-fill"></i>
                                  <span>{item.location}</span>
                                </div>
                                {item.time && (
                                  <div className="card-location-line">
                                    <i className="ri-time-line"></i>
                                    <span>Sekitar pukul {item.time} WIB</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ticket-footer">
                              <div className="reporter-pill">
                                <span className="reporter-dot">
                                  {(item.reporterName || "M")[0]}
                                </span>
                                <span>
                                  {item.reporterName ? item.reporterName.split(" ")[0] : "Mahasiswa"} •{" "}
                                  {item.reporterFaculty || "Kampus"}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: 800,
                                  color: "var(--brand-emerald)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.2rem"
                                }}
                              >
                                Detail <i className="ri-arrow-right-up-line"></i>
                              </span>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ==================== VIEW 2: DASHBOARD LAPORAN SAYA ==================== */}
          {activeView === "my-reports" && (
            <motion.div
              key="view-my-reports"
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={APPLE_SPRING}
            >
              <div
                className="bento-hero-card"
                style={{
                  marginBottom: "1.5rem",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem"
                }}
              >
                <div>
                  <div className="live-status-pill">
                    <i className="ri-dashboard-line"></i> Ruang Kelola Pelapor
                  </div>
                  <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
                    Dashboard Laporan Saya
                  </h2>
                  <p style={{ color: "var(--ink-600)", fontSize: "0.9rem" }}>
                    Pantau status laporan, periksa bukti klaim yang masuk, dan tandai kasus selesai.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button
                    type="button"
                    className="btn-apple btn-glass"
                    onClick={() => setActiveView("explore")}
                  >
                    <i className="ri-arrow-left-line"></i> Kembali ke Radar
                  </button>
                  <button
                    type="button"
                    className="btn-apple btn-emerald"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <i className="ri-add-line"></i> Buat Laporan Baru
                  </button>
                </div>
              </div>

              {myItems.length === 0 ? (
                <div
                  className="safety-bento-section"
                  style={{ textAlign: "center", padding: "3.5rem 1.5rem" }}
                >
                  <i
                    className="ri-folder-add-line"
                    style={{ fontSize: "2.8rem", color: "var(--ink-400)" }}
                  ></i>
                  <h3 style={{ marginTop: "0.75rem", fontSize: "1.2rem", fontWeight: 800 }}>
                    Belum Ada Laporan yang Anda Buat
                  </h3>
                  <p style={{ color: "var(--ink-600)", margin: "0.4rem auto 1.2rem", maxWidth: 420 }}>
                    Semua laporan kehilangan maupun barang temuan yang Anda terbitkan akan muncul di
                    halaman ini.
                  </p>
                  <button
                    type="button"
                    className="btn-apple btn-emerald"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <i className="ri-add-circle-line"></i> Buat Laporan Pertama
                  </button>
                </div>
              ) : (
                <div className="organic-feed-grid">
                  {myItems.map((item) => {
                    const isResolved = item.status === "resolved";
                    return (
                      <motion.div
                        layout
                        key={item.id}
                        className="organic-card"
                      >
                        <div className="card-media" onClick={() => handleOpenDetail(item)}>
                          <img src={item.image} alt={item.title} />
                          <span
                            className={`floating-status-tag ${
                              isResolved
                                ? "tag-resolved"
                                : item.type === "lost"
                                ? "tag-lost"
                                : "tag-found"
                            }`}
                          >
                            {isResolved
                              ? "Selesai"
                              : item.type === "lost"
                              ? "Kehilangan"
                              : "Ditemukan"}
                          </span>
                        </div>
                        <div className="card-content">
                          <div>
                            <div className="card-meta-top">
                              <span className="card-cat-chip">{item.category}</span>
                              <span>{formatIncidentDate(item.date)}</span>
                            </div>
                            <h3 className="card-title">{item.title}</h3>
                            <p className="card-desc">{item.location}</p>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "0.45rem",
                              flexWrap: "wrap",
                              paddingTop: "0.75rem",
                              borderTop: "1px dashed var(--ink-200)"
                            }}
                          >
                            <button
                              type="button"
                              className="btn-apple btn-glass btn-sm"
                              style={{ flex: 1 }}
                              onClick={() => handleToggleResolved(item.id)}
                            >
                              <i className="ri-check-line"></i>{" "}
                              {isResolved ? "Buka Lagi" : "Tandai Selesai"}
                            </button>

                            {item.claims && item.claims.length > 0 && (
                              <button
                                type="button"
                                className="btn-apple btn-emerald btn-sm"
                                onClick={() => setClaimsReviewItem(item)}
                              >
                                <i className="ri-shield-user-line"></i> Klaim ({item.claims.length})
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn-apple btn-coral-soft btn-sm"
                              onClick={() => handleDeleteItem(item.id)}
                              title="Hapus Laporan"
                            >
                              <i className="ri-delete-bin-6-line"></i>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ==================== VIEW 3: PANDUAN AMAN SERAH TERIMA ==================== */}
          {activeView === "guide" && (
            <motion.div
              key="view-guide"
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={APPLE_SPRING}
            >
              <section className="safety-bento-section">
                <div className="live-status-pill">
                  <i className="ri-shield-star-line"></i> Protokol Keamanan Kampus
                </div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                  Panduan Aman Verifikasi &amp; Serah Terima
                </h2>
                <p style={{ color: "var(--ink-600)", maxWidth: 640 }}>
                  Ikuti 4 langkah standar berikut agar barang kembali ke tangan pemilik sah tanpa
                  risiko penyalahgunaan klaim.
                </p>

                <div className="safety-cards-row">
                  <div className="safety-mini-card">
                    <div className="safety-mini-icon">
                      <i className="ri-eye-off-line"></i>
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                      1. Ciri Unik Dirahasiakan
                    </h3>
                    <p style={{ fontSize: "0.84rem", color: "var(--ink-600)" }}>
                      Untuk barang temuan, sistem otomatis menyembunyikan ciri khusus dari publik
                      agar hanya pemilik asli yang bisa menyebutkannya saat mengajukan klaim.
                    </p>
                  </div>

                  <div className="safety-mini-card">
                    <div className="safety-mini-icon">
                      <i className="ri-fingerprint-line"></i>
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                      2. Ajukan Klaim Terstruktur
                    </h3>
                    <p style={{ fontSize: "0.84rem", color: "var(--ink-600)" }}>
                      Gunakan tombol <strong>Ajukan Klaim</strong> terlebih dahulu dengan mencantumkan
                      NIM dan bukti ciri rahasia sebelum berlanjut ke WhatsApp.
                    </p>
                  </div>

                  <div className="safety-mini-card">
                    <div className="safety-mini-icon">
                      <i className="ri-building-2-line"></i>
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                      3. Serah Terima di Area Publik
                    </h3>
                    <p style={{ fontSize: "0.84rem", color: "var(--ink-600)" }}>
                      Lakukan pertemuan di lokasi ramai seperti Lobi Rektorat, Meja Sirkulasi
                      Perpustakaan, atau Pos Keamanan Kampus pada jam kuliah.
                    </p>
                  </div>

                  <div className="safety-mini-card">
                    <div className="safety-mini-icon">
                      <i className="ri-shield-check-line"></i>
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                      4. Titipkan ke Petugas Resmi
                    </h3>
                    <p style={{ fontSize: "0.84rem", color: "var(--ink-600)" }}>
                      Jika dalam 2x24 jam barang berharga belum diklaim, serahkan ke Pos Satpam
                      terdekat dan perbarui lokasi pengamanan di laporan.
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ==================== CLEAN MINIMAL FOOTER (NO DUPLICATE NAV LINKS) ==================== */}
      <footer className="apple-footer">
        <div className="container-shell footer-flex">
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div className="brand-orb" style={{ width: 30, height: 30, fontSize: "0.95rem" }}>
              <i className="ri-compass-discover-line"></i>
            </div>
            <span>
              <strong>Findit.</strong> &mdash; Pusat Laporan Kehilangan &amp; Temuan Kampus Terpadu
            </span>
          </div>
          <div>
            Dibangun dengan React &amp; Framer Motion &bull; Penyimpanan Terintegrasi LocalStorage
          </div>
        </div>
      </footer>

      {/* ==================== APPLE SLIDE-OVER SHEET: DETAIL BARANG ==================== */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="apple-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.aside
              className="apple-drawer-sheet"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={APPLE_SPRING}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Clean Header without overlapping status badge */}
              <div className="sheet-header">
                <div className="sheet-header-title">
                  <i className="ri-compass-3-line" style={{ color: "var(--brand-emerald)" }}></i>
                  <span>{selectedItem.category}</span>
                </div>
                <button
                  type="button"
                  className="btn-circle-close"
                  onClick={() => setSelectedItem(null)}
                  aria-label="Tutup"
                >
                  &times;
                </button>
              </div>

              <div className="sheet-body">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="detail-hero-img"
                />

                {/* Status Badge Inside Body (Never overlaps modal header) */}
                <div style={{ marginBottom: "0.65rem" }}>
                  <span
                    className={`floating-status-tag ${
                      selectedItem.status === "resolved"
                        ? "tag-resolved"
                        : selectedItem.type === "lost"
                        ? "tag-lost"
                        : "tag-found"
                    }`}
                    style={{ position: "static" }}
                  >
                    {selectedItem.status === "resolved"
                      ? "Kasus Selesai / Sudah Kembali"
                      : selectedItem.type === "lost"
                      ? "Laporan Kehilangan"
                      : "Barang Ditemukan"}
                  </span>
                </div>

                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1.25 }}>
                  {selectedItem.title}
                </h2>

                {selectedItem.reward &&
                  selectedItem.type === "lost" &&
                  selectedItem.status !== "resolved" && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        background: "var(--amber-soft)",
                        color: "#92400e",
                        padding: "0.6rem 0.9rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem"
                      }}
                    >
                      <i className="ri-gift-2-fill"></i>
                      <span>{selectedItem.reward}</span>
                    </div>
                  )}

                <p
                  style={{
                    marginTop: "0.85rem",
                    color: "var(--ink-600)",
                    fontSize: "0.92rem",
                    lineHeight: 1.6
                  }}
                >
                  {selectedItem.description}
                </p>

                {/* Metadata Bento Grid */}
                <div className="spec-grid">
                  <div className="spec-cell">
                    <div className="spec-label">Status Saat Ini</div>
                    <div className="spec-val" style={{ color: "var(--brand-emerald)" }}>
                      {selectedItem.status === "resolved"
                        ? "Kasus Selesai (Barang sudah diserahkan)"
                        : selectedItem.type === "found"
                        ? "Menunggu Pemilik"
                        : "Masih Dicari"}
                    </div>
                  </div>

                  <div className="spec-cell">
                    <div className="spec-label">Tanggal &amp; Jam Kejadian</div>
                    <div className="spec-val">
                      {formatIncidentDate(selectedItem.date)}
                      {selectedItem.time ? ` • ${selectedItem.time}` : ""}
                    </div>
                  </div>

                  <div className="spec-cell full">
                    <div className="spec-label">Lokasi Terkait di Kampus</div>
                    <div className="spec-val">{selectedItem.location}</div>
                  </div>

                  {/* Privasi Ciri-Ciri Unik: Hanya tampil untuk barang HILANG atau jika sudah selesai */}
                  {selectedItem.type === "lost" || selectedItem.status === "resolved" ? (
                    <div className="spec-cell full">
                      <div className="spec-label">Ciri-Ciri Unik / Identifikasi</div>
                      <div className="spec-val">
                        {selectedItem.specificFeatures || "Tidak ada ciri khusus dicantumkan"}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="spec-cell full"
                      style={{
                        background: "#f0fdf4",
                        borderColor: "#bbf7d0"
                      }}
                    >
                      <div className="spec-label" style={{ color: "#047857" }}>
                        <i className="ri-lock-password-line"></i> Proteksi Verifikasi Kepemilikan
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#065f46", fontWeight: 600 }}>
                        Ciri-ciri unik barang temuan ini disembunyikan dari publik. Pemilik sah
                        wajib menyebutkan ciri spesifik barang saat mengajukan klaim di bawah.
                      </div>
                    </div>
                  )}
                </div>

                {/* Reporter Card */}
                <div
                  style={{
                    background: "var(--bg-canvas)",
                    padding: "0.9rem 1rem",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.25rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      className="reporter-dot"
                      style={{ width: 38, height: 38, fontSize: "0.95rem" }}
                    >
                      {(selectedItem.reporterName || "M")[0]}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "var(--ink-400)",
                          textTransform: "uppercase"
                        }}
                      >
                        Dilaporkan Oleh
                      </div>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        {selectedItem.reporterName}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-600)" }}>
                        {selectedItem.reporterFaculty}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: 1. Klaim (Primary), 2. WhatsApp (Secondary Outline) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {selectedItem.status !== "resolved" && (
                    <button
                      type="button"
                      className="btn-apple btn-emerald btn-lg"
                      style={{ width: "100%" }}
                      onClick={() => {
                        if (!currentUser) {
                          setSelectedItem(null);
                          setAuthModalMode("login");
                          pushToast(
                            "Masuk untuk Klaim",
                            "Silakan masuk terlebih dahulu untuk mengajukan klaim kepemilikan.",
                            "info"
                          );
                          return;
                        }
                        setClaimTargetItem(selectedItem);
                        setSelectedItem(null);
                      }}
                    >
                      <i className="ri-shield-user-line"></i>
                      <span>
                        {selectedItem.type === "found"
                          ? "Ini Barang Saya (Ajukan Klaim)"
                          : "Saya Menemukan Barang Ini"}
                      </span>
                    </button>
                  )}

                  <a
                    href={createWhatsAppLink(
                      selectedItem.reporterPhone,
                      selectedItem.title,
                      selectedItem.type
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-apple btn-wa-outline"
                    style={{ width: "100%", textDecoration: "none" }}
                  >
                    <i className="ri-whatsapp-line" style={{ fontSize: "1.1rem" }}></i>
                    <span>Hubungi Pelapor via WhatsApp ({selectedItem.reporterPhone})</span>
                  </a>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== APPLE SPRING MODAL: AUTH (LOGIN / REGISTER) ==================== */}
      <AnimatePresence>
        {authModalMode && (
          <AuthModal
            mode={authModalMode}
            setMode={setAuthModalMode}
            pendingReport={pendingReportAfterLogin}
            onClose={() => {
              setAuthModalMode(null);
              setPendingReportAfterLogin(false);
            }}
            onSuccess={(user, msg) => {
              setCurrentUser(user);
              setAuthModalMode(null);
              pushToast("Autentikasi Berhasil", msg, "success");
              if (pendingReportAfterLogin) {
                setPendingReportAfterLogin(false);
                setTimeout(() => setIsReportModalOpen(true), 220);
              }
            }}
            pushToast={pushToast}
          />
        )}
      </AnimatePresence>

      {/* ==================== APPLE SPRING MODAL: CREATE REPORT ==================== */}
      <AnimatePresence>
        {isReportModalOpen && currentUser && (
          <ReportModal
            currentUser={currentUser}
            onClose={() => setIsReportModalOpen(false)}
            onSubmit={(newItem) => {
              const updated = [newItem, ...items];
              syncItems(updated);
              setIsReportModalOpen(false);
              pushToast(
                "Laporan Diterbitkan",
                `Laporan "${newItem.title}" kini aktif di radar kampus.`,
                "success"
              );
            }}
            pushToast={pushToast}
          />
        )}
      </AnimatePresence>

      {/* ==================== APPLE SPRING MODAL: CLAIM VERIFICATION ==================== */}
      <AnimatePresence>
        {claimTargetItem && currentUser && (
          <ClaimModal
            item={claimTargetItem}
            currentUser={currentUser}
            onClose={() => setClaimTargetItem(null)}
            onSubmit={(claimData) => {
              const updated = items.map((it) => {
                if (it.id !== claimTargetItem.id) return it;
                return {
                  ...it,
                  claims: [...(it.claims || []), claimData]
                };
              });
              syncItems(updated);
              setClaimTargetItem(null);
              pushToast(
                "Klaim Terkirim",
                "Bukti verifikasi kepemilikan Anda telah dikirim ke pelapor.",
                "success"
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* ==================== APPLE SPRING MODAL: INCOMING CLAIMS REVIEW ==================== */}
      <AnimatePresence>
        {claimsReviewItem && (
          <ClaimsReviewModal
            item={claimsReviewItem}
            onClose={() => setClaimsReviewItem(null)}
            onApprove={(itemId) => {
              handleToggleResolved(itemId);
              setClaimsReviewItem(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ==================== APPLE SPRING MODAL: PROFILE ==================== */}
      <AnimatePresence>
        {isProfileModalOpen && currentUser && (
          <ProfileModal
            currentUser={currentUser}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdated={(updatedUser, msg) => {
              setCurrentUser(updatedUser);
              setIsProfileModalOpen(false);
              pushToast("Profil Disimpan", msg, "success");
            }}
          />
        )}
      </AnimatePresence>

      {/* ==================== FLOATING APPLE TOAST NOTIFICATIONS ==================== */}
      <div className="apple-toast-stack">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={APPLE_SPRING}
              className="apple-toast"
            >
              <i
                className={
                  t.tone === "success"
                    ? "ri-checkbox-circle-fill"
                    : t.tone === "danger"
                    ? "ri-error-warning-fill"
                    : "ri-information-fill"
                }
                style={{
                  fontSize: "1.25rem",
                  color:
                    t.tone === "success"
                      ? "#34d399"
                      : t.tone === "danger"
                      ? "#fb7185"
                      : "#5eead4"
                }}
              ></i>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>{t.title}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.78)" }}>
                  {t.message}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ==========================================================================
   SUB-KOMPONEN MODAL DENGAN ANIMASI SPRING APPLE
   ========================================================================== */

function AuthModal({ mode, setMode, pendingReport, onClose, onSuccess, pushToast }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [regName, setRegName] = useState("");
  const [regNim, setRegNim] = useState("");
  const [regFaculty, setRegFaculty] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const res = AuthService.login(identifier, password);
    if (res.success) {
      onSuccess(res.user, res.message);
    } else {
      pushToast("Gagal Masuk", res.message, "danger");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const res = AuthService.register({
      name: regName,
      nim: regNim,
      faculty: regFaculty,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });
    if (res.success) {
      onSuccess(res.user, res.message);
    } else {
      pushToast("Gagal Mendaftar", res.message, "danger");
    }
  };

  return (
    <motion.div
      className="apple-center-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="apple-modal-window"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={APPLE_SPRING}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <div className="sheet-header-title">
            <i className="ri-shield-keyhole-line" style={{ color: "var(--brand-emerald)" }}></i>
            <span>{mode === "login" ? "Masuk ke Akun Kampus" : "Pendaftaran Mahasiswa"}</span>
          </div>
          <button type="button" className="btn-circle-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="sheet-body">
          {pendingReport && (
            <div
              style={{
                background: "var(--brand-emerald-soft)",
                color: "var(--brand-forest)",
                padding: "0.7rem 0.95rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.82rem",
                fontWeight: 700,
                marginBottom: "1rem"
              }}
            >
              <i className="ri-information-line"></i> Masuk dulu yuk buat lapor barang &mdash; form
              laporan akan langsung terbuka otomatis setelah ini.
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "var(--bg-canvas)",
              padding: "0.28rem",
              borderRadius: "var(--radius-pill)",
              marginBottom: "1.25rem"
            }}
          >
            <button
              type="button"
              className="btn-apple btn-sm"
              style={{
                background: mode === "login" ? "#fff" : "transparent",
                boxShadow: mode === "login" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
              }}
              onClick={() => setMode("login")}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              className="btn-apple btn-sm"
              style={{
                background: mode === "register" ? "#fff" : "transparent",
                boxShadow: mode === "register" ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
              }}
              onClick={() => setMode("register")}
            >
              Daftar Baru
            </button>
          </div>

          {mode === "login" ? (
            <form className="form-stack" onSubmit={handleLogin}>
              <div>
                <label className="field-label">Email Kampus atau NIM</label>
                <input
                  type="text"
                  className="apple-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="cth: ahmad.rizky@mahasiswa.ac.id atau 2108561001"
                  required
                />
              </div>

              <div>
                <label className="field-label">Kata Sandi</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    className="apple-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: "0.85rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--ink-400)"
                    }}
                  >
                    <i className={showPass ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-apple btn-emerald btn-lg">
                <i className="ri-login-circle-line"></i> Masuk Sekarang
              </button>

              {/* Demo Accounts */}
              <div
                style={{
                  background: "var(--bg-canvas)",
                  padding: "0.9rem",
                  borderRadius: "var(--radius-md)",
                  marginTop: "0.4rem"
                }}
              >
                <div style={{ fontSize: "0.76rem", fontWeight: 800, marginBottom: "0.45rem" }}>
                  <i className="ri-sparkling-line" style={{ color: "var(--brand-emerald)" }}></i>{" "}
                  Akun Demo Klik Cepat:
                </div>
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  {[
                    { label: "Ahmad (Fasilkom)", email: "ahmad.rizky@mahasiswa.ac.id" },
                    { label: "Nabila (FEB)", email: "nabila.putri@mahasiswa.ac.id" },
                    { label: "Fajar (Teknik)", email: "fajar.satria@mahasiswa.ac.id" }
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      className="btn-apple btn-glass btn-sm"
                      onClick={() => {
                        setIdentifier(acc.email);
                        setPassword("password123");
                      }}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form className="form-stack" onSubmit={handleRegister}>
              <div>
                <label className="field-label">Nama Lengkap Mahasiswa</label>
                <input
                  type="text"
                  className="apple-input"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="cth: Muhammad Budi Santoso"
                  required
                />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="field-label">NIM</label>
                  <input
                    type="text"
                    className="apple-input"
                    value={regNim}
                    onChange={(e) => setRegNim(e.target.value)}
                    placeholder="2108561088"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Fakultas</label>
                  <input
                    type="text"
                    className="apple-input"
                    value={regFaculty}
                    onChange={(e) => setRegFaculty(e.target.value)}
                    placeholder="Fasilkom / Teknik"
                    required
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="field-label">Email Kampus</label>
                  <input
                    type="email"
                    className="apple-input"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@mahasiswa.ac.id"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">No. WhatsApp</label>
                  <input
                    type="tel"
                    className="apple-input"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="08123456789"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Kata Sandi (Min. 6 karakter)</label>
                <input
                  type="password"
                  className="apple-input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn-apple btn-emerald btn-lg">
                <i className="ri-user-add-line"></i> Buat Akun Mahasiswa
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReportModal({ currentUser, onClose, onSubmit, pushToast }) {
  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Dokumen & Kartu");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [specificFeatures, setSpecificFeatures] = useState("");
  const [reward, setReward] = useState("");
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [imageBase64, setImageBase64] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      pushToast("File Terlalu Besar", "Ukuran foto maksimal 3MB.", "danger");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fallbackImages = {
      "Elektronik": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
      "Dokumen & Kartu": "assets/images/KTM.JPG",
      "Kunci & Aksesoris": "assets/images/kunci motor.jpg",
      "Tas & Dompet": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
      "Barang Pribadi": "assets/images/tumbler.jpg",
      "Pakaian": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80",
      "Lainnya": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&q=80"
    };

    const newItem = {
      id: "item-" + Date.now(),
      type,
      title: title.trim(),
      category,
      location: location.trim(),
      date,
      time,
      description: description.trim(),
      specificFeatures: specificFeatures.trim(),
      reward: type === "lost" ? reward.trim() : "",
      image: imageBase64 || fallbackImages[category] || fallbackImages["Lainnya"],
      status: "active",
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterFaculty: currentUser.faculty || "Mahasiswa",
      reporterPhone: phone.trim() || currentUser.phone,
      createdAt: new Date().toISOString(),
      views: 1,
      claims: []
    };

    onSubmit(newItem);
  };

  return (
    <motion.div
      className="apple-center-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="apple-modal-window"
        style={{ maxWidth: 640 }}
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={APPLE_SPRING}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <div className="sheet-header-title">
            <i className="ri-add-circle-line" style={{ color: "var(--brand-emerald)" }}></i>
            <span>Terbitkan Laporan Barang Kampus</span>
          </div>
          <button type="button" className="btn-circle-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="sheet-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="type-switch-grid">
              <button
                type="button"
                className={`type-switch-card ${type === "lost" ? "active-lost" : ""}`}
                onClick={() => setType("lost")}
              >
                <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>
                  <i className="ri-error-warning-fill"></i> Saya Kehilangan Barang
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--ink-600)" }}>
                  Barang milik saya tertinggal / jatuh
                </div>
              </button>

              <button
                type="button"
                className={`type-switch-card ${type === "found" ? "active-found" : ""}`}
                onClick={() => setType("found")}
              >
                <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>
                  <i className="ri-hand-heart-fill"></i> Saya Menemukan Barang
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--ink-600)" }}>
                  Mengamankan barang milik orang lain
                </div>
              </button>
            </div>

            <div>
              <label className="field-label">Nama / Judul Barang *</label>
              <input
                type="text"
                className="apple-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: KTM, Kunci Motor Vario, Tumbler Corkcicle..."
                required
              />
            </div>

            <div className="form-grid-2">
              <div>
                <label className="field-label">Kategori *</label>
                <select
                  className="apple-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.filter((c) => c.id !== "").map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Lokasi Kejadian / Ditemukan *</label>
                <input
                  type="text"
                  className="apple-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="cth: Perpustakaan Pusat Lt. 2"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label className="field-label">Tanggal Kejadian *</label>
                <input
                  type="date"
                  className="apple-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="field-label">Perkiraan Waktu</label>
                <input
                  type="time"
                  className="apple-input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="field-label">Kronologi / Deskripsi Singkat *</label>
              <textarea
                rows={2}
                className="apple-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan lokasi detail atau tempat barang diamankan..."
                required
              />
            </div>

            <div>
              <label className="field-label">
                Ciri-Ciri Unik (Dirahasiakan otomatis jika Barang Temuan) *
              </label>
              <textarea
                rows={2}
                className="apple-input"
                value={specificFeatures}
                onChange={(e) => setSpecificFeatures(e.target.value)}
                placeholder="cth: Goresan tipis di pojok kanan, stiker khusus, gantungan kunci..."
                required
              />
            </div>

            {type === "lost" && (
              <div>
                <label className="field-label">Apresiasi / Imbalan (Opsional)</label>
                <input
                  type="text"
                  className="apple-input"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="cth: Traktiran kopi / Imbalan sukarela"
                />
              </div>
            )}

            <div className="form-grid-2">
              <div>
                <label className="field-label">No. WhatsApp Aktif *</label>
                <input
                  type="tel"
                  className="apple-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="field-label">Unggah Foto Barang (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="apple-input"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
              <button type="button" className="btn-apple btn-glass" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn-apple btn-emerald">
                <i className="ri-send-plane-fill"></i> Terbitkan Laporan
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ClaimModal({ item, currentUser, onClose, onSubmit }) {
  const [claimName, setClaimName] = useState(currentUser.name || "");
  const [claimNim, setClaimNim] = useState(currentUser.nim || "");
  const [claimPhone, setClaimPhone] = useState(currentUser.phone || "");
  const [proof, setProof] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      claimantId: currentUser.id,
      claimantName: claimName.trim(),
      claimantNim: claimNim.trim(),
      claimantPhone: claimPhone.trim(),
      proof: proof.trim(),
      claimedAt: new Date().toISOString()
    });
  };

  return (
    <motion.div
      className="apple-center-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="apple-modal-window"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={APPLE_SPRING}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <div className="sheet-header-title">
            <i className="ri-shield-check-line" style={{ color: "var(--brand-emerald)" }}></i>
            <span>Verifikasi Klaim: {item.title}</span>
          </div>
          <button type="button" className="btn-circle-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="sheet-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div>
                <label className="field-label">Nama Pengklaim *</label>
                <input
                  type="text"
                  className="apple-input"
                  value={claimName}
                  onChange={(e) => setClaimName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="field-label">NIM *</label>
                <input
                  type="text"
                  className="apple-input"
                  value={claimNim}
                  onChange={(e) => setClaimNim(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">No. WhatsApp *</label>
              <input
                type="tel"
                className="apple-input"
                value={claimPhone}
                onChange={(e) => setClaimPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label">Bukti / Ciri Rahasia Kepemilikan *</label>
              <textarea
                rows={3}
                className="apple-input"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="Sebutkan ciri spesifik yang tidak terlihat langsung di foto umum..."
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
              <button type="button" className="btn-apple btn-glass" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn-apple btn-emerald">
                <i className="ri-check-double-line"></i> Kirim Pengajuan Klaim
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ClaimsReviewModal({ item, onClose, onApprove }) {
  const claims = item.claims || [];
  return (
    <motion.div
      className="apple-center-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="apple-modal-window"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={APPLE_SPRING}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <div className="sheet-header-title">
            <i className="ri-user-search-line" style={{ color: "var(--brand-emerald)" }}></i>
            <span>Daftar Klaim Masuk ({claims.length})</span>
          </div>
          <button type="button" className="btn-circle-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="sheet-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              background: "var(--bg-canvas)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.82rem"
            }}
          >
            <strong>Ciri Asli Anda:</strong> {item.specificFeatures}
          </div>

          {claims.map((c, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "1rem"
              }}
            >
              <div style={{ fontWeight: 800 }}>
                {c.claimantName} <span style={{ color: "var(--ink-400)" }}>({c.claimantNim})</span>
              </div>
              <div
                style={{
                  margin: "0.5rem 0",
                  padding: "0.65rem",
                  background: "var(--bg-canvas)",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "0.86rem"
                }}
              >
                &ldquo;{c.proof}&rdquo;
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <a
                  href={createWhatsAppLink(c.claimantPhone, item.title, "verifikasi klaim")}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-apple btn-wa-outline btn-sm"
                  style={{ textDecoration: "none" }}
                >
                  <i className="ri-whatsapp-line"></i> Hubungi WA
                </a>
                <button
                  type="button"
                  className="btn-apple btn-emerald btn-sm"
                  onClick={() => onApprove(item.id)}
                >
                  Setujui &amp; Selesai
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfileModal({ currentUser, onClose, onUpdated }) {
  const [name, setName] = useState(currentUser.name || "");
  const [faculty, setFaculty] = useState(currentUser.faculty || "");
  const [phone, setPhone] = useState(currentUser.phone || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = AuthService.updateProfile({
      name: name.trim(),
      faculty: faculty.trim(),
      phone: phone.trim()
    });
    if (res.success) {
      onUpdated(res.user, res.message);
    }
  };

  return (
    <motion.div
      className="apple-center-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="apple-modal-window"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={APPLE_SPRING}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <div className="sheet-header-title">
            <i className="ri-user-settings-line" style={{ color: "var(--brand-emerald)" }}></i>
            <span>Profil Mahasiswa</span>
          </div>
          <button type="button" className="btn-circle-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="sheet-body">
          <form className="form-stack" onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Nama Lengkap</label>
              <input
                type="text"
                className="apple-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-grid-2">
              <div>
                <label className="field-label">NIM</label>
                <input
                  type="text"
                  className="apple-input"
                  value={currentUser.nim}
                  readOnly
                  style={{ opacity: 0.65 }}
                />
              </div>
              <div>
                <label className="field-label">Fakultas</label>
                <input
                  type="text"
                  className="apple-input"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="field-label">No. WhatsApp</label>
              <input
                type="tel"
                className="apple-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-apple btn-emerald btn-lg">
              Simpan Perubahan Profil
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

