-- Agregar foreign keys a entity_amenities
-- Basado en la estructura real de las tablas

-- 1. Verificar datos inconsistentes antes de agregar foreign keys
SELECT 
    ea.entity_type,
    ea.entity_id,
    CASE 
        WHEN ea.entity_type = 'HOTEL' THEN h.name
        WHEN ea.entity_type = 'ROOM' THEN CONCAT('Room ', r.code, ' (Hotel ID: ', r.hotel_id, ')')
        ELSE 'Unknown'
    END as entity_name
FROM entity_amenities ea
LEFT JOIN hotels h ON ea.entity_type = 'HOTEL' AND ea.entity_id = h.id
LEFT JOIN rooms r ON ea.entity_type = 'ROOM' AND ea.entity_id = r.id
WHERE (ea.entity_type = 'HOTEL' AND h.id IS NULL) 
   OR (ea.entity_type = 'ROOM' AND r.id IS NULL)
ORDER BY ea.entity_type, ea.entity_id;

-- 2. Si no hay datos inconsistentes, agregar foreign keys
-- NOTA: Solo ejecutar si el paso 1 no muestra registros con entity_name = 'Unknown'

-- Agregar foreign key para HOTEL
ALTER TABLE entity_amenities 
ADD CONSTRAINT fk_entity_amenities_hotel 
FOREIGN KEY (entity_id) REFERENCES hotels(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Agregar foreign key para ROOM  
ALTER TABLE entity_amenities 
ADD CONSTRAINT fk_entity_amenities_room 
FOREIGN KEY (entity_id) REFERENCES rooms(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 3. Verificar que las foreign keys se crearon correctamente
SHOW CREATE TABLE entity_amenities;

-- 4. Probar una consulta de JOIN para verificar que funciona
SELECT 
    r.id as room_id,
    r.code as room_code,
    h.name as hotel_name,
    a.name as amenity_name,
    a.icon as amenity_icon
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
JOIN entity_amenities ea ON ea.entity_type = 'ROOM' AND ea.entity_id = r.id
JOIN amenities a ON ea.amenity_id = a.id
WHERE r.id = 12
ORDER BY a.name;
