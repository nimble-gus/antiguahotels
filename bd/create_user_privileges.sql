-- =========================================================
-- CREAR USUARIO CON PRIVILEGIOS PARA ANTIGUA HOTELS
-- Ejecutar en DBeaver conectado a tu RDS como administrador
-- =========================================================

-- 1. Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS antigua_hotels;

-- 2. Crear usuario para la aplicación
-- Cambiar 'tu_password_seguro' por una contraseña fuerte
CREATE USER 'antigua_admin'@'%' IDENTIFIED BY 'tu_password_seguro';

-- 3. Otorgar TODOS los privilegios en la base de datos antigua_hotels
GRANT ALL PRIVILEGES ON antigua_hotels.* TO 'antigua_admin'@'%';

-- 4. Otorgar privilegios adicionales si es necesario
GRANT CREATE, DROP, ALTER, INDEX ON antigua_hotels.* TO 'antigua_admin'@'%';

-- 5. Aplicar los cambios
FLUSH PRIVILEGES;

-- 6. Verificar que el usuario fue creado correctamente
SELECT User, Host FROM mysql.user WHERE User = 'antigua_admin';

-- 7. Verificar privilegios del usuario
SHOW GRANTS FOR 'antigua_admin'@'%';



