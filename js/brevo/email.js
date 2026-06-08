/**
 * Brevo Email Service (Formerly Sendinblue)
 * Usa templates guardadas en Brevo dashboard
 * Template Cliente: ID 1
 * Template Admin: ID 2
 */

// Configuración de Brevo
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = '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';
const TEMPLATE_CLIENT_ID = 1;
const TEMPLATE_ADMIN_ID = 2;

/**
 * Enviar emails de confirmación de cita (cliente + admin)
 * Usa plantillas guardadas en Brevo (IDs: 1 = cliente, 2 = admin)
 */
export async function sendBookingEmails(data, emails) {
  try {
    console.log('📧 Iniciando envío de emails con Brevo (Templates)...');

    // Validar datos
    if (!data.email || !data.nombre) {
      throw new Error('Email o nombre del cliente faltantes');
    }

    // Email 1: Cliente (Template ID 1)
    const clientResult = await sendClientEmail(data, emails);
    
    // Email 2: Admin (Template ID 2)
    const adminResult = await sendAdminEmail(data, emails);

    if (clientResult.success && adminResult.success) {
      console.log('✓ Emails enviados exitosamente');
      return {
        success: true,
        clientEmail: clientResult,
        adminEmail: adminResult,
        timestamp: new Date().toISOString(),
      };
    }

    throw new Error('Error enviando uno o ambos emails');
  } catch (error) {
    console.error('❌ Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Enviar email al cliente usando Template ID 1
 */
async function sendClientEmail(data, emails) {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: TEMPLATE_CLIENT_ID,
        to: [{
          email: data.email,
          name: data.nombre,
        }],
        params: {
          NOMBRE: data.nombre,
          SERVICIO: data.servicio || 'No especificado',
          FECHA: data.fecha || 'No especificada',
          HORA: data.hora || 'No especificada',
          TELEFONO: data.telefono || 'No proporcionado',
          EMAIL: data.email,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error Brevo');
    }

    console.log('✓ Email al cliente enviado:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      email: data.email,
    };
  } catch (error) {
    console.error('❌ Error email cliente:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Enviar email al admin usando Template ID 2
 */
async function sendAdminEmail(data, emails) {
  try {
    const adminEmail = localStorage.getItem('VITE_ADMIN_EMAIL') || 'gerard.bustamante867@gmail.com';

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: TEMPLATE_ADMIN_ID,
        to: [{
          email: adminEmail,
          name: 'Ricky',
        }],
        params: {
          NOMBRE: data.nombre,
          SERVICIO: data.servicio || 'No especificado',
          FECHA: data.fecha || 'No especificada',
          HORA: data.hora || 'No especificada',
          TELEFONO: data.telefono || 'No proporcionado',
          EMAIL: data.email,
          NOTAS: data.notas || 'Sin notas',
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error Brevo');
    }

    console.log('✓ Email admin enviado:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      email: adminEmail,
    };
  } catch (error) {
    console.error('❌ Error email admin:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
