-- =========================================================
-- OTORGAR PRIVILEGIOS AL USUARIO ADMIN EXISTENTE
-- =========================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS antigua_hotels;

-- Otorgar todos los privilegios al usuario admin existente
GRANT ALL PRIVILEGES ON antigua_hotels.* TO 'admin'@'%';

-- Si el usuario admin es local, también otorgar para localhost
GRANT ALL PRIVILEGES ON antigua_hotels.* TO 'admin'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar privilegios
SHOW GRANTS FOR 'admin'@'%';



