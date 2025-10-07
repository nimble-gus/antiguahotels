-- Script para diagnosticar inconsistencias en entity_images

-- 1. Mostrar todos los registros de entity_images
SELECT 'Registros de entity_images por tipo:' AS 'Diagnóstico';
SELECT entity_type, COUNT(*) as total_registros
FROM entity_images 
GROUP BY entity_type;

-- 2. Verificar registros de HOTEL
SELECT 'Registros de HOTEL en entity_images sin hotel correspondiente:' AS 'Diagnóstico';
SELECT ei.*
FROM entity_images ei
LEFT JOIN hotels h ON ei.entity_id = h.id
WHERE ei.entity_type = 'HOTEL' AND h.id IS NULL;

-- 3. Verificar registros de ROOM_TYPE
SELECT 'Registros de ROOM_TYPE en entity_images sin room_type correspondiente:' AS 'Diagnóstico';
SELECT ei.*
FROM entity_images ei
LEFT JOIN room_types rt ON ei.entity_id = rt.id
WHERE ei.entity_type = 'ROOM_TYPE' AND rt.id IS NULL;

-- 4. Verificar registros de ROOM
SELECT 'Registros de ROOM en entity_images sin habitación correspondiente:' AS 'Diagnóstico';
SELECT ei.*
FROM entity_images ei
LEFT JOIN rooms r ON ei.entity_id = r.id
WHERE ei.entity_type = 'ROOM' AND r.id IS NULL;

-- 5. Verificar registros de ACTIVITY
SELECT 'Registros de ACTIVITY en entity_images sin actividad correspondiente:' AS 'Diagnóstico';
SELECT ei.*
FROM entity_images ei
LEFT JOIN activities a ON ei.entity_id = a.id
WHERE ei.entity_type = 'ACTIVITY' AND a.id IS NULL;

-- 6. Verificar registros de PACKAGE
SELECT 'Registros de PACKAGE en entity_images sin paquete correspondiente:' AS 'Diagnóstico';
SELECT ei.*
FROM entity_images ei
LEFT JOIN packages p ON ei.entity_id = p.id
WHERE ei.entity_type = 'PACKAGE' AND p.id IS NULL;

-- 7. Mostrar IDs existentes para referencia
SELECT 'IDs de Hoteles existentes:' AS 'Diagnóstico';
SELECT id, name FROM hotels ORDER BY id;

SELECT 'IDs de Room Types existentes:' AS 'Diagnóstico';
SELECT id, name, hotel_id FROM room_types ORDER BY id;

SELECT 'IDs de Habitaciones existentes:' AS 'Diagnóstico';
SELECT id, code, hotel_id, room_type_id FROM rooms ORDER BY id;

SELECT 'IDs de Actividades existentes:' AS 'Diagnóstico';
SELECT id, name FROM activities ORDER BY id;

SELECT 'IDs de Paquetes existentes:' AS 'Diagnóstico';
SELECT id, name FROM packages ORDER BY id;

-- 8. Contar inconsistencias por tipo
SELECT 'Conteo de registros inconsistentes por tipo:' AS 'Diagnóstico';
SELECT 
    ei.entity_type,
    COUNT(ei.id) AS inconsistent_count
FROM entity_images ei
LEFT JOIN hotels h ON ei.entity_type = 'HOTEL' AND ei.entity_id = h.id
LEFT JOIN room_types rt ON ei.entity_type = 'ROOM_TYPE' AND ei.entity_id = rt.id
LEFT JOIN rooms r ON ei.entity_type = 'ROOM' AND ei.entity_id = r.id
LEFT JOIN activities a ON ei.entity_type = 'ACTIVITY' AND ei.entity_id = a.id
LEFT JOIN packages p ON ei.entity_type = 'PACKAGE' AND ei.entity_id = p.id
WHERE (ei.entity_type = 'HOTEL' AND h.id IS NULL) 
   OR (ei.entity_type = 'ROOM_TYPE' AND rt.id IS NULL)
   OR (ei.entity_type = 'ROOM' AND r.id IS NULL)
   OR (ei.entity_type = 'ACTIVITY' AND a.id IS NULL)
   OR (ei.entity_type = 'PACKAGE' AND p.id IS NULL)
GROUP BY ei.entity_type;
