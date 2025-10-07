# 🚀 Setup Rápido - Antigua Hotels Admin

## Pasos para ejecutar el proyecto:

### 1. **Instalar dependencias**
```bash
cd antiguahotels
npm install
```

### 2. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar .env con tus credenciales:
# - DATABASE_URL: Tu conexión a MySQL
# - NEXTAUTH_SECRET: Un secreto seguro
# - CLOUDINARY_*: Credenciales de Cloudinary (opcional)
```

### 3. **Configurar base de datos**

**Opción A: Usar el script SQL (Recomendado)**
```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE antigua_hotels;"

# Ejecutar el script desde la carpeta raíz
mysql -u root -p antigua_hotels < ../database_integrated.sql
```

**Opción B: Usar Prisma**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. **Ejecutar el proyecto**
```bash
npm run dev
```

### 5. **Acceder al dashboard**
- URL: http://localhost:3000
- Credenciales: `admin@antiguahotels.com` / `admin123`

## ✅ Verificación

Si todo está funcionando correctamente, deberías ver:
1. La página de login en http://localhost:3000
2. Poder iniciar sesión con las credenciales de prueba
3. Ver el dashboard con estadísticas (aunque estén en 0 inicialmente)

## 🔧 Comandos útiles

```bash
# Ver la base de datos en el navegador
npm run db:studio

# Regenerar el cliente de Prisma
npm run db:generate

# Ver logs de desarrollo
npm run dev

# Construir para producción
npm run build
```

## ❓ Problemas comunes

1. **Error de conexión a base de datos**: Verifica que MySQL esté corriendo y las credenciales en `.env` sean correctas
2. **Error de Prisma**: Ejecuta `npx prisma generate`
3. **Error de autenticación**: Verifica que `NEXTAUTH_SECRET` esté configurado en `.env`



