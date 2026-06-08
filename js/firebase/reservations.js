/**
 * Reservations Module
 * Gestiona todas las operaciones CRUD de reservas
 */

import {
  db,
  checkDuplicateReservation,
} from "./auth.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

/**
 * Crear nueva reserva
 */
async function createReservation(data) {
  try {
    // Verificar duplicados
    const duplicate = await checkDuplicateReservation(data.telefono);
    if (duplicate.isDuplicate) {
      return {
        success: false,
        error: duplicate.message,
      };
    }

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, "reservas"), {
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email,
      servicio: data.servicio,
      fecha: data.fecha,
      hora: data.hora,
      notas: data.notas || "",
      estado: "pendiente",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ipAddress: await getClientIP(),
    });

    console.log("✓ Reserva creada:", docRef.id);

    // Guardar en historial
    await saveToHistory({
      type: "RESERVA_CREADA",
      reservaId: docRef.id,
      data: data,
    });

    return {
      success: true,
      reservaId: docRef.id,
    };
  } catch (error) {
    console.error("❌ Error creando reserva:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Actualizar estado de reserva
 */
async function updateReservationStatus(reservaId, newStatus) {
  try {
    const reservaRef = doc(db, "reservas", reservaId);

    await updateDoc(reservaRef, {
      estado: newStatus,
      updatedAt: Timestamp.now(),
    });

    console.log("✓ Reserva actualizada:", reservaId, "- Estado:", newStatus);

    // Guardar en historial
    await saveToHistory({
      type: "RESERVA_ACTUALIZADA",
      reservaId,
      newStatus,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error actualizando reserva:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar reserva (guardar en historial)
 */
async function deleteReservation(reservaId) {
  try {
    // Obtener datos antes de eliminar
    const reservaRef = doc(db, "reservas", reservaId);
    const snapshot = await getDocs(query(collection(db, "reservas"), where("__name__", "==", reservaId)));

    // Eliminar
    await deleteDoc(reservaRef);

    console.log("✓ Reserva eliminada:", reservaId);

    // Guardar en historial
    await saveToHistory({
      type: "RESERVA_ELIMINADA",
      reservaId,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error eliminando reserva:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener todas las reservas (con filtros)
 */
async function getReservations(filters = {}) {
  try {
    let q = collection(db, "reservas");

    // Construir query con filtros
    const constraints = [];

    if (filters.estado) {
      constraints.push(where("estado", "==", filters.estado));
    }

    if (filters.fecha) {
      constraints.push(where("fecha", "==", filters.fecha));
    }

    if (filters.telefono) {
      constraints.push(where("telefono", "==", filters.telefono));
    }

    if (filters.servicio) {
      constraints.push(where("servicio", "==", filters.servicio));
    }

    if (constraints.length > 0) {
      constraints.push(orderBy("createdAt", "desc"));
      q = query(q, ...constraints);
    } else {
      q = query(q, orderBy("createdAt", "desc"));
    }

    const snapshot = await getDocs(q);
    const reservas = [];

    snapshot.forEach((doc) => {
      reservas.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, reservas };
  } catch (error) {
    console.error("❌ Error obteniendo reservas:", error);
    return { success: false, error: error.message, reservas: [] };
  }
}

/**
 * Escuchar cambios en tiempo real
 */
function onReservationsChange(callback) {
  try {
    const q = query(collection(db, "reservas"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservas = [];
      snapshot.forEach((doc) => {
        reservas.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      callback({
        success: true,
        reservas,
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error("❌ Error configurando listener:", error);
    callback({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Guardar en historial
 */
async function saveToHistory(entry) {
  try {
    await addDoc(collection(db, "historial"), {
      ...entry,
      timestamp: Timestamp.now(),
    });

    console.log("✓ Evento guardado en historial:", entry.type);
  } catch (error) {
    console.error("❌ Error guardando en historial:", error);
  }
}

/**
 * Obtener historial
 */
async function getHistory(filters = {}) {
  try {
    let q = collection(db, "historial");

    const constraints = [];

    if (filters.type) {
      constraints.push(where("type", "==", filters.type));
    }

    if (filters.startDate && filters.endDate) {
      constraints.push(where("timestamp", ">=", filters.startDate));
      constraints.push(where("timestamp", "<=", filters.endDate));
    }

    if (constraints.length > 0) {
      constraints.push(orderBy("timestamp", "desc"));
      q = query(q, ...constraints);
    } else {
      q = query(q, orderBy("timestamp", "desc"));
    }

    const snapshot = await getDocs(q);
    const historial = [];

    snapshot.forEach((doc) => {
      historial.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return { success: true, historial };
  } catch (error) {
    console.error("❌ Error obteniendo historial:", error);
    return { success: false, error: error.message, historial: [] };
  }
}

/**
 * Obtener IP del cliente (para seguridad)
 */
async function getClientIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn("⚠ No se pudo obtener IP:", error);
    return "unknown";
  }
}

/**
 * Obtener estadísticas
 */
async function getStatistics(fecha = null) {
  try {
    const result = await getReservations();
    if (!result.success) return { success: false, error: result.error };

    const reservas = result.reservas;

    // Contar por estado
    const stats = {
      total: reservas.length,
      pendientes: 0,
      aceptadas: 0,
      rechazadas: 0,
      aplazadas: 0,
      hodiernas: 0,
      ingresos: 0,
    };

    const PRECIOS = {
      "Corte Normal": 10,
      "Corte + Cejas": 12,
      "Mechas / Decoloración": 0,
    };

    reservas.forEach((r) => {
      if (r.estado === "pendiente") stats.pendientes++;
      if (r.estado === "aceptada") stats.aceptadas++;
      if (r.estado === "rechazada") stats.rechazadas++;
      if (r.estado === "aplazada") stats.aplazadas++;

      if (r.fecha === fecha) stats.hodiernas++;

      if (r.estado === "aceptada") {
        stats.ingresos += PRECIOS[r.servicio] || 0;
      }
    });

    return { success: true, stats };
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    return { success: false, error: error.message };
  }
}

export {
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getReservations,
  onReservationsChange,
  saveToHistory,
  getHistory,
  getStatistics,
};
