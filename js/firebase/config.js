/**
 * Firebase Configuration
 * NOTA: Las keys están protegidas con reglas de seguridad en Firebase Console
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB7wfV170xTrMak6Ljq1xuOPBNcd8URQR4",
  authDomain: "ricky-barbershop.firebaseapp.com",
  projectId: "ricky-barbershop",
  storageBucket: "ricky-barbershop.firebasestorage.app",
  messagingSenderId: "451454608367",
  appId: "1:451454608367:web:9e262401b51c4171578c1a",
  measurementId: "G-NX97E701XW"
};

// Configuración de autenticación
const AUTH_CONFIG = {
  signInMethods: ['password', 'google.com'],
  // La contraseña del admin se gestiona ahora en Firebase Authentication
  // NO se almacena en el frontend
};

// Límites de seguridad
const SECURITY_LIMITS = {
  MAX_RESERVAS_POR_TELEFONO: 3,        // Máximo 3 reservas por teléfono
  TIMEFRAME_DUPLICATES_HOURS: 24,      // En 24 horas
  MAX_BOOKING_ATTEMPTS: 5,              // Máximo 5 intentos
  ATTEMPT_WINDOW_MINUTES: 15,           // En 15 minutos
  MAX_RESERVAS_POR_DIA: 10,            // Máximo 10 reservas por día
};

// Configuración de roles
const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

export { FIREBASE_CONFIG, AUTH_CONFIG, SECURITY_LIMITS, ROLES };
