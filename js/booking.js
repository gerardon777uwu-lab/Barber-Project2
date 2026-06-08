/**
 * Booking Module
 * Gestión del formulario de reservas del cliente
 */

import {
  createReservation,
} from "../firebase/reservations.js";
import {
  isValidEmail,
  isValidPhoneNumber,
  showToast,
  formatDate,
} from "../utils/helpers.js";

const SERVICES = {
  corte: {
    label: "Corte Normal",
    price: 10,
    tag: "CORTE",
    color: "var(--white)",
  },
  corte_cejas: {
    label: "Corte + Cejas",
    price: 12,
    tag: "CORTE + CEJAS",
    color: "var(--gold)",
  },
  mechas: {
    label: "Mechas / Decoloración",
    price: "A consultar",
    tag: "MECHAS / COLOR",
    color: "var(--cyan)",
  },
};

const TIME_SLOTS = [
  "10:00",
  "10:45",
  "11:30",
  "12:15",
  "13:00",
  "16:00",
  "16:45",
  "17:30",
  "18:15",
  "19:00",
];

let selectedTime = null;
let isSubmitting = false;

/**
 * Inicializar módulo de booking
 */
function initBooking() {
  setupTimeSlots();
  setupForm();
  setupDateInput();
}

/**
 * Configurar slots de tiempo
 */
function setupTimeSlots() {
  const container = document.getElementById("timeSlots");
  if (!container) return;

  TIME_SLOTS.forEach((time) => {
    const btn = document.createElement("button");
    btn.className = "time-slot";
    btn.textContent = time;
    btn.type = "button";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      selectTime(time, btn);
    });

    container.appendChild(btn);
  });
}

/**
 * Seleccionar hora
 */
function selectTime(time, btn) {
  document.querySelectorAll(".time-slot").forEach((s) => {
    s.classList.remove("selected");
  });

  btn.classList.add("selected");
  selectedTime = time;

  showToast(`Hora seleccionada: ${time}`, "success");
}

/**
 * Configurar input de fecha
 */
function setupDateInput() {
  const dayInput = document.getElementById("bookDay");
  if (!dayInput) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  dayInput.min = `${yyyy}-${mm}-${dd}`;
}

/**
 * Configurar formulario
 */
function setupForm() {
  const submitBtn = document.getElementById("bookSubmitBtn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", handleSubmit);
}

/**
 * Manejar envío del formulario
 */
async function handleSubmit(e) {
  e.preventDefault();

  // Prevenir múltiples envíos
  if (isSubmitting) return;

  try {
    isSubmitting = true;

    // Recolectar datos
    const servicio = document.querySelector('input[name="servicio"]:checked');
    const dia = document.getElementById("bookDay").value.trim();
    const nombre = document.getElementById("bookName").value.trim();
    const telefono = document.getElementById("bookPhone").value.trim();
    const email = document.getElementById("bookEmail").value.trim();
    const notas = document.getElementById("bookNotes").value.trim();

    // Validar
    const validation = validateForm(
      servicio,
      dia,
      nombre,
      telefono,
      email
    );

    if (!validation.isValid) {
      showToast(validation.error, "error");
      return;
    }

    // Mostrar loading
    const submitBtn = document.getElementById("bookSubmitBtn");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Procesando...</span>';
    submitBtn.disabled = true;

    // Enviar a Firebase
    const result = await createReservation({
      nombre,
      telefono,
      email,
      servicio: servicio.value,
      fecha: dia,
      hora: selectedTime,
      notas,
    });

    if (result.success) {
      // Mostrar modal de confirmación
      const emails = buildEmails({
        servicio: servicio.value,
        dia,
        hora: selectedTime,
        nombre,
        telefono,
        email,
        notas,
      });

      showBookingConfirmation(
        {
          nombre,
          telefono,
          email,
          servicio: servicio.value,
          fecha: dia,
          hora: selectedTime,
        },
        emails
      );

      // Limpiar formulario
      clearForm();
    } else {
      showToast(result.error || "Error al crear reserva", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("Error al procesar tu reserva", "error");
  } finally {
    isSubmitting = false;
    const submitBtn = document.getElementById("bookSubmitBtn");
    submitBtn.innerHTML = '<span>Reservar mi turno →</span>';
    submitBtn.disabled = false;
  }
}

/**
 * Validar formulario
 */
function validateForm(servicio, dia, nombre, telefono, email) {
  const errors = [];

  if (!servicio) {
    errors.push("Selecciona un servicio");
  }

  if (!dia) {
    errors.push("Elige un día");
  }

  if (!selectedTime) {
    errors.push("Elige una hora");
  }

  if (!nombre || nombre.length < 3) {
    errors.push("Nombre inválido");
  }

  if (!isValidPhoneNumber(telefono)) {
    errors.push("Teléfono inválido");
  }

  if (!isValidEmail(email)) {
    errors.push("Email inválido");
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join(" · "),
    };
  }

  return { isValid: true };
}

/**
 * Construir contenido de emails
 */
function buildEmails(data) {
  const svc = SERVICES[data.servicio];
  const fecha = formatDate(data.fecha);
  const nombre = data.nombre.split(" ")[0];

  const clientBody = `
    Hola <strong>${nombre}</strong>, tu cita está confirmada.<br><br>
    
    <strong style="color: var(--white)">Detalles de tu cita:</strong><br>
    — Servicio: <strong>${svc.label}</strong><br>
    — Fecha: <strong>${fecha}</strong><br>
    — Hora: <strong>${data.hora}</strong><br>
    — Precio: <strong style="color: var(--gold)">${svc.price}€</strong><br>
    <br>
    Llega 5 minutos antes. Cualquier cambio avisa con antelación.<br>
    <span style="color: var(--dim);">— Ricky Barber · @ricky_barberr_ · BCN</span>
  `;

  const rickyBody = `
    <strong style="color: var(--white)">Nuevo cliente registrado:</strong><br><br>
    
    — Nombre: <strong>${data.nombre}</strong><br>
    — Teléfono: <strong>${data.telefono}</strong><br>
    — Email: <strong>${data.email}</strong><br>
    — Servicio: <strong style="color: ${svc.color}">${svc.label}</strong><br>
    — Fecha: <strong>${fecha}</strong><br>
    — Hora: <strong>${data.hora}</strong><br>
    ${data.notas ? `— Notas: <em>${data.notas}</em><br>` : ""}
  `;

  return {
    clientSubject: `✅ Cita confirmada — ${svc.label} · ${fecha}`,
    clientBody,
    rickySubject: `✂ NUEVO TURNO — ${svc.tag} · ${fecha} ${data.hora}`,
    rickyBody,
    svc,
    fecha,
    hora: data.hora,
  };
}

/**
 * Mostrar confirmación de reserva
 */
function showBookingConfirmation(data, emails) {
  const overlay = document.getElementById("modalOverlay");
  const box = document.getElementById("modalBox");

  if (!overlay || !box) return;

  // Llenar datos
  document.getElementById("modalServiceLabel").textContent =
    emails.svc.label + " · " + emails.svc.price + "€";
  document.getElementById("emailClientSubject").textContent =
    emails.clientSubject;
  document.getElementById("emailClientBody").innerHTML = emails.clientBody;
  document.getElementById("emailRickySubject").textContent =
    emails.rickySubject;
  document.getElementById("emailRickyBody").innerHTML = emails.rickyBody;

  // Resumen
  const summary = document.getElementById("bookingSummary");
  summary.innerHTML = `
    <div class="sum-item">
      <div class="sum-key">Cliente</div>
      <div class="sum-val">${data.nombre}</div>
    </div>
    <div class="sum-item">
      <div class="sum-key">Servicio</div>
      <div class="sum-val">${emails.svc.label}</div>
    </div>
    <div class="sum-item">
      <div class="sum-key">Fecha</div>
      <div class="sum-val">${emails.fecha}</div>
    </div>
    <div class="sum-item">
      <div class="sum-key">Hora</div>
      <div class="sum-val">${data.hora}</div>
    </div>
    <div class="sum-item">
      <div class="sum-key">Precio</div>
      <div class="sum-val">${emails.svc.price}€</div>
    </div>
  `;

  // Mostrar
  overlay.style.display = "flex";
  setTimeout(() => {
    box.style.opacity = "1";
    box.style.transform = "translateY(0) scale(1)";
  }, 50);

  showToast("¡Reserva confirmada! 🎉", "success");
}

/**
 * Limpiar formulario
 */
function clearForm() {
  document.getElementById("bookDay").value = "";
  document.getElementById("bookName").value = "";
  document.getElementById("bookPhone").value = "";
  document.getElementById("bookEmail").value = "";
  document.getElementById("bookNotes").value = "";

  document.querySelectorAll('input[name="servicio"]').forEach((r) => {
    r.checked = false;
  });

  document.querySelectorAll(".time-slot").forEach((s) => {
    s.classList.remove("selected");
  });

  selectedTime = null;
}

/**
 * Cerrar modal de confirmación
 */
function closeBookingModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

export {
  initBooking,
  SERVICES,
  buildEmails,
  showBookingConfirmation,
  closeBookingModal,
};
