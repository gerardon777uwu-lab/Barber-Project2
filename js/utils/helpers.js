/**
 * Utilities Module
 * Funciones auxiliares de uso general
 */

/**
 * Formatear fecha en formato legible
 */
function formatDate(dateString) {
  if (!dateString) return "—";

  const [y, m, d] = dateString.split("-");
  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const dt = new Date(+y, +m - 1, +d);
  return `${dias[dt.getDay()]} ${+d} de ${meses[dt.getMonth()]} de ${y}`;
}

/**
 * Validar email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validar teléfono español
 */
function isValidPhoneNumber(phone) {
  const cleanPhone = phone.replace(/\D/g, "");
  // Aceptar números de 9 dígitos (español) o con código de país
  return /^(\+34|34)?[6-9]\d{8}$/.test(cleanPhone);
}

/**
 * Mostrar notificación toast
 */
function showToast(message, type = "info", duration = 3000) {
  // Crear elemento
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Estilos
  const styles = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    zIndex: "9999",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "0.85rem",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    animation: "slideInUp 0.3s ease",
    maxWidth: "300px",
  };

  // Colores según tipo
  const colors = {
    success: {
      background: "rgba(76, 175, 80, 0.9)",
      color: "white",
      border: "1px solid rgba(76, 175, 80, 1)",
    },
    error: {
      background: "rgba(244, 67, 54, 0.9)",
      color: "white",
      border: "1px solid rgba(244, 67, 54, 1)",
    },
    warning: {
      background: "rgba(255, 193, 7, 0.9)",
      color: "#000",
      border: "1px solid rgba(255, 193, 7, 1)",
    },
    info: {
      background: "rgba(0, 245, 255, 0.9)",
      color: "#000",
      border: "1px solid rgba(0, 245, 255, 1)",
    },
  };

  const color = colors[type] || colors.info;

  Object.assign(toast.style, {
    ...styles,
    ...color,
  });

  document.body.appendChild(toast);

  // Remover después de duration
  setTimeout(() => {
    toast.style.animation = "slideOutDown 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Mostrar modal de confirmación
 */
function showConfirmDialog(message, onConfirm, onCancel) {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const dialog = document.createElement("div");
  dialog.className = "confirm-dialog";
  dialog.style.cssText = `
    background: #0d0d0d;
    border: 1px solid rgba(0, 245, 255, 0.3);
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    animation: slideInUp 0.3s ease;
  `;

  dialog.innerHTML = `
    <p style="font-size: 1rem; margin-bottom: 1.5rem; color: #fff;">${message}</p>
    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
      <button class="confirm-cancel" style="
        padding: 0.75rem 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      ">Cancelar</button>
      <button class="confirm-ok" style="
        padding: 0.75rem 1.5rem;
        background: #00f5ff;
        border: 1px solid #00f5ff;
        color: #000;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      ">Confirmar</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  dialog.querySelector(".confirm-ok").addEventListener("click", () => {
    overlay.remove();
    if (onConfirm) onConfirm();
  });

  dialog.querySelector(".confirm-cancel").addEventListener("click", () => {
    overlay.remove();
    if (onCancel) onCancel();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onCancel) onCancel();
    }
  });
}

/**
 * Exportar CSV
 */
function exportToCSV(data, filename = "export.csv") {
  if (!data || data.length === 0) {
    showToast("No hay datos para exportar", "warning");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escapar comillas y envolver en comillas si contiene comas
          if (typeof value === "string" && value.includes(",")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  showToast("CSV exportado correctamente", "success");
}

/**
 * Exportar Excel (usando XLSX)
 */
async function exportToExcel(data, filename = "export.xlsx") {
  if (!data || data.length === 0) {
    showToast("No hay datos para exportar", "warning");
    return;
  }

  try {
    // Cargar XLSX desde CDN
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js";
    script.onload = () => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");

      // Autoajustar ancho de columnas
      const maxWidth = 50;
      const colWidths = Object.keys(data[0]).map((header) => ({
        wch: Math.min(
          maxWidth,
          Math.max(
            header.length,
            Math.max(...data.map((row) => String(row[header] || "").length))
          )
        ),
      }));
      worksheet["!cols"] = colWidths;

      XLSX.writeFile(workbook, filename);
      showToast("Excel exportado correctamente", "success");
    };
    script.onerror = () => {
      showToast("Error cargando librería de Excel", "error");
    };
    document.head.appendChild(script);
  } catch (error) {
    console.error("Error exportando Excel:", error);
    showToast("Error al exportar Excel", "error");
  }
}

/**
 * Copiar al portapapeles
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Copiado al portapapeles", "success");
  });
}

/**
 * Generar ID único
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce para funciones
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle para funciones
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export {
  formatDate,
  isValidEmail,
  isValidPhoneNumber,
  showToast,
  showConfirmDialog,
  exportToCSV,
  exportToExcel,
  copyToClipboard,
  generateId,
  debounce,
  throttle,
};
