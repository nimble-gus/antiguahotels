# Configuración de Variables de Entorno en Vercel

## Variables Críticas para el Dashboard de Administrador

Para que el dashboard de administrador funcione en producción, necesitas configurar estas variables de entorno en Vercel:

### 1. Acceder a la Configuración de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto `antiguahotelstours`
4. Ve a **Settings** → **Environment Variables**

### 2. Variables de Entorno Requeridas

#### Base de Datos
```
DATABASE_URL=mysql://username:password@host:port/database_name
```

#### NextAuth (CRÍTICO para autenticación)
```
NEXTAUTH_SECRET=tu-secreto-super-seguro-aqui
NEXTAUTH_URL=https://antiguahotelstours-3kv4scojy-gustavo-ortizs-projects.vercel.app
```

#### Cloudinary (para imágenes)
```
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

#### Stripe (para pagos)
```
STRIPE_SECRET_KEY=sk_live_tu-clave-secreta
STRIPE_PUBLISHABLE_KEY=pk_live_tu-clave-publica
```

#### Email (Resend)
```
RESEND_API_KEY=tu-resend-api-key
RESEND_FROM_EMAIL=noreply@antiguahotels.com
```

#### Notificaciones
```
ADMIN_EMAIL=admin@antiguahotels.com
DASHBOARD_URL=https://antiguahotelstours-3kv4scojy-gustavo-ortizs-projects.vercel.app/dashboard
NOTIFICATION_ENABLED=true
```

### 3. Pasos para Configurar

1. **Copiar cada variable** de tu archivo `.env` local
2. **Pegar en Vercel** con el nombre exacto y el valor
3. **Asegurarse** de que `NEXTAUTH_URL` apunte a tu dominio de Vercel
4. **Guardar** los cambios
5. **Redesplegar** el proyecto

### 4. Verificar la Configuración

Después de configurar las variables:

1. Ve a tu proyecto en Vercel
2. Haz clic en **Deployments**
3. Haz clic en **Redeploy** en el último despliegue
4. Espera a que termine el despliegue
5. Prueba el login con las credenciales:
   - Email: `admin@antiguahotels.com`
   - Password: `admin123`

### 5. Credenciales de Prueba

Si necesitas crear un nuevo usuario administrador, puedes usar:

- **Email**: `admin@antiguahotels.com`
- **Password**: `admin123`

O crear uno nuevo ejecutando:
```bash
node scripts/create-admin-user.js
```

### 6. Solución de Problemas

Si el login sigue sin funcionar:

1. **Verifica los logs** en Vercel (Deployments → View Function Logs)
2. **Confirma** que `DATABASE_URL` apunte a la base de datos correcta
3. **Asegúrate** de que `NEXTAUTH_SECRET` sea una cadena larga y aleatoria
4. **Verifica** que `NEXTAUTH_URL` sea exactamente la URL de tu proyecto

### 7. Variables Opcionales

Estas variables no son críticas para el login pero mejoran la funcionalidad:

```
OPENAI_API_KEY=tu-openai-key
PAYPAL_CLIENT_ID=tu-paypal-id
PAYPAL_CLIENT_SECRET=tu-paypal-secret
WEBSOCKET_PORT=3001
```

---

**Nota**: Después de configurar las variables de entorno, es importante redesplegar el proyecto para que los cambios surtan efecto.
