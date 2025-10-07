# 🏨 Antigua Hotels - Admin Dashboard

Sistema de administración para reservaciones de hoteles, actividades, paquetes turísticos y shuttle service.

## 🚀 Características

- **Dashboard en Tiempo Real**: Estadísticas y métricas actualizadas
- **Gestión Completa**: Hoteles, habitaciones, actividades, paquetes, shuttle service
- **Sistema de Reservaciones**: Crear, modificar y gestionar reservaciones
- **WebSockets**: Actualizaciones en tiempo real
- **Integración con Cloudinary**: Gestión profesional de imágenes
- **Base de Datos Escalable**: Arquitectura polimórfica inteligente
- **Autenticación Segura**: NextAuth con roles de usuario
- **UI Moderna**: Diseño minimalista con Tailwind CSS

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: MySQL
- **Autenticación**: NextAuth.js
- **UI**: Tailwind CSS, Radix UI
- **Imágenes**: Cloudinary
- **WebSockets**: Socket.io

## 📦 Instalación

### 1. Navegar al directorio del proyecto
```bash
cd antiguahotels
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `env.example` a `.env` y configura las variables:

```bash
cp env.example .env
```

Edita `.env` con tus valores:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/antigua_hotels"

# NextAuth
NEXTAUTH_SECRET="tu-secreto-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

### 4. Configurar la base de datos

#### Opción A: Usar el script SQL integrado
```bash
# Ejecutar el script de base de datos
mysql -u username -p antigua_hotels < database_integrated.sql
```

#### Opción B: Usar Prisma (Recomendado)
```bash
# Generar el cliente de Prisma
npx prisma generate

# Sincronizar el esquema con la base de datos
npx prisma db push

# Ejecutar el seed para datos iniciales
npm run db:seed
```

### 5. Ejecutar el proyecto
```bash
# Modo desarrollo
npm run dev

# El proyecto estará disponible en http://localhost:3000
```

## 🔐 Credenciales por Defecto

- **Email**: `admin@antiguahotels.com`
- **Contraseña**: `admin123`

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI base
│   └── layout/           # Componentes de layout
├── lib/                  # Utilidades y configuraciones
│   ├── prisma.ts         # Cliente de Prisma
│   ├── auth.ts           # Configuración de NextAuth
│   └── utils.ts          # Utilidades generales
├── types/                # Tipos de TypeScript
└── hooks/                # Custom hooks
```

## 🗄️ Base de Datos

La base de datos utiliza una arquitectura polimórfica inteligente:

### Módulos Principales:
- **Hoteles y Habitaciones**: Gestión completa con tipos, amenidades e inventario
- **Actividades**: Catálogo con horarios y disponibilidad
- **Paquetes**: Combinación flexible de servicios
- **Shuttle Service**: Rutas de aeropuerto a hotel
- **Reservaciones**: Sistema polimórfico unificado
- **Pagos**: Integración con múltiples gateways

### Características Avanzadas:
- Control de inventario por habitación/fecha
- Triggers automáticos para validaciones
- Sistema de amenidades reutilizable
- Gestión de imágenes con Cloudinary
- Auditoría completa de cambios

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Inicio en producción
npm start

# Base de datos
npm run db:push      # Sincronizar esquema
npm run db:studio    # Abrir Prisma Studio
npm run db:generate  # Generar cliente
npm run db:migrate   # Crear migración
npm run db:seed      # Ejecutar seed

# Linting
npm run lint
```

## 🌐 Deployment

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Variables de Entorno en Producción
Asegúrate de configurar todas las variables de entorno en tu plataforma de deployment.

## 📊 Funcionalidades del Dashboard

### Dashboard Principal
- Estadísticas en tiempo real
- Gráficos de ingresos
- Reservaciones recientes
- Acciones rápidas

### Gestión de Hoteles
- CRUD completo de hoteles
- Gestión de habitaciones y tipos
- Sistema de amenidades
- Carga de imágenes

### Gestión de Reservaciones
- Vista general de todas las reservaciones
- Crear reservaciones manuales
- Modificar y cancelar reservaciones
- Estados en tiempo real

### Gestión de Actividades
- Catálogo de actividades
- Horarios y disponibilidad
- Gestión de participantes

### Sistema de Paquetes
- Crear paquetes combinados
- Itinerarios flexibles
- Precios dinámicos

### Shuttle Service
- Rutas de aeropuerto
- Horarios regulares
- Gestión de capacidad

## 🔄 WebSockets

El sistema incluye WebSockets para actualizaciones en tiempo real:
- Nuevas reservaciones
- Cambios de estado
- Notificaciones del sistema

## 🎨 Personalización

### Temas
El dashboard utiliza CSS variables para fácil personalización de colores.

### Componentes
Todos los componentes están construidos con Radix UI y son completamente personalizables.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes algún problema o pregunta:

1. Revisa la [documentación](docs/)
2. Busca en los [issues existentes](issues)
3. Crea un [nuevo issue](issues/new)

---

**Desarrollado con ❤️ para Antigua Hotels**
