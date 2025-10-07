-- Script para agregar Foreign Keys a la tabla entity_images
-- Asegura la integridad referencial entre entity_images y las tablas correspondientes

-- Desactivar temporalmente las comprobaciones de claves foráneas para evitar errores durante la modificación
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Eliminar posibles claves foráneas existentes para evitar conflictos
ALTER TABLE entity_images DROP FOREIGN KEY IF EXISTS fk_entity_images_hotel;
ALTER TABLE entity_images DROP FOREIGN KEY IF EXISTS fk_entity_images_room_type;
ALTER TABLE entity_images DROP FOREIGN KEY IF EXISTS fk_entity_images_room;
ALTER TABLE entity_images DROP FOREIGN KEY IF EXISTS fk_entity_images_activity;
ALTER TABLE entity_images DROP FOREIGN KEY IF EXISTS fk_entity_images_package;

-- 2. Identificar y eliminar datos inconsistentes antes de agregar las FKs
-- Eliminar registros de HOTEL que referencian a IDs de hoteles que no existen
DELETE ei FROM entity_images ei
LEFT JOIN hotels h ON ei.entity_id = h.id
WHERE ei.entity_type = 'HOTEL' AND h.id IS NULL;

-- Eliminar registros de ROOM_TYPE que referencian a IDs de room_types que no existen
DELETE ei FROM entity_images ei
LEFT JOIN room_types rt ON ei.entity_id = rt.id
WHERE ei.entity_type = 'ROOM_TYPE' AND rt.id IS NULL;

-- Eliminar registros de ROOM que referencian a IDs de habitaciones que no existen
DELETE ei FROM entity_images ei
LEFT JOIN rooms r ON ei.entity_id = r.id
WHERE ei.entity_type = 'ROOM' AND r.id IS NULL;

-- Eliminar registros de ACTIVITY que referencian a IDs de actividades que no existen
DELETE ei FROM entity_images ei
LEFT JOIN activities a ON ei.entity_id = a.id
WHERE ei.entity_type = 'ACTIVITY' AND a.id IS NULL;

-- Eliminar registros de PACKAGE que referencian a IDs de paquetes que no existen
DELETE ei FROM entity_images ei
LEFT JOIN packages p ON ei.entity_id = p.id
WHERE ei.entity_type = 'PACKAGE' AND p.id IS NULL;

-- 3. Agregar las claves foráneas
-- Foreign key para HOTEL
ALTER TABLE entity_images 
ADD CONSTRAINT fk_entity_images_hotel 
FOREIGN KEY (entity_id) REFERENCES hotels(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Foreign key para ROOM_TYPE
ALTER TABLE entity_images 
ADD CONSTRAINT fk_entity_images_room_type 
FOREIGN KEY (entity_id) REFERENCES room_types(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Foreign key para ROOM
ALTER TABLE entity_images 
ADD CONSTRAINT fk_entity_images_room 
FOREIGN KEY (entity_id) REFERENCES rooms(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Foreign key para ACTIVITY
ALTER TABLE entity_images 
ADD CONSTRAINT fk_entity_images_activity 
FOREIGN KEY (entity_id) REFERENCES activities(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Foreign key para PACKAGE
ALTER TABLE entity_images 
ADD CONSTRAINT fk_entity_images_package 
FOREIGN KEY (entity_id) REFERENCES packages(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Reactivar las comprobaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- 4. Consulta de verificación
-- Mostrar las imágenes de tipos de habitación si existen
SELECT 
    ei.id,
    ei.entity_type,
    ei.entity_id,
    ei.image_url,
    ei.is_primary,
    ei.display_order,
    rt.name as room_type_name
FROM entity_images ei
LEFT JOIN room_types rt ON ei.entity_type = 'ROOM_TYPE' AND ei.entity_id = rt.id
WHERE ei.entity_type = 'ROOM_TYPE'
ORDER BY ei.entity_id, ei.is_primary DESC, ei.display_order ASC;
