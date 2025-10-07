-- =========================================================
-- CREAR USUARIO ADMINISTRADOR CON CONTRASEÑA VÁLIDA
-- Ejecutar en DBeaver
-- =========================================================

-- Usar la base de datos
USE antigua_hotels;

-- Eliminar el usuario de ejemplo con hash inválido
DELETE FROM admin_users WHERE email = 'admin@antiguahotels.com';

-- Crear usuario administrador con hash válido para la contraseña "admin123"
-- Hash generado: $2b$10$rOZKqPFqHb5tWYbR.lGHRO8h9QhQGjlN8jxGYgMkP5YqNJFqoQvNC
INSERT INTO admin_users (username, email, password_hash, first_name, last_name, role, created_at, updated_at) 
VALUES (
    'admin', 
    'admin@antiguahotels.com', 
    '$2b$10$rOZKqPFqHb5tWYbR.lGHRO8h9QhQGjlN8jxGYgMkP5YqNJFqoQvNC', 
    'Admin', 
    'System', 
    'SUPER_ADMIN',
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT id, username, email, first_name, last_name, role, is_active FROM admin_users;


