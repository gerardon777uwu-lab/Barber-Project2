# ❓ PREGUNTAS FRECUENTES - RESEND

## 🔧 CONFIGURACIÓN

### P: ¿Dónde obtengo mi API key de Resend?
**R:** 
1. Ve a [resend.com/dashboard](https://resend.com/dashboard)
2. Haz clic en "API Keys" en la barra lateral
3. Haz clic en "Create API Key"
4. Copia la key (comienza con `re_`)

### P: ¿Necesito verificar mi dominio?
**R:** Depende del uso:
- **Testing**: Usa `@resend.dev` (no requiere verificación)
- **Producción**: Verifica tu dominio en Resend dashboard
- **Tiempo**: Hasta 48 horas para verificar

### P: ¿Las API keys que compartiste en el chat son peligro?
**R:** **SÍ, CRÍTICO.** Debes:
1. Ir a Resend dashboard inmediatamente
2. Eliminar esas keys
3. Generar nuevas keys
4. Actualizar `.env.local`

Alguien podría:
- Enviar emails a tu nombre
- Usar tu quota de emails
- Suplantar tus comunicaciones

### P: ¿Qué diferencia hay entre `VITE_` y otras variables?
**R:** 
- `VITE_` = Variables públicas (accesibles en el navegador)
- Sin prefijo = Variables privadas del servidor
- En Vite, solo las variables con `VITE_` se inyectan en el cliente

### P: ¿Puedo usar la misma API key para cliente y admin?
**R:** Sí, ambos emails usan la misma key. Si quieres separar:
1. Crea 2 keys en Resend
2. Agrega dos variables: `VITE_RESEND_API_KEY_CLIENT` y `VITE_RESEND_API_KEY_ADMIN`
3. Modifica `js/resend/email.js` para usar la key apropiada

---

## 📧 EMAILS

### P: ¿Por qué se envían 2 emails?
**R:** 
- **Email 1**: Al cliente, confirma su cita
- **Email 2**: A Ricky, le notifica de nueva reserva
Esto es normal y útil para gestión.

### P: ¿Puedo personalizar el HTML del email?
**R:** Sí, edita la función `buildHtmlEmail()` en `js/resend/email.js`:
```javascript
function buildHtmlEmail(bodyContent, type) {
  // Modifica colores, fuentes, etc.
  const bgColor = type === 'admin' ? '#0a0a0a' : '#0d0d0d';
  // ...
}
```

### P: ¿Por qué mis emails llegan en la bandeja de spam?
**R:** Posibles causas:
1. **Dominio no verificado** → Verifica en Resend
2. **Configuración SPF/DKIM incorrecta** → Revisa DNS
3. **Contenido sospechoso** → Evita links o scripts
4. **Nuevo dominio** → Toma 1-2 semanas para confianza

**Solución**: Usa `@resend.dev` para testing

### P: ¿Los emails tienen tracking?
**R:** Resend añade automáticamente:
- Opens tracking (pixel invisible)
- Link tracking
- Bounce tracking

Ve a Resend dashboard → Analytics para ver stats.

### P: ¿Puedo enviar emails en HTML con CSS?
**R:** Sí, pero usa **CSS inline** (sin `<style>` tags):
```html
<!-- ✅ BIEN -->
<p style="color: red; font-weight: bold;">Texto</p>

<!-- ❌ MAL -->
<style>p { color: red; }</style>
```

---

## 🧪 TESTING & DEBUGGING

### P: Recibo error "API key no disponible"
**R:** Verifica:
1. `.env.local` existe en la carpeta raíz
2. Tiene `VITE_RESEND_API_KEY=re_...`
3. Recargaste la página (F5)
4. No hay espacios en blanco en la key

### P: Recibo error 401 "Unauthorized"
**R:** La API key es inválida. Soluciones:
1. Verifica que copied completo (sin espacios)
2. Genera una nueva key en Resend
3. Comprueba que no está expirada

### P: Recibo error 422 "Invalid email address"
**R:** El email no es válido. Causas:
1. Dominio no verificado en Resend
2. Usando dominio privado sin verificar
3. Email con caracteres especiales

**Solución**: Usa `@resend.dev` para testing

### P: El email se envía pero no llega
**R:** Verifica:
1. Resend dashboard → Activity (busca el email)
2. Gmail: Mira en "Todas las etiquetas" o spam
3. Si aparece "Bounced": Email inválido o dominio no verificado
4. Si aparece "Complaint": Marcado como spam

### P: ¿Cómo veo los logs de los emails?
**R:**
- **Cliente**: Abre F12 → Consola → Busca "Resend"
- **Servidor**: Resend dashboard → Activity
- **Firebase**: Firebase console → Firestore

---

## 💰 COSTOS

### P: ¿Cuánto cuesta Resend?
**R:**
- **Gratis**: 100 emails/día (suficiente para testing)
- **Pagado**: $20/mes (3000 emails/mes)
- **Pro**: $50/mes (10000 emails/mes)
- **Más**: Custom pricing

### P: ¿EmailJS era más caro?
**R:** Sí:
- EmailJS: €20-49/mes (depende del plan)
- Resend: $20/mes
- **Ahorro: ~50% menos**

---

## 🔐 SEGURIDAD

### P: ¿Es seguro tener la API key en el cliente?
**R:** No es ideal, pero:
- ✅ Esta dentro de `.env.local` (no en Git)
- ✅ No visible en el código publicado
- ⚠️ Visible en dev tools del navegador
- ✅ Alternativa: Usar backend (ver `API_BACKEND_RESEND.js`)

### P: ¿Alguien puede robar mi API key?
**R:** 
- **Si**: Alguien con acceso a tu `.env.local`
- **Si**: Inspecciona el tráfico de red
- **Si**: Tú la compartes en chat/código público

**Protección**:
1. Nunca compartas en chat
2. Mantén `.env.local` en `.gitignore`
3. Rota keys regularmente
4. Usa backend para producción

### P: ¿Qué pasa si alguien roba mi API key?
**R:** Pueden:
- Enviar emails a tu nombre
- Usar tu quota
- Impersonarte

**Acción inmediata**:
1. Ve a Resend dashboard
2. Elimina la key comprometida
3. Genera una nueva
4. Actualiza `.env.local`

---

## 🚀 DEPLOYMENT

### P: ¿Cómo configuro en Vercel?
**R:**
1. Ve a vercel.com → Tu proyecto
2. Settings → Environment Variables
3. Agrega:
   ```
   VITE_RESEND_API_KEY=re_...
   VITE_CLIENT_EMAIL=...
   VITE_ADMIN_EMAIL=...
   ```
4. Redeploy

### P: ¿Necesito variables diferentes para dev y prod?
**R:** Sí, es mejor práctica:
- **Dev**: `.env.local` (para testing local)
- **Prod**: Vercel Environment Variables (para production)

Ambas pueden usar la misma key o keys diferentes.

### P: ¿Cómo testeo localmente si mi dominio no está verificado?
**R:** Usa el dominio temporal de Resend:
```env
VITE_RESEND_API_KEY=re_...
VITE_CLIENT_EMAIL=tu-nombre@resend.dev
VITE_ADMIN_EMAIL=ricky@resend.dev
```

---

## 🐛 ERRORES COMUNES

### "sendBookingEmails is not defined"
→ Verifica que `index.html` importa correctamente:
```javascript
import { sendBookingEmails } from "./js/resend/email.js";
```

### "Fetch failed: Network error"
→ Problema de CORS o conexión
→ Verifica tu internet
→ Resend está caído? Mira [status.resend.com](https://status.resend.com)

### "No hay variable de entorno VITE_RESEND_API_KEY"
→ `.env.local` no existe o no está en la carpeta raíz
→ Verifica ruta: `./Desktop/Barber Project/.env.local`

### "Firebase error: permission-denied"
→ No es culpa de Resend
→ Revisa Firebase Firestore rules
→ Mira Firebase console

---

## 📞 AYUDA

- **Resend Support**: [resend.com/support](https://resend.com/support)
- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Discord**: [resend.dev community](https://discord.gg/resend)
- **Status**: [status.resend.com](https://status.resend.com)

---

## ✅ CHECKLIST RÁPIDO

```
□ API key generada en Resend
□ Keys antiguas eliminadas ⚠️
□ .env.local configurado
□ Verifica que .gitignore tiene .env.local
□ Testea en desarrollo (F12 → Consola)
□ ¿Ves "Emails enviados exitosamente"?
□ Verifica Resend dashboard → Activity
□ Configura Vercel si está en producción
□ ¿Ya no funciona EmailJS? ✓
□ ¿Todos los emails llegan? ✓
```

---

**Última actualización**: 2024
**Versión**: 2.0 (Resend)
