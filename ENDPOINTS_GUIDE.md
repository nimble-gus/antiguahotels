# 📚 Guía de Endpoints y Funcionalidades del Proyecto

Esta guía explica cómo funcionan los endpoints de la aplicación y cómo usar la funcionalidad de "Volvemos Pronto".

## 🏗️ Estructura General del Proyecto

Este es un proyecto **Next.js 14** con App Router que incluye:

- **Frontend**: React con TypeScript y Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: MySQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Middleware**: Manejo de rutas protegidas y modo mantenimiento

## 🔐 Tipos de Endpoints

### Endpoints Públicos (`/api/public/*`)

Los endpoints públicos son accesibles sin autenticación y están disponibles para el frontend público:

- **`/api/public/activities`** - Lista todas las actividades activas
- **`/api/public/activities/[id]`** - Detalle de una actividad específica
- **`/api/public/featured-activities`** - Actividades destacadas (para la página de inicio)
- **`/api/public/packages`** - Lista todos los paquetes activos
- **`/api/public/packages/[id]`** - Detalle de un paquete específico
- **`/api/public/reservations`** - Crear reservaciones públicas
- **`/api/public/settings`** - Configuraciones públicas (footer, etc.)
- **`/api/public/shuttle`** - Información sobre shuttle service
- **`/api/public/website-images`** - Imágenes del sitio web

#### Ejemplo de uso:

```typescript
// Obtener actividades destacadas
const response = await fetch('/api/public/featured-activities')
const data = await response.json()
// data.activities contiene el array de actividades
```

### Endpoints Protegidos (`/api/dashboard/*` y `/api/*` sin /public)

Los endpoints protegidos requieren autenticación y están disponibles solo para administradores:

- **`/api/dashboard/stats`** - Estadísticas del dashboard
- **`/api/activities`** - CRUD de actividades (GET, POST, PUT, DELETE)
- **`/api/hotels`** - CRUD de hoteles
- **`/api/packages`** - CRUD de paquetes
- **`/api/reservations`** - Gestión de reservaciones
- **`/api/payments`** - Gestión de pagos
- **`/api/settings`** - Configuraciones del sistema
- Y muchos más...

#### Autenticación

Los endpoints protegidos requieren autenticación mediante NextAuth. El middleware verifica automáticamente si el usuario tiene una sesión válida.

## 🛠️ Modo Mantenimiento / "Volvemos Pronto"

### ¿Qué es?

El modo mantenimiento permite mostrar una página "Volvemos Pronto" a los usuarios públicos mientras se mantienen accesibles las rutas del dashboard para administradores.

### Cómo Activar el Modo Mantenimiento

1. **Configurar la variable de entorno:**

   En tu archivo `.env` o en las variables de entorno de Vercel:

   ```env
   MAINTENANCE_MODE=true
   # O alternativamente:
   SERVICE_PAUSED=true
   ```

2. **El sistema automáticamente:**
   - Redirige a todos los usuarios públicos a `/maintenance`
   - Mantiene accesibles las rutas `/dashboard`, `/auth` y `/api/dashboard`
   - Muestra una página atractiva con el mensaje "Volvemos Pronto"

### Rutas Permitidas en Modo Mantenimiento

Incluso cuando el modo mantenimiento está activo, estas rutas siguen funcionando:

- `/dashboard/*` - Dashboard de administradores
- `/auth/*` - Páginas de autenticación
- `/api/auth/*` - Endpoints de autenticación
- `/api/dashboard/*` - Endpoints del dashboard
- `/maintenance` - La página de mantenimiento misma

### Cómo Funciona Técnicamente

El middleware (`src/middleware.ts`) verifica la variable de entorno `MAINTENANCE_MODE` o `SERVICE_PAUSED`:

1. Si está en `"true"`, intercepta todas las rutas excepto las permitidas
2. Redirige a `/maintenance` si la ruta no está permitida
3. Aplica autenticación solo a rutas protegidas

### Desactivar el Modo Mantenimiento

Simplemente cambia la variable de entorno a `false` o elimínala:

```env
MAINTENANCE_MODE=false
# O simplemente comenta o elimina la línea
```

Después de cambiar, el sitio volverá a funcionar normalmente.

## 📍 Principales Endpoints Públicos

### Actividades

```typescript
// GET /api/public/activities
// Parámetros query opcionales:
// - page: número de página (default: 1)
// - limit: items por página (default: 9)
// - search: búsqueda por nombre
// - difficulty: nivel de dificultad
// - minPrice, maxPrice: filtro por precio

const response = await fetch('/api/public/activities?page=1&limit=9')
const { activities, pagination } = await response.json()
```

### Paquetes

```typescript
// GET /api/public/packages
// Similar estructura a actividades con paginación y filtros

const response = await fetch('/api/public/packages')
const { packages, pagination } = await response.json()
```

### Actividades Destacadas

```typescript
// GET /api/public/featured-activities
// Retorna actividades marcadas como "featured" (destacadas)
// Usado en la página de inicio

const response = await fetch('/api/public/featured-activities')
const { activities, totalCount } = await response.json()
```

### Configuraciones Públicas

```typescript
// GET /api/public/settings
// Retorna configuraciones públicas del footer y otros elementos

const response = await fetch('/api/public/settings')
const { settings } = await response.json()
```

## 🔧 Endpoints del Dashboard (Protegidos)

### Estadísticas

```typescript
// GET /api/dashboard/stats
// Requiere autenticación
// Retorna estadísticas generales del dashboard

const response = await fetch('/api/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const stats = await response.json()
```

### Gestión de Actividades

```typescript
// GET /api/activities - Lista todas las actividades
// POST /api/activities - Crea una nueva actividad
// GET /api/activities/[id] - Obtiene una actividad
// PUT /api/activities/[id] - Actualiza una actividad
// DELETE /api/activities/[id] - Elimina una actividad

// Ejemplo: Crear actividad
const response = await fetch('/api/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Tour al Volcán',
    description: '...',
    basePrice: 50,
    // ... más campos
  })
})
```

## 🗄️ Base de Datos

El proyecto usa **Prisma ORM** con MySQL. El schema está en `prisma/schema.prisma`.

### Modelos Principales

- **Activities** - Actividades turísticas
- **Packages** - Paquetes turísticos
- **Hotels** - Hoteles
- **Rooms** - Habitaciones
- **RoomTypes** - Tipos de habitaciones
- **Reservations** - Reservaciones
- **AdminUser** - Usuarios administradores
- **SystemSetting** - Configuraciones del sistema

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Base de datos
npm run db:push      # Sincronizar schema con BD
npm run db:studio    # Abrir Prisma Studio
npm run db:generate  # Generar cliente Prisma
```

## 📝 Variables de Entorno Importantes

```env
# Base de datos
DATABASE_URL="mysql://..."

# Autenticación
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Modo mantenimiento
MAINTENANCE_MODE="false"
SERVICE_PAUSED="false"

# Cloudinary (imágenes)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Stripe (pagos)
STRIPE_SECRET_KEY="..."
STRIPE_PUBLISHABLE_KEY="..."

# Email
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="..."
```

## 🎯 Flujo de una Petición

1. **Cliente hace petición** → Middleware intercepta
2. **Middleware verifica:**
   - ¿Modo mantenimiento activo?
     - Si: ¿Ruta permitida? → Continuar / Redirigir a /maintenance
     - No: Continuar
3. **Middleware verifica:**
   - ¿Ruta protegida?
     - Si: ¿Usuario autenticado? → Permitir / Redirigir a /auth/signin
     - No: Continuar
4. **Endpoint procesa la petición** y retorna respuesta

## 📖 Más Información

- **Configuración**: Ver archivos en `/config`
- **Middleware**: `src/middleware.ts`
- **Autenticación**: `src/lib/auth.ts`
- **Prisma Client**: `src/lib/prisma.ts`

---

**Nota**: Esta es una aplicación Next.js con App Router, por lo que los endpoints están definidos en `src/app/api/*/route.ts` siguiendo la convención de Next.js 13+.

