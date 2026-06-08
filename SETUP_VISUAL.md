# SETUP VISUAL - 15 MINUTOS

## 🎯 Objetivo
Integrar el nuevo sistema modular en tu website en 15 minutos sin complicaciones.

---

## ✅ CHECKLIST PRE-SETUP

- [ ] Tienes acceso a Firebase Console
- [ ] Tu proyecto Firebase está creado (`ricky-barbershop`)
- [ ] VS Code o editor de texto abierto
- [ ] Archivo `index.html` accesible

---

## 🚀 PASO 1: INTEGRACIÓN EN HTML (3 minutos)

### 1.1 Abrir `index.html` en tu editor

### 1.2 Ir al final del archivo (Ctrl+End)

Deberías ver algo como:

```html
...
</section>

<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword } from ...
  // MUCHO CÓDIGO
</script>

</body>
</html>
```

### 1.3 REEMPLAZAR TODO el `<script type="module">` con esto:

```html
<!-- ══════════════════════════════════════════════════════════
     NUEVO SISTEMA MODULAR
     ══════════════════════════════════════════════════════════ -->
<script type="module">
  import { initApp } from './js/main.js';
</script>
```

### ✅ Listo Paso 1

Ahora guarda el archivo (Ctrl+S)

---

## 🔐 PASO 2: FIREBASE AUTHENTICATION (5 minutos)

### 2.1 Abre Firebase Console
```
https://console.firebase.google.com
```

### 2.2 Selecciona tu proyecto
```
→ ricky-barbershop (o tu nombre)
```

### 2.3 Habilitar Email/Password

En el menú izquierdo:
```
Authentication (🔐)
  ↓
Sign-in method
  ↓
Email/Password → Habilitar
  ↓
Guardar
```

### ✅ Listo: Email/Password habilitado

---

## 👤 PASO 3: CREAR USUARIO ADMIN (3 minutos)

### 3.1 En Authentication > Users

Click en **"Add user"** (botón azul arriba)

### 3.2 Completar formulario

```
Email:     admin@rickybarbershop.com
Password:  [generar fuerte, copiar]
```

Ejemplo de password fuerte:
```
Ricky_2024_AdminBCN_Secure123
```

### 3.3 Click "Create user"

### 3.4 **IMPORTANTE: Copiar el UID**

En la lista de usuarios, verás un ID largo (UID).

Ejemplo:
```
abc123def456ghi789jkl012mno345pqr
```

**Cópialo, lo necesitarás en el próximo paso**

### ✅ Listo: Usuario admin creado

---

## 🏷️ PASO 4: ASIGNAR ROL ADMIN (4 minutos)

### 4.1 Ir a Firestore Database

En el menú izquierdo:
```
Firestore Database (📊)
```

### 4.2 Si no existe, crear una

Click **"Create database"**
- Modo: **Production**
- Ubicación: Tu región
- Click **"Create"**

### 4.3 Crear colección "usuarios"

En Firestore:
- Click **"+ Add collection"**
- Nombre: `usuarios`
- Click **"Next"**

### 4.4 Agregar documento

- Document ID: **[El UID que copiaste del Paso 3.4]**
- Campos a agregar:
  ```
  email:     admin@rickybarbershop.com    (string)
  role:      admin                        (string)
  createdAt: [genera automáticamente]     (timestamp)
  ```
- Click **"Save"**

### Resultado esperado:

```
usuarios/
  └── abc123def456ghi789jkl012mno345pqr/
      ├── email: "admin@rickybarbershop.com"
      ├── role: "admin"
      └── createdAt: 2026-06-07 14:30:00
```

### ✅ Listo: Rol admin asignado

---

## 🧪 PASO 5: PRUEBA (hasta 15 minutos)

### 5.1 Abrir navegador

```
http://localhost:3000
(o tu URL local/producción)
```

### 5.2 Abrir Console (F12)

Deberías ver en la consola:
```
✓ Aplicación inicializada correctamente
✓ Sistema de reservas listo
```

Si ves errores, ir a **Sección: TROUBLESHOOTING** abajo.

### 5.3 Probar Booking

- Scroll a "Reservar Cita"
- Llenar formulario:
  - Servicio: Corte Normal
  - Día: Mañana (o próxima semana)
  - Hora: 16:00
  - Nombre: Test User
  - Teléfono: +34 612 345 678
  - Email: test@example.com
- Click **"Reservar mi turno →"**
- Deberías ver modal de confirmación ✅

### 5.4 Probar Admin Panel

- Click en logo **"RICKY."** (arriba izquierda)
- Deberías ver modal de login
- Ingresa:
  ```
  Email:    admin@rickybarbershop.com
  Password: [La que creaste en Paso 3.2]
  ```
- Click **"ENTRAR"**
- Deberías ver:
  ```
  ┌──────────────────────────────┐
  │ TOTAL: X  PENDIENTES: X      │
  │                              │
  │ [Tabla de reservas abajo]    │
  └──────────────────────────────┘
  ```

### ✅ ¡LISTO! Sistema funcionando 🎉

---

## 🆘 TROUBLESHOOTING

### ❌ Error: "auth/invalid-api-key"

**Causa:** Firebase config mal

**Solución:**
1. Abre `js/firebase/config.js`
2. Verifica que el `projectId` coincida con tu proyecto Firebase
3. Recarga el navegador (Ctrl+Shift+R)

---

### ❌ Error: "auth/permission-denied"

**Causa:** Reglas de Firestore muy restrictivas

**Solución:**
1. Ir a Firestore Database → Reglas
2. Reemplazar con:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Publicar

---

### ❌ Error: "usuario no existe" en admin login

**Causa:** Usuario admin no creado o rol mal asignado

**Solución:**
1. Ir a Firebase Console
2. Authentication → verificar que el usuario existe
3. Firestore → usuarios → verificar que existe documento con UID del usuario
4. Verificar que campo `role` = "admin"

---

### ❌ La tabla está vacía después de login admin

**Causa:** Normal si es primera vez

**Solución:**
1. Crea una reserva de prueba (Paso 5.3)
2. El admin panel debe mostrarla automáticamente

---

### ❌ Booking form no valida

**Causa:** Podría ser varios

**Soluciones:**
1. Abrir F12 → Console → buscar errores rojo
2. Revisar que el teléfono esté en formato español: +34 6XX XXX XXX
3. Revisar que email sea válido

---

### ❌ Toast notifications no aparecen

**Causa:** CSS no cargó

**Solución:**
1. Abrir F12 → Network
2. Buscar `toast.css`
3. Si no está, revisar ruta en `js/main.js`

---

## 📋 VERIFICACIÓN FINAL

Después del setup, deberías poder:

- [ ] Rellenar formulario de reserva
- [ ] Recibir confirmación
- [ ] Ver modal bonito
- [ ] Login como admin con "RICKY."
- [ ] Ver tabla de reservas
- [ ] Ver estadísticas en tiempo real
- [ ] Buscar reserva en admin
- [ ] Aceptar/Rechazar reserva
- [ ] Exportar a CSV
- [ ] Sin errores en consola

Si todo está ✅, **¡FELICIDADES! El sistema está 100% funcional.**

---

## 🎯 PRÓXIMAS ACCIONES

### Inmediato (HOY)
- [x] Integrar script en HTML
- [x] Configurar Firebase
- [x] Probar sistema

### Próxima semana
- [ ] Cambiar password admin por algo más fuerte
- [ ] Agregar más usuarios admin si es necesario
- [ ] Hacer backup de datos
- [ ] Enviar link a tu hosting/dominio

### Próximo mes
- [ ] Agregar SMS recordatorios (opcional)
- [ ] Aumentar límite de reservas si alcanzas máximo
- [ ] Hacer análisis de datos

---

## 📚 DOCUMENTACIÓN

Si necesitas más detalles:

```
📖 RESUMEN_FINAL.md              ← Start here
📖 GUÍA_CONFIGURACIÓN.md         ← Setup detallado
📖 INSTRUCCIONES_INTEGRACIÓN.md  ← Integración HTML
📖 REFACTORIZACIÓN_CHANGELOG.md  ← Todo lo que cambió
```

---

## ✨ TIPS PRO

1. **Password fuerte para admin:**
   ```
   [Nombre]_[Año]_[Ciudad]_[Número aleatorio]
   Ejemplo: Ricky_2024_Barcelona_9876
   ```

2. **Backup automático:**
   - Firestore tiene backup automático en Google Cloud

3. **Múltiples admins:**
   - Simplemente crear más usuarios en Firebase
   - Asignar rol `admin` en Firestore

4. **Ver logs:**
   - F12 → Console → Buscar mensajes con ✓ y ✗

5. **Mobile testing:**
   - F12 → Ctrl+Shift+M (toggle device)
   - Probar en móvil antes de publicar

---

## 🎊 ¡LISTO!

Todo el setup en 15 minutos.

Tu sistema está:
- ✅ Seguro
- ✅ Moderno
- ✅ Profesional
- ✅ Funcionando

**¡A usar y disfrutar!** 🚀

---

Última actualización: 2026-06-07  
Versión: 1.0  
Estado: ✅ Verificado
