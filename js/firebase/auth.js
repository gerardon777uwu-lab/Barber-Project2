/**
 * Firebase Authentication Module
 * Gestiona la autenticación de usuarios con seguridad
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { FIREBASE_CONFIG, ROLES, SECURITY_LIMITS } from "./config.js";

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

// Configurar persistencia de sesión
setPersistence(auth, browserLocalPersistence);

let currentUser = null;
let userRole = null;

/**
 * Obtener usuario actual
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Obtener rol del usuario actual
 */
function getUserRole() {
  return userRole;
}

/**
 * Es admin
 */
function isAdmin() {
  return userRole === ROLES.ADMIN;
}

/**
 * Inicializar listener de autenticación
 */
function initAuthListener(callbacks = {}) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      // Obtener rol desde Firestore
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      userRole = userDoc.exists() ? userDoc.data().role : ROLES.CUSTOMER;

      console.log("✓ Usuario autenticado:", user.email, "- Rol:", userRole);

      if (callbacks.onAuthSuccess) {
        callbacks.onAuthSuccess(user, userRole);
      }
    } else {
      currentUser = null;
      userRole = null;

      console.log("✓ Usuario no autenticado");

      if (callbacks.onAuthLogout) {
        callbacks.onAuthLogout();
      }
    }
  });
}

/**
 * Login con email y contraseña
 */
async function loginWithEmail(email, password) {
  try {
    // Verificar rate limiting
    await checkRateLimit(email);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("✓ Login exitoso:", user.email);

    return { success: true, user };
  } catch (error) {
    console.error("❌ Error en login:", error.code, error.message);

    // Mensajes de error más amigables
    let errorMessage = "Error al iniciar sesión";
    if (error.code === "auth/invalid-credential") {
      errorMessage = "Email o contraseña incorrectos";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "Usuario no encontrado";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Logout
 */
async function logout() {
  try {
    await signOut(auth);
    currentUser = null;
    userRole = null;
    console.log("✓ Logout exitoso");
    return { success: true };
  } catch (error) {
    console.error("❌ Error en logout:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar rate limiting
 */
async function checkRateLimit(email) {
  const attemptKey = `login_attempts_${email}`;
  const attempts = JSON.parse(localStorage.getItem(attemptKey) || "[]");

  const now = Date.now();
  const recentAttempts = attempts.filter(
    (timestamp) => now - timestamp < SECURITY_LIMITS.ATTEMPT_WINDOW_MINUTES * 60 * 1000
  );

  if (recentAttempts.length >= SECURITY_LIMITS.MAX_BOOKING_ATTEMPTS) {
    throw new Error("too-many-requests");
  }

  recentAttempts.push(now);
  localStorage.setItem(attemptKey, JSON.stringify(recentAttempts));
}

/**
 * Crear usuario admin (requiere credenciales admin)
 */
async function createAdminUser(email, password) {
  try {
    if (!isAdmin()) {
      throw new Error("Solo admins pueden crear usuarios");
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar rol en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      email: user.email,
      role: ROLES.ADMIN,
      createdAt: new Date().toISOString(),
    });

    console.log("✓ Usuario admin creado:", email);

    return { success: true, user };
  } catch (error) {
    console.error("❌ Error creando usuario admin:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener datos del usuario
 */
async function getUserData(userId) {
  try {
    const userDoc = await getDoc(doc(db, "usuarios", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("❌ Error obteniendo datos del usuario:", error);
    return null;
  }
}

/**
 * Verificar reservas duplicadas por teléfono
 */
async function checkDuplicateReservation(telefono) {
  try {
    const q = query(
      collection(db, "reservas"),
      where("telefono", "==", telefono),
      where("estado", "in", ["pendiente", "aceptada"])
    );

    const snapshot = await getDocs(q);

    // Contar cuántas reservas hay
    if (snapshot.size >= SECURITY_LIMITS.MAX_RESERVAS_POR_TELEFONO) {
      return {
        isDuplicate: true,
        count: snapshot.size,
        message: `Ya tienes ${snapshot.size} reservas activas. Máximo ${SECURITY_LIMITS.MAX_RESERVAS_POR_TELEFONO}.`,
      };
    }

    // Verificar si hay reserva en las últimas 24 horas
    const recentReservations = snapshot.docs.filter((doc) => {
      const createdAt = new Date(doc.data().createdAt);
      const hoursDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursDiff < SECURITY_LIMITS.TIMEFRAME_DUPLICATES_HOURS;
    });

    if (recentReservations.length > 0) {
      return {
        isDuplicate: true,
        count: recentReservations.length,
        message: `Ya tienes una reserva reciente. Espera antes de hacer otra.`,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("❌ Error verificando duplicados:", error);
    return { isDuplicate: false };
  }
}

export {
  app,
  auth,
  db,
  getCurrentUser,
  getUserRole,
  isAdmin,
  initAuthListener,
  loginWithEmail,
  logout,
  checkRateLimit,
  createAdminUser,
  getUserData,
  checkDuplicateReservation,
};
