/**
 * BACKEND SEGURO PARA RESEND (Opcional - Recomendado para Producción)
 * 
 * Si usas un servidor backend (Node.js, Python, etc.), 
 * puedes proteger tu API key de Resend:
 * 
 * 1. API key solo en el servidor (no en el cliente)
 * 2. Cliente hace request al servidor
 * 3. Servidor envía emails con Resend
 */

// ═══════════════════════════════════════════════════════
// OPCIÓN 1: Servidor Node.js/Express
// ═══════════════════════════════════════════════════════

// api/send-email.js (o routes/emails.js)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY); // ← Key solo aquí

export async function POST(req, res) {
  try {
    const { type, data } = req.body;

    if (type === 'booking-confirmation') {
      // Email al cliente
      const clientEmail = await resend.emails.send({
        from: 'Ricky Barber <noreply@rickybarbershop.com>',
        to: data.email,
        subject: data.clientSubject,
        html: data.clientBody,
      });

      // Email a Ricky (admin)
      const adminEmail = await resend.emails.send({
        from: 'Sistema <sistema@rickybarbershop.com>',
        to: process.env.ADMIN_EMAIL,
        subject: data.rickySubject,
        html: data.rickyBody,
      });

      return res.status(200).json({
        success: true,
        clientEmail: clientEmail.data.id,
        adminEmail: adminEmail.data.id,
      });
    }
  } catch (error) {
    console.error('Error enviando email:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ═══════════════════════════════════════════════════════
// OPCIÓN 2: Actualizar el cliente para usar el backend
// ═══════════════════════════════════════════════════════

// js/resend/email.js (VERSIÓN CON BACKEND)
export async function sendBookingEmails(data, emails) {
  try {
    console.log('📧 Enviando emails a través del backend...');

    // El cliente llama al backend, no a Resend directamente
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'booking-confirmation',
        data: {
          email: data.email,
          clientSubject: emails.clientSubject,
          clientBody: emails.clientBody,
          rickySubject: emails.rickySubject,
          rickyBody: emails.rickyBody,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error enviando emails');
    }

    const result = await response.json();
    console.log('✓ Emails enviados desde backend');
    return {
      success: true,
      clientEmail: { id: result.clientEmail },
      rickyEmail: { id: result.adminEmail },
    };
  } catch (error) {
    console.error('❌ Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ═══════════════════════════════════════════════════════
// OPCIÓN 3: Serverless (Vercel Functions)
// ═══════════════════════════════════════════════════════

// api/send-email.js (en Vercel automáticamente es endpoint)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, emails } = req.body;

    // Email al cliente
    await resend.emails.send({
      from: 'Ricky Barber <noreply@rickybarbershop.com>',
      to: data.email,
      subject: emails.clientSubject,
      html: buildHtmlEmail(emails.clientBody, 'client'),
    });

    // Email a admin
    await resend.emails.send({
      from: 'Sistema <sistema@rickybarbershop.com>',
      to: process.env.ADMIN_EMAIL || 'ricky@rickybarbershop.com',
      subject: emails.rickySubject,
      html: buildHtmlEmail(emails.rickyBody, 'admin'),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ═══════════════════════════════════════════════════════
// VARIABLES DE ENTORNO DEL BACKEND
// ═══════════════════════════════════════════════════════

/*
En tu .env.local O en Vercel Environment Variables:

RESEND_API_KEY=re_TU_API_KEY_AQUI
ADMIN_EMAIL=ricky@rickybarbershop.com
*/

// ═══════════════════════════════════════════════════════
// COMPARACIÓN: Cliente vs Backend
// ═══════════════════════════════════════════════════════

/*

OPCIÓN A: Cliente (Actual - Funciona pero menos seguro)
┌─────────────┐
│   Browser   │
│  API Key ✓  │ ← API key visible en .env.local (pero en navegador)
│  Resend API │
└─────────────┘

OPCIÓN B: Backend (Recomendado para producción)
┌─────────────┐       ┌──────────────┐
│   Browser   │──────→│   Backend    │
│  (sin key)  │       │  API Key ✓   │ ← API key segura en servidor
│             │←──────│  Resend API  │
└─────────────┘       └──────────────┘

Ventajas Backend:
✅ API key nunca se expone al navegador
✅ Validación server-side
✅ Rate limiting
✅ Logs centralizados
✅ Mejor para producción

Desventajas Backend:
❌ Requiere servidor
❌ Más complejo de configurar
❌ Costo adicional (si usas servidor)

Recomendación:
→ Para MVP: Usa cliente (actual)
→ Para producción: Usa backend (Vercel Functions es gratis)
*/

// ═══════════════════════════════════════════════════════
// INSTALACIÓN: NPM (si usas backend con Node.js)
// ═══════════════════════════════════════════════════════

/*
npm install resend

Luego importa en tu archivo de backend:
import { Resend } from 'resend';
*/
