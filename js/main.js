/**
 * Main Application Entry Point
 * Inicializa todos los módulos y características de la aplicación
 */

import { initAuthListener, isAdmin, logout } from "./firebase/auth.js";
import { initBooking } from "./booking.js";
import { initAdminPanel } from "./admin/panel.js";
import { showToast } from "./utils/helpers.js";

/**
 * Función de inicialización principal
 */
async function initApp() {
  console.log("🚀 Inicializando aplicación Ricky Barber...");

  try {
    // Inicializar listeners de autenticación
    initAuthListener({
      onAuthSuccess: (user, role) => {
        console.log("✓ Usuario autenticado:", user.email, "Rol:", role);

        if (role === "admin") {
          initAdminPanel();
          showToast("Bienvenido, admin", "success");
        }
      },
      onAuthLogout: () => {
        console.log("✓ Usuario desautenticado");
        hideAdminPanel();
      },
    });

    // Inicializar módulo de booking
    initBooking();

    // Inicializar UI
    setupUI();

    console.log("✓ Aplicación inicializada correctamente");
  } catch (error) {
    console.error("❌ Error inicializando aplicación:", error);
    showToast("Error inicializando aplicación", "error");
  }
}

/**
 * Configurar interfaz de usuario
 */
function setupUI() {
  // Cerrar modal de booking
  const modalClose = document.getElementById("modalClose");
  if (modalClose) {
    modalClose.addEventListener("click", closeBookingModal);
  }

  // Cerrar modal con overlay click
  const modalOverlay = document.getElementById("modalOverlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeBookingModal();
      }
    });
  }

  // Scroll reveal
  setupScrollReveal();

  // Menu hamburguesa
  setupMobileMenu();

  // Agregar estilos CSS dinamicamente
  loadCSS();
}

/**
 * Cargar hojas de estilo
 */
function loadCSS() {
  const stylesheets = ["css/toast.css", "css/admin.css"];

  stylesheets.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Setup scroll reveal
 */
function setupScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  reveals.forEach((el) => observer.observe(el));
}

/**
 * Setup menu móvil
 */
function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const navOverlay = document.getElementById("navOverlay");

  if (!menuToggle || !navLinks) return;

  function toggleMenu() {
    menuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
    navOverlay?.classList.toggle("active");
  }

  menuToggle.addEventListener("click", toggleMenu);
  navOverlay?.addEventListener("click", toggleMenu);

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navLinks.classList.remove("active");
      navOverlay?.classList.remove("active");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
      toggleMenu();
    }
  });
}

/**
 * Cerrar modal de booking
 */
function closeBookingModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  const modalBox = document.getElementById("modalBox");

  if (!modalOverlay || !modalBox) return;

  modalBox.style.opacity = "0";
  modalBox.style.transform = "translateY(20px) scale(.97)";

  setTimeout(() => {
    modalOverlay.style.display = "none";
    modalBox.style.opacity = "1";
    modalBox.style.transform = "translateY(0) scale(1)";
  }, 300);
}

/**
 * Ocultar panel admin
 */
function hideAdminPanel() {
  const adminModal = document.getElementById("adminModal");
  if (adminModal) {
    adminModal.classList.add("hide");
  }
}

/**
 * Iniciar cuando el DOM esté listo
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

export { initApp, closeBookingModal };
