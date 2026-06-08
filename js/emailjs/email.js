/**
 * EmailJS Service
 * Envío de emails mediante EmailJS (client-side)
 */

// Importar EmailJS como módulo ES6 desde CDN (con +esm para ESM module)
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/+esm';

// Credenciales de EmailJS
const EMAILJS_SERVICE_ID = 'service_77jn8pj'; // Reemplazar con tu service ID
const EMAILJS_TEMPLATE_ID_CLIENT = 'template_xl27r75'; // Template para cliente
const EMAILJS_TEMPLATE_ID_ADMIN = 'template_y6qlxz2'; // Template para admin (Ricky)
const EMAILJS_PUBLIC_KEY = 'VcxNwmcN6lTAtN9jd'; // Public API key

/**
 * Inicializar EmailJS (debe llamarse una sola vez al cargar la página)
 */
export function initEmailJS() {
  // EmailJS se inicializa con el Public Key
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('✓ EmailJS inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando EmailJS:', error);
  }
}

/**
 * Enviar emails de confirmación de cita (cliente + admin)
 */
export async function sendBookingEmails(data, emails) {
  try {
    console.log('📧 Iniciando envío de emails con EmailJS...');

    // Validar datos
    if (!data.email || !data.nombre) {
      throw new Error('Email o nombre del cliente faltantes');
    }

    // Email 1: Confirmación al cliente
    console.log(`📤 Enviando email al cliente: ${data.email}`);
    const clientParams = {
      to_email: data.email,
      to_name: data.nombre,
      subject: 'Tu cita en Ricky Barber está confirmada',
      nombre: data.nombre,
      servicio: data.servicio || 'No especificado',
      fecha: data.dia || data.fecha || 'No especificada',
      hora: data.hora || 'No especificada',
      email: data.email,
      reply_to: 'noreply@rickybarbershop.com',
    };

    const clientResult = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_CLIENT,
      clientParams
    );

    console.log('✓ Email al cliente enviado:', clientResult.status);

    // Email 2: Notificación al admin
    const adminEmail = localStorage.getItem('VITE_ADMIN_EMAIL') || 'gerard.bustamante867@gmail.com';
    console.log(`📤 Enviando email al admin: ${adminEmail}`);
    
    const adminParams = {
      to_email: adminEmail,
      to_name: 'Ricky',
      subject: 'Nueva reserva - Ricky Barber',
      nombre: data.nombre,
      servicio: data.servicio || 'No especificado',
      fecha: data.dia || data.fecha || 'No especificada',
      hora: data.hora || 'No especificada',
      telefono: data.telefono || 'No proporcionado',
      email: data.email,
      notas: data.notas || 'Sin notas',
      reply_to: data.email,
    };

    const adminResult = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_ADMIN,
      adminParams
    );

    console.log('✓ Email al admin enviado:', adminResult.status);

    // Respuesta exitosa
    return {
      success: true,
      clientEmail: {
        id: clientResult.status,
        email: data.email,
      },
      rickyEmail: {
        id: adminResult.status,
        email: adminEmail,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error enviando emails:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido',
    };
  }
}
