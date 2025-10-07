-- Identificar y corregir datos inconsistentes en entity_amenities

-- 1. Verificar datos inconsistentes para HOTEL
SELECT 
    'HOTEL' as entity_type,
    ea.entity_id,
    h.id as hotel_exists,
    h.name as hotel_name
FROM entity_amenities ea
LEFT JOIN hotels h ON ea.entity_id = h.id
WHERE ea.entity_type = 'HOTEL' AND h.id IS NULL;

-- 2. Verificar datos inconsistentes para ROOM
SELECT 
    'ROOM' as entity_type,
    ea.entity_id,
    r.id as room_exists,
    r.code as room_code,
    r.hotel_id
FROM entity_amenities ea
LEFT JOIN rooms r ON ea.entity_id = r.id
WHERE ea.entity_type = 'ROOM' AND r.id IS NULL;

-- 3. Ver todos los entity_id únicos para cada tipo
SELECT 
    entity_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT entity_id) as unique_entities
FROM entity_amenities 
GROUP BY entity_type;

-- 4. Ver los entity_id específicos que existen
SELECT 'HOTEL IDs' as type, GROUP_CONCAT(id ORDER BY id) as ids FROM hotels
UNION ALL
SELECT 'ROOM IDs' as type, GROUP_CONCAT(id ORDER BY id) as ids FROM rooms;

-- 5. Si hay datos inconsistentes, eliminarlos (CUIDADO: esto elimina datos)
-- DESCOMENTAR SOLO SI ESTÁS SEGURO:
-- DELETE ea FROM entity_amenities ea
-- LEFT JOIN hotels h ON ea.entity_type = 'HOTEL' AND ea.entity_id = h.id
-- LEFT JOIN rooms r ON ea.entity_type = 'ROOM' AND ea.entity_id = r.id
-- WHERE (ea.entity_type = 'HOTEL' AND h.id IS NULL) 
--    OR (ea.entity_type = 'ROOM' AND r.id IS NULL);
