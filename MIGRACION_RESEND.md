# 📧 MIGRACIÓN DE EmailJS A RESEND

## ⚠️ SEGURIDAD CRÍTICA

**Las API keys que compartiste están comprometidas.** Debes:

1. Ir a [resend.com/api-keys](https://resend.com/api-keys)
2. **Eliminar las keys actuales** inmediatamente
3. Generar **nuevas keys**
4. Configurarlas en `.env.local` (nunca las compartas de nuevo)

---

## ✅ PASOS DE CONFIGURACIÓN

### 1. Crear cuenta en Resend (si no tienes)
- Ve a [resend.com](https://resend.com)
- Regístrate o inicia sesión
- Verifica tu email

### 2. Obtener la API Key
1. En el dashboard, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Dale un nombre: `Ricky Barber Web`
4. **Copia la key** (comienza con `re_`)
5. **Guárdala en un lugar seguro** (no en chat)

### 3. Verificar dominio (IMPORTANTE)
Resend requiere verificar tu dominio para enviar emails:

**Opción A: Usar dominio de Resend (más fácil, para testing)**
```
rickybarbershop@resend.dev
```

**Opción B: Usar tu dominio propio**
1. En Resend dashboard → **Domains**
2. Haz clic en **Add Domain**
3. Ingresa: `rickybarbershop.com`
4. Resend te dará registros DNS para agregar
5. Agrega esos registros en tu proveedor de dominio
6. Espera a que Resend verifique (puede tomar 24-48h)

### 4. Configurar `.env.local`
Abre `.env.local` y completa:

```env
VITE_RESEND_API_KEY=re_TU_NUEVA_API_KEY_AQUI
VITE_CLIENT_EMAIL=ricky@rickybarbershop.com
VITE_ADMIN_EMAIL=ricky@rickybarbershop.com
VITE_EMAIL_FROM_DOMAIN=rickybarbershop.com
```

**Ejemplo real:**
```env
VITE_RESEND_API_KEY=re_4y8p96wm_QbHKoUskMKRLdzN5uQaLpVdF
VITE_CLIENT_EMAIL=ricky@rickybarbershop.com
VITE_ADMIN_EMAIL=ricky@rickybarbershop.com
VITE_EMAIL_FROM_DOMAIN=rickybarbershop.com
```

---

## 🔧 CÓMO FUNCIONA

### Dos emails automáticos:

#### 1️⃣ Email al Cliente
```
De: Ricky Barber <noreply@rickybarbershop.com>
Para: email del cliente
Asunto: ✅ Cita confirmada — Servicio · Fecha
```
- Confirma que su cita fue registrada
- Muestra detalles (fecha, hora, precio)
- Incluye instrucciones

#### 2️⃣ Email a Ricky (Admin)
```
De: Ricky Barber Sistema <sistema@rickybarbershop.com>
Para: ricky@rickybarbershop.com
Asunto: NUEVO TURNO — SERVICIO · Fecha Hora
```
- Notifica nuevas reservas
- Incluye detalles del cliente y notas

---

## 📂 ARCHIVOS MODIFICADOS

- ✅ `js/resend/email.js` - Módulo nuevo de Resend
- ✅ `.env.local` - Variables de entorno (agregadas)
- ✅ `index.html` - Reemplazó EmailJS con Resend
- ✅ `.gitignore` - Protege `.env.local`

---

## 🧪 TESTING

### Opción 1: Usar dominio temporal de Resend
```env
VITE_RESEND_API_KEY=re_TU_API_KEY
VITE_CLIENT_EMAIL=test@resend.dev
VITE_ADMIN_EMAIL=test@resend.dev
```
- Útil para testing rápido
- Resend crea una dirección para cada dominio

### Opción 2: Usar mailbox de prueba
Resend proporciona:
- `delivered@resend.dev` - para testing
- `bounce@resend.dev` - para simular rebotes
- `complaint@resend.dev` - para simular quejas

---

## ❌ SOLUCIÓN DE PROBLEMAS

### "Error: API key no disponible"
- ✅ Verifica que `.env.local` existe
- ✅ Que tenga `VITE_RESEND_API_KEY=` completado
- ✅ Recarga la página (F5)

### "Error 401: Unauthorized"
- ✅ La API key es inválida o expiró
- ✅ Genera una nueva en Resend dashboard

### "Error 422: Invalid email address"
- ✅ El dominio no está verificado en Resend
- ✅ Verifica registros DNS si usas dominio propio
- ✅ Usa `@resend.dev` para testing temporal

### "Email no se envía"
- ✅ Revisa la consola del navegador (F12)
- ✅ Mira el dashboard de Resend → **Activity**
- ✅ Verifica que `buildEmails()` esté funcionando

---

## 📊 MONITOREO

En Resend dashboard puedes ver:
- **Activity**: todos los emails enviados
- **Emails**: historial de emails
- **Bounces**: emails rebotados
- **Analytics**: estadísticas de entrega

---

## 🔐 SEGURIDAD (IMPORTANTE)

### ✅ Lo que hicimos bien:
- API keys en `.env.local` (no en código)
- `.env.local` en `.gitignore` (no sube a Git)
- Variables de entorno con prefijo `VITE_`

### ⚠️ Para producción en Vercel:
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Agrega:
   ```
   VITE_RESEND_API_KEY=re_TU_API_KEY
   VITE_CLIENT_EMAIL=...
   VITE_ADMIN_EMAIL=...
   ```
4. Redeploy

### 🚨 NUNCA:
- ❌ Compartas API keys en chat
- ❌ Comitees `.env.local` a Git
- ❌ Uses la misma key en desarrollo y producción
- ❌ Expongas keys en URLs o formularios

---

## 📞 CONTACTO RESEND

- Dashboard: [resend.com/dashboard](https://resend.com/dashboard)
- Docs: [resend.com/docs](https://resend.com/docs)
- Status: [status.resend.com](https://status.resend.com)

---

## ✨ NEXT STEPS

1. [x] Migración técnica completada
2. [ ] Generar nuevas API keys en Resend
3. [ ] Verificar dominio (si usas propio)
4. [ ] Configurar `.env.local`
5. [ ] Testear envío de emails
6. [ ] Configurar en Vercel (si está en producción)
