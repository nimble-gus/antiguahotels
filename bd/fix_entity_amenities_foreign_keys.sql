-- Agregar foreign keys a entity_amenities
-- Esto permitirá que las relaciones funcionen correctamente

-- Primero, verificar la estructura de las tablas
DESCRIBE rooms;
DESCRIBE hotels;

-- Verificar que no haya datos inconsistentes (versión corregida)
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

-- Verificar que las foreign keys se crearon correctamente
SHOW CREATE TABLE entity_amenities;
