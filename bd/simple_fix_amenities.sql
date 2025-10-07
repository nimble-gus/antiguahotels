-- Script simple para verificar y corregir entity_amenities
-- Ejecutar paso a paso

-- 1. Ver estructura de las tablas
DESCRIBE rooms;
DESCRIBE hotels;
DESCRIBE entity_amenities;

-- 2. Ver datos actuales de entity_amenities
SELECT * FROM entity_amenities WHERE entity_type = 'ROOM' LIMIT 10;

-- 3. Verificar si hay habitaciones con esos IDs
SELECT 
    ea.entity_id as room_id,
    r.id as actual_room_id,
    r.code as room_code
FROM entity_amenities ea
LEFT JOIN rooms r ON ea.entity_id = r.id
WHERE ea.entity_type = 'ROOM'
ORDER BY ea.entity_id;

-- 4. Si todo se ve bien, agregar foreign keys
-- (Solo ejecutar si los pasos anteriores muestran datos consistentes)

-- ALTER TABLE entity_amenities 
-- ADD CONSTRAINT fk_entity_amenities_hotel 
-- FOREIGN KEY (entity_id) REFERENCES hotels(id) 
-- ON DELETE CASCADE 
-- ON UPDATE CASCADE;

-- ALTER TABLE entity_amenities 
-- ADD CONSTRAINT fk_entity_amenities_room 
-- FOREIGN KEY (entity_id) REFERENCES rooms(id) 
-- ON DELETE CASCADE 
-- ON UPDATE CASCADE;
