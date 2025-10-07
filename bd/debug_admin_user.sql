-- =========================================================
-- DEBUG Y RECREAR USUARIO ADMIN COMPLETAMENTE
-- Ejecutar en DBeaver paso a paso
-- =========================================================

USE antigua_hotels;

-- 1. Ver si el usuario existe
SELECT * FROM admin_users WHERE email = 'admin@antiguahotels.com';

-- 2. Eliminar completamente el usuario si existe
DELETE FROM admin_users WHERE email = 'admin@antiguahotels.com';

-- 3. Crear usuario desde cero con hash conocido que funciona
-- Hash para "password": $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO admin_users (
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at, 
    updated_at
) VALUES (
    'admin',
    'admin@antiguahotels.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'System',
    'SUPER_ADMIN',
    1,
    NOW(),
    NOW()
);

-- 4. Verificar que se creó correctamente
SELECT 
    id, 
    username, 
    email, 
    first_name, 
    last_name, 
    role, 
    is_active,
    LENGTH(password_hash) as hash_length,
    password_hash
FROM admin_users 
WHERE email = 'admin@antiguahotels.com';



