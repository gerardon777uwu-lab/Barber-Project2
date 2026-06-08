/**
 * Admin Panel Module
 * Gestión completa del panel de administración
 */

import {
  getCurrentUser,
  isAdmin,
  loginWithEmail,
  logout,
  auth,
} from "../firebase/auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getReservations,
  onReservationsChange,
  updateReservationStatus,
  deleteReservation,
  getStatistics,
} from "../firebase/reservations.js";
import {
  formatDate,
  showToast,
  showConfirmDialog,
  exportToCSV,
  exportToExcel,
  debounce,
} from "../utils/helpers.js";

let currentReservations = [];
let filteredReservations = [];
let currentFilters = {
  estado: null,
  fecha: null,
  servicio: null,
};

/**
 * Inicializar panel admin
 */
function initAdminPanel() {
  const adminBtn = document.getElementById("adminLogoBtn");
  const adminModal = document.getElementById("adminModal");

  if (adminBtn && adminModal) {
    adminBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openAdminPanel();
    });
  }

  // Escuchar cambios de autenticación
  onAuthStateChanged(auth, (user) => {
    if (user && isAdmin()) {
      console.log("✓ Usuario admin detectado");
      loadAdminPanel();
    }
  });
}

/**
 * Abrir panel admin
 */
function openAdminPanel() {
  const adminModal = document.getElementById("adminModal");
  if (adminModal) {
    adminModal.style.display = "flex";
    adminModal.classList.remove("hide");
  }
}

/**
 * Cerrar panel admin
 */
function closeAdminPanel() {
  const adminModal = document.getElementById("adminModal");
  if (adminModal) {
    adminModal.classList.add("hide");
    setTimeout(() => {
      adminModal.style.display = "none";
    }, 300);
  }
}

/**
 * Cargar panel admin
 */
async function loadAdminPanel() {
  try {
    // Cargar estadísticas
    const today = new Date().toISOString().split("T")[0];
    const statsResult = await getStatistics(today);

    if (statsResult.success) {
      renderStatistics(statsResult.stats);
    }

    // Cargar reservas
    loadReservations();

    // Configurar listeners
    setupEventListeners();
  } catch (error) {
    console.error("Error cargando panel admin:", error);
    showToast("Error cargando panel admin", "error");
  }
}

/**
 * Renderizar estadísticas
 */
function renderStatistics(stats) {
  const container = document.querySelector(".admin-stats");
  if (!container) return;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total Reservas</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.pendientes}</div>
      <div class="stat-label">Pendientes</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.aceptadas}</div>
      <div class="stat-label">Aceptadas</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.hodiernas}</div>
      <div class="stat-label">Hoy</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">$${stats.ingresos}</div>
      <div class="stat-label">Ingresos</div>
    </div>
  `;
}

/**
 * Cargar reservas
 */
async function loadReservations() {
  try {
    const result = await getReservations();

    if (result.success) {
      currentReservations = result.reservas;
      applyFilters();
      renderReservations();

      // Escuchar cambios en tiempo real
      const unsubscribe = onReservationsChange((snapshot) => {
        if (snapshot.success) {
          currentReservations = snapshot.reservas;
          applyFilters();
          renderReservations();
        }
      });

      // Guardar referencia para desuscribirse después
      window.unsubscribeReservations = unsubscribe;
    }
  } catch (error) {
    console.error("Error cargando reservas:", error);
    showToast("Error cargando reservas", "error");
  }
}

/**
 * Aplicar filtros
 */
function applyFilters() {
  filteredReservations = currentReservations.filter((reserva) => {
    if (currentFilters.estado && reserva.estado !== currentFilters.estado)
      return false;
    if (currentFilters.fecha && reserva.fecha !== currentFilters.fecha)
      return false;
    if (currentFilters.servicio && reserva.servicio !== currentFilters.servicio)
      return false;
    return true;
  });

  // Ordenar por fecha descendente
  filteredReservations.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Renderizar reservas
 */
function renderReservations() {
  const container = document.getElementById("reservasTable");
  if (!container) return;

  if (filteredReservations.length === 0) {
    container.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">No hay reservas</td></tr>';
    return;
  }

  container.innerHTML = filteredReservations
    .map(
      (reserva) => `
    <tr>
      <td>${reserva.nombre}</td>
      <td>${reserva.telefono}</td>
      <td>${reserva.servicio}</td>
      <td>${formatDate(reserva.fecha)}</td>
      <td>
        <span class="status-badge status-${reserva.estado}">
          ${reserva.estado}
        </span>
      </td>
      <td>
        <div class="admin-actions">
          ${
            reserva.estado === "pendiente"
              ? `
            <button class="admin-btn btn-accept" data-action="accept" data-id="${reserva.id}">
              Aceptar
            </button>
            <button class="admin-btn btn-delay" data-action="delay" data-id="${reserva.id}">
              Aplazar
            </button>
            <button class="admin-btn btn-reject" data-action="reject" data-id="${reserva.id}">
              Rechazar
            </button>
          `
              : `
            <button class="admin-btn btn-edit" data-action="edit" data-id="${reserva.id}">
              Editar
            </button>
          `
          }
          ${
            reserva.estado === "aceptada"
              ? `
            <button class="admin-btn btn-whatsapp" data-whatsapp="true" data-tel="${reserva.telefono}" data-nombre="${reserva.nombre}" data-servicio="${reserva.servicio}" data-fecha="${reserva.fecha}" data-hora="${reserva.hora}">
              💬 WhatsApp
            </button>
          `
              : ""
          }
          <button class="admin-btn btn-delete" data-action="delete" data-id="${reserva.id}">
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");

  // Agregar event listeners para botones de acciones
  container.querySelectorAll(".admin-btn[data-action]").forEach((btn) => {
    btn.addEventListener("click", handleReservationAction);
  });

  // Agregar event listeners para botones de WhatsApp (sin esperas async previas)
  container.querySelectorAll(".admin-btn[data-whatsapp]").forEach((btn) => {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const telefono = this.dataset.tel;
      const nombre = this.dataset.nombre;
      const servicio = this.dataset.servicio;
      const fecha = this.dataset.fecha;
      const hora = this.dataset.hora;
      
      console.log("✅ Botón WhatsApp clickeado para:", nombre);
      openWhatsAppDirect(telefono, nombre, servicio, fecha, hora);
    });
  });
}

/**
 * Manejar acciones de reserva - SOLO actualizar estado, NO abrir WhatsApp
 */
async function handleReservationAction(e) {
  const btn = e.target;
  const action = btn.dataset.action;
  const reservaId = btn.dataset.id;

  console.log("🔵 handleReservationAction llamada con action:", action);

  const reserva = currentReservations.find((r) => r.id === reservaId);
  if (!reserva) {
    console.error("❌ No se encontró reserva con ID:", reservaId);
    return;
  }

  console.log("✅ Reserva encontrada:", reserva);

  try {
    switch (action) {
      case "accept":
        console.log("✅ Actualizando estado a aceptada...");
        await updateReservationStatus(reservaId, "aceptada");
        showToast("Reserva aceptada ✅", "success");
        console.log("✅ Estado actualizado. El usuario verá el botón WhatsApp");
        break;

      case "delay":
        console.log("✅ Actualizando estado a aplazada...");
        await updateReservationStatus(reservaId, "aplazada");
        showToast("Reserva aplazada ⏳", "warning");
        break;

      case "reject":
        showConfirmDialog(
          "¿Estás seguro de que quieres rechazar esta reserva?",
          async () => {
            await deleteReservation(reservaId);
            showToast("Reserva rechazada ❌", "error");
          }
        );
        break;

      case "edit":
        openEditModal(reserva);
        break;

      case "delete":
        showConfirmDialog(
          "¿Estás seguro de que quieres eliminar esta reserva?",
          async () => {
            await deleteReservation(reservaId);
            showToast("Reserva eliminada", "info");
          }
        );
        break;

      default:
        console.warn("⚠️ Acción desconocida:", action);
    }
  } catch (error) {
    console.error("❌ Error en handleReservationAction:", error);
    showToast("Error al procesar la reserva", "error");
  }

/**
 * NUEVA FUNCIÓN: Abrir WhatsApp directamente (SIN esperas async previas)
 * Se ejecuta en respuesta a click del usuario en botón WhatsApp
 * Ejecuta window.location.href INMEDIATAMENTE
 */
function openWhatsAppDirect(telefono, nombre, servicio, fecha, hora) {
  console.log("🔴 openWhatsAppDirect INICIADA");
  
  try {
    // Mensaje personalizado
    const mensaje = `Hola ${nombre}, 👋\n\nTe confirmamos tu reserva:\n\n📅 Servicio: ${servicio}\n📆 Fecha: ${formatDate(fecha)}\n🕐 Hora: ${hora}\n\n¡Nos vemos pronto en Ricky Barber BCN! 💈`;

    // Normalizar número a formato internacional
    let telefonoFormato = telefono.replace(/\D/g, ""); // Quitar todo excepto números
    
    console.log("📱 Teléfono original:", telefono);
    console.log("📱 Teléfono sin símbolos:", telefonoFormato);
    
    // Reconocer y normalizar múltiples formatos:
    // 0034612345678 → 34612345678
    // 0612345678 → 34612345678
    // +34612345678 → 34612345678
    // 612345678 → 34612345678
    telefonoFormato = telefonoFormato
      .replace(/^0034/, "34")  // Reemplazar 0034 por 34
      .replace(/^0/, "34");    // Reemplazar 0 inicial por 34
    
    console.log("📱 Después de normalizar:", telefonoFormato);
    
    // Si aún no tiene código de país, agregarlo
    if (!telefonoFormato.startsWith("34")) {
      telefonoFormato = "34" + telefonoFormato;
    }

    console.log("📱 Formato final:", telefonoFormato);
    console.log("📱 Mensaje:", mensaje);

    const whatsappUrl = `https://wa.me/${telefonoFormato}?text=${encodeURIComponent(
      mensaje
    )}`;

    console.log("📱 URL WhatsApp FINAL:", whatsappUrl);

    // ✅ NAVEGACIÓN DIRECTA INMEDIATA - Sin esperas async
    // Esto se ejecuta inmediatamente después del click del usuario
    window.location.href = whatsappUrl;
    
    console.log("✅ window.location.href ejecutado");
    showToast("Abriendo WhatsApp...", "info");
  } catch (error) {
    console.error("❌ Error en openWhatsAppDirect:", error);
    showToast("Error al abrir WhatsApp", "error");
  }
}

/**
 * Enviar confirmación por WhatsApp
 */
async function sendWhatsAppConfirmation(reserva, status) {
  console.log("🔴 sendWhatsAppConfirmation INICIADA - Status:", status);
  
  try {
    const mensaje =
      status === "ACEPTADA"
        ? `Tu reserva ha sido aceptada! 🎉\n\nServicio: ${reserva.servicio}\nFecha: ${formatDate(reserva.fecha)}\nHora: ${reserva.hora}\n\n¡Nos vemos pronto!`
        : `Tu reserva ha sido aplazada.\n\nPróximamente nos pondremos en contacto.`;

    // Normalizar número a formato internacional
    let telefonoFormato = reserva.telefono.replace(/\D/g, ""); // Quitar todo excepto números
    
    console.log("📱 Teléfono original:", reserva.telefono);
    console.log("📱 Teléfono sin símbolos:", telefonoFormato);
    
    // Reconocer y normalizar múltiples formatos:
    // 0034612345678 → 34612345678
    // 0612345678 → 34612345678
    // +34612345678 → 34612345678
    // 612345678 → 34612345678
    telefonoFormato = telefonoFormato
      .replace(/^0034/, "34")  // Reemplazar 0034 por 34
      .replace(/^0/, "34");    // Reemplazar 0 inicial por 34
    
    console.log("📱 Después de normalizar:", telefonoFormato);
    
    // Si aún no tiene código de país, agregarlo
    if (!telefonoFormato.startsWith("34")) {
      telefonoFormato = "34" + telefonoFormato;
    }

    console.log("📱 Formato final:", telefonoFormato);
    console.log("📱 Mensaje:", mensaje);

    const whatsappUrl = `https://wa.me/${telefonoFormato}?text=${encodeURIComponent(
      mensaje
    )}`;

    console.log("📱 URL WhatsApp:", whatsappUrl);

    // Estrategia: Crear link temporal y hacer click (más compatible con móviles)
    const tempLink = document.createElement("a");
    tempLink.href = whatsappUrl;
    tempLink.target = "_blank";
    tempLink.style.display = "none";
    
    document.body.appendChild(tempLink);
    console.log("📱 Link creado y agregado al DOM");
    
    tempLink.click();
    console.log("📱 Click ejecutado");
    
    // Limpiar
    setTimeout(() => {
      document.body.removeChild(tempLink);
      console.log("📱 Link temporal eliminado");
    }, 100);
    
    showToast("Abriendo WhatsApp...", "info");
  } catch (error) {
    console.error("❌ Error enviando WhatsApp:", error);
    showToast("Error al abrir WhatsApp", "error");
  }
}

/**
 * Enviar mensaje por WhatsApp
 */
async function sendWhatsAppMessage(reserva, type) {
  const mensajes = {
    RECHAZADA: `Tu reserva ha sido rechazada.\n\nSiéntete libre de intentar nuevamente.\n\nRicky Barber BCN`,
    APLAZADA: `Tu reserva ha sido aplazada.\n\nNos pondremos en contacto pronto.\n\nRicky Barber BCN`,
  };

  try {
    const mensaje = mensajes[type] || "Actualización de tu reserva";
    
    // Normalizar número a formato internacional
    let telefonoFormato = reserva.telefono.replace(/\D/g, ""); // Quitar todo excepto números
    
    console.log("📱 Teléfono original:", reserva.telefono);
    console.log("📱 Teléfono sin símbolos:", telefonoFormato);
    
    // Reconocer y normalizar múltiples formatos:
    // 0034612345678 → 34612345678
    // 0612345678 → 34612345678
    // +34612345678 → 34612345678
    // 612345678 → 34612345678
    telefonoFormato = telefonoFormato
      .replace(/^0034/, "34")  // Reemplazar 0034 por 34
      .replace(/^0/, "34");    // Reemplazar 0 inicial por 34
    
    console.log("📱 Después de normalizar:", telefonoFormato);
    
    // Si aún no tiene código de país, agregarlo
    if (!telefonoFormato.startsWith("34")) {
      telefonoFormato = "34" + telefonoFormato;
    }

    console.log("📱 Formato final:", telefonoFormato);
    console.log("📱 Mensaje:", mensaje);

    const whatsappUrl = `https://wa.me/${telefonoFormato}?text=${encodeURIComponent(
      mensaje
    )}`;

    console.log("📱 URL WhatsApp:", whatsappUrl);

    // Estrategia: Crear link temporal y hacer click (más compatible con móviles)
    const tempLink = document.createElement("a");
    tempLink.href = whatsappUrl;
    tempLink.target = "_blank";
    tempLink.style.display = "none";
    
    document.body.appendChild(tempLink);
    console.log("📱 Link creado y agregado al DOM");
    
    tempLink.click();
    console.log("📱 Click ejecutado");
    
    // Limpiar
    setTimeout(() => {
      document.body.removeChild(tempLink);
      console.log("📱 Link temporal eliminado");
    }, 100);
  } catch (error) {
    console.error("❌ Error:", error);
    showToast("Error al abrir WhatsApp", "error");
  }
}

/**
 * Abrir modal de edición
 */
function openEditModal(reserva) {
  showToast("Funcionalidad de edición en desarrollo", "info");
  // Implementar modal de edición
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
  // Búsqueda
  const searchInput = document.querySelector(".admin-search-input");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        const term = e.target.value.toLowerCase();
        filteredReservations = currentReservations.filter(
          (r) =>
            r.nombre.toLowerCase().includes(term) ||
            r.telefono.includes(term) ||
            r.email.toLowerCase().includes(term)
        );
        renderReservations();
      }, 300)
    );
  }

  // Filtros
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const filter = e.target.dataset.filter;
      const value = e.target.dataset.value;

      if (currentFilters[filter] === value) {
        currentFilters[filter] = null;
        e.target.classList.remove("active");
      } else {
        // Remover active de otros botones del mismo filtro
        document
          .querySelectorAll(`.filter-btn[data-filter="${filter}"]`)
          .forEach((b) => b.classList.remove("active"));

        currentFilters[filter] = value;
        e.target.classList.add("active");
      }

      applyFilters();
      renderReservations();
    });
  });

  // Exportar CSV
  const exportCsvBtn = document.querySelector('[data-export="csv"]');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const data = filteredReservations.map((r) => ({
        Nombre: r.nombre,
        Teléfono: r.telefono,
        Email: r.email,
        Servicio: r.servicio,
        Fecha: r.fecha,
        Hora: r.hora,
        Estado: r.estado,
      }));

      exportToCSV(data, "reservas.csv");
    });
  }

  // Exportar Excel
  const exportExcelBtn = document.querySelector('[data-export="excel"]');
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", () => {
      const data = filteredReservations.map((r) => ({
        Nombre: r.nombre,
        Teléfono: r.telefono,
        Email: r.email,
        Servicio: r.servicio,
        Fecha: r.fecha,
        Hora: r.hora,
        Estado: r.estado,
      }));

      exportToExcel(data, "reservas.xlsx");
    });
  }

  // Cerrar panel
  const closeBtn = document.getElementById("closeAdminModal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeAdminPanel);
  }
}

export {
  initAdminPanel,
  openAdminPanel,
  closeAdminPanel,
  loadAdminPanel,
};
