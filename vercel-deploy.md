# Guía de Despliegue en Vercel - Antigua Hotels

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en el dashboard de Vercel:

### Base de Datos
```
DATABASE_URL=mysql://username:password@host:port/database_name
```

### NextAuth
```
NEXTAUTH_SECRET=tu-secreto-de-produccion-aqui
NEXTAUTH_URL=https://tu-app.vercel.app
```

### Cloudinary
```
CLOUDINARY_CLOUD_NAME=tu-cloudinary-cloud-name
CLOUDINARY_API_KEY=tu-cloudinary-api-key
CLOUDINARY_API_SECRET=tu-cloudinary-api-secret
```

### Pasarelas de Pago
```
STRIPE_SECRET_KEY=tu-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=tu-stripe-publishable-key
PAYPAL_CLIENT_ID=tu-paypal-client-id
PAYPAL_CLIENT_SECRET=tu-paypal-client-secret
```

### Notificaciones
```
RESEND_API_KEY=tu-resend-api-key
RESEND_FROM_EMAIL=noreply@antiguahotels.com
NOTIFICATION_ENABLED=true
ADMIN_EMAIL=admin@antiguahotels.com
DASHBOARD_URL=https://tu-app.vercel.app/dashboard
```

### Configuración de Producción
```
NODE_ENV=production
SKIP_ENV_VALIDATION=true
```

## Pasos para el Despliegue

1. **Preparar la base de datos:**
   - Configura una base de datos MySQL en producción (PlanetScale, AWS RDS, etc.)
   - Ejecuta las migraciones de Prisma

2. **Configurar variables de entorno:**
   - Ve al dashboard de Vercel
   - Selecciona tu proyecto
   - Ve a Settings > Environment Variables
   - Agrega todas las variables listadas arriba

3. **Desplegar:**
   ```bash
   # Opción 1: Desde la terminal
   vercel --prod
   
   # Opción 2: Desde GitHub (recomendado)
   # Conecta tu repositorio a Vercel y despliega automáticamente
   ```

4. **Verificar el despliegue:**
   - Revisa los logs de build en Vercel
   - Prueba las funcionalidades principales
   - Verifica que la base de datos esté conectada

## Comandos de Build

```bash
# Instalar dependencias
npm ci

# Generar cliente de Prisma
npx prisma generate

# Hacer build de producción
npm run build

# Iniciar en modo producción
npm start
```

## Solución de Problemas

### Error de conexión a base de datos
- Verifica que la URL de la base de datos sea correcta
- Asegúrate de que la base de datos permita conexiones externas
- Revisa los logs de Vercel para errores específicos

### Error de Prisma
- Ejecuta `npx prisma generate` localmente
- Verifica que el schema.prisma esté actualizado
- Revisa que todas las migraciones estén aplicadas

### Error de variables de entorno
- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de que los valores no tengan espacios extra
- Revisa que las variables estén disponibles en el entorno de producción