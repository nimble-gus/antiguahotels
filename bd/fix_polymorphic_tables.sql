-- Script para optimizar tablas polimórficas (entity_images y entity_amenities)
-- Las tablas polimórficas NO pueden usar foreign keys tradicionales

-- =========================================================
-- 1. OPTIMIZAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =========================================================

-- Índices compuestos para entity_images
ALTER TABLE entity_images 
ADD INDEX idx_entity_images_type_id (entity_type, entity_id);

ALTER TABLE entity_images 
ADD INDEX idx_entity_images_primary (entity_type, entity_id, is_primary);

-- Índices compuestos para entity_amenities  
ALTER TABLE entity_amenities 
ADD INDEX idx_entity_amenities_type_id (entity_type, entity_id);

-- =========================================================
-- 2. CREAR TRIGGERS PARA VALIDACIÓN DE INTEGRIDAD
-- =========================================================

-- Trigger para validar entity_images antes de INSERT
DELIMITER $$

CREATE TRIGGER tr_entity_images_insert_validation
BEFORE INSERT ON entity_images
FOR EACH ROW
BEGIN
    DECLARE entity_exists INT DEFAULT 0;
    
    -- Validar según el tipo de entidad
    CASE NEW.entity_type
        WHEN 'HOTEL' THEN
            SELECT COUNT(*) INTO entity_exists FROM hotels WHERE id = NEW.entity_id;
        WHEN 'ROOM_TYPE' THEN
            SELECT COUNT(*) INTO entity_exists FROM room_types WHERE id = NEW.entity_id;
        WHEN 'ROOM' THEN
            SELECT COUNT(*) INTO entity_exists FROM rooms WHERE id = NEW.entity_id;
        WHEN 'ACTIVITY' THEN
            SELECT COUNT(*) INTO entity_exists FROM activities WHERE id = NEW.entity_id;
        WHEN 'PACKAGE' THEN
            SELECT COUNT(*) INTO entity_exists FROM packages WHERE id = NEW.entity_id;
    END CASE;
    
    -- Si la entidad no existe, cancelar la inserción
    IF entity_exists = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('La entidad ', NEW.entity_type, ' con ID ', NEW.entity_id, ' no existe');
    END IF;
END$$

-- Trigger para validar entity_images antes de UPDATE
CREATE TRIGGER tr_entity_images_update_validation
BEFORE UPDATE ON entity_images
FOR EACH ROW
BEGIN
    DECLARE entity_exists INT DEFAULT 0;
    
    -- Solo validar si cambió el entity_id o entity_type
    IF NEW.entity_id != OLD.entity_id OR NEW.entity_type != OLD.entity_type THEN
        CASE NEW.entity_type
            WHEN 'HOTEL' THEN
                SELECT COUNT(*) INTO entity_exists FROM hotels WHERE id = NEW.entity_id;
            WHEN 'ROOM_TYPE' THEN
                SELECT COUNT(*) INTO entity_exists FROM room_types WHERE id = NEW.entity_id;
            WHEN 'ROOM' THEN
                SELECT COUNT(*) INTO entity_exists FROM rooms WHERE id = NEW.entity_id;
            WHEN 'ACTIVITY' THEN
                SELECT COUNT(*) INTO entity_exists FROM activities WHERE id = NEW.entity_id;
            WHEN 'PACKAGE' THEN
                SELECT COUNT(*) INTO entity_exists FROM packages WHERE id = NEW.entity_id;
        END CASE;
        
        IF entity_exists = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = CONCAT('La entidad ', NEW.entity_type, ' con ID ', NEW.entity_id, ' no existe');
        END IF;
    END IF;
END$$

-- Trigger para validar entity_amenities antes de INSERT
CREATE TRIGGER tr_entity_amenities_insert_validation
BEFORE INSERT ON entity_amenities
FOR EACH ROW
BEGIN
    DECLARE entity_exists INT DEFAULT 0;
    
    CASE NEW.entity_type
        WHEN 'HOTEL' THEN
            SELECT COUNT(*) INTO entity_exists FROM hotels WHERE id = NEW.entity_id;
        WHEN 'ROOM_TYPE' THEN
            SELECT COUNT(*) INTO entity_exists FROM room_types WHERE id = NEW.entity_id;
        WHEN 'ROOM' THEN
            SELECT COUNT(*) INTO entity_exists FROM rooms WHERE id = NEW.entity_id;
        WHEN 'ACTIVITY' THEN
            SELECT COUNT(*) INTO entity_exists FROM activities WHERE id = NEW.entity_id;
        WHEN 'PACKAGE' THEN
            SELECT COUNT(*) INTO entity_exists FROM packages WHERE id = NEW.entity_id;
    END CASE;
    
    IF entity_exists = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('La entidad ', NEW.entity_type, ' con ID ', NEW.entity_id, ' no existe');
    END IF;
END$$

-- Trigger para validar entity_amenities antes de UPDATE
CREATE TRIGGER tr_entity_amenities_update_validation
BEFORE UPDATE ON entity_amenities
FOR EACH ROW
BEGIN
    DECLARE entity_exists INT DEFAULT 0;
    
    IF NEW.entity_id != OLD.entity_id OR NEW.entity_type != OLD.entity_type THEN
        CASE NEW.entity_type
            WHEN 'HOTEL' THEN
                SELECT COUNT(*) INTO entity_exists FROM hotels WHERE id = NEW.entity_id;
            WHEN 'ROOM_TYPE' THEN
                SELECT COUNT(*) INTO entity_exists FROM room_types WHERE id = NEW.entity_id;
            WHEN 'ROOM' THEN
                SELECT COUNT(*) INTO entity_exists FROM rooms WHERE id = NEW.entity_id;
            WHEN 'ACTIVITY' THEN
                SELECT COUNT(*) INTO entity_exists FROM activities WHERE id = NEW.entity_id;
            WHEN 'PACKAGE' THEN
                SELECT COUNT(*) INTO entity_exists FROM packages WHERE id = NEW.entity_id;
        END CASE;
        
        IF entity_exists = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = CONCAT('La entidad ', NEW.entity_type, ' con ID ', NEW.entity_id, ' no existe');
        END IF;
    END IF;
END$$

DELIMITER ;

-- =========================================================
-- 3. LIMPIAR DATOS INCONSISTENTES EXISTENTES
-- =========================================================

-- Limpiar entity_images inconsistentes
DELETE ei FROM entity_images ei
LEFT JOIN hotels h ON ei.entity_type = 'HOTEL' AND ei.entity_id = h.id
LEFT JOIN room_types rt ON ei.entity_type = 'ROOM_TYPE' AND ei.entity_id = rt.id
LEFT JOIN rooms r ON ei.entity_type = 'ROOM' AND ei.entity_id = r.id
LEFT JOIN activities a ON ei.entity_type = 'ACTIVITY' AND ei.entity_id = a.id
LEFT JOIN packages p ON ei.entity_type = 'PACKAGE' AND ei.entity_id = p.id
WHERE (ei.entity_type = 'HOTEL' AND h.id IS NULL)
   OR (ei.entity_type = 'ROOM_TYPE' AND rt.id IS NULL)
   OR (ei.entity_type = 'ROOM' AND r.id IS NULL)
   OR (ei.entity_type = 'ACTIVITY' AND a.id IS NULL)
   OR (ei.entity_type = 'PACKAGE' AND p.id IS NULL);

-- Limpiar entity_amenities inconsistentes
DELETE ea FROM entity_amenities ea
LEFT JOIN hotels h ON ea.entity_type = 'HOTEL' AND ea.entity_id = h.id
LEFT JOIN room_types rt ON ea.entity_type = 'ROOM_TYPE' AND ea.entity_id = rt.id
LEFT JOIN rooms r ON ea.entity_type = 'ROOM' AND ea.entity_id = r.id
LEFT JOIN activities a ON ea.entity_type = 'ACTIVITY' AND ea.entity_id = a.id
LEFT JOIN packages p ON ea.entity_type = 'PACKAGE' AND ea.entity_id = p.id
WHERE (ea.entity_type = 'HOTEL' AND h.id IS NULL)
   OR (ea.entity_type = 'ROOM_TYPE' AND rt.id IS NULL)
   OR (ea.entity_type = 'ROOM' AND r.id IS NULL)
   OR (ea.entity_type = 'ACTIVITY' AND a.id IS NULL)
   OR (ea.entity_type = 'PACKAGE' AND p.id IS NULL);

-- =========================================================
-- 4. VERIFICACIÓN FINAL
-- =========================================================

-- Mostrar estadísticas de entity_images
SELECT 'Estadísticas de entity_images:' AS 'Resultado';
SELECT entity_type, COUNT(*) as total_registros
FROM entity_images 
GROUP BY entity_type;

-- Mostrar estadísticas de entity_amenities
SELECT 'Estadísticas de entity_amenities:' AS 'Resultado';
SELECT entity_type, COUNT(*) as total_registros
FROM entity_amenities 
GROUP BY entity_type;

-- Verificar que no hay datos inconsistentes
SELECT 'Verificación de integridad:' AS 'Resultado';
SELECT 'entity_images' as tabla, COUNT(*) as inconsistencias
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

UNION ALL

SELECT 'entity_amenities' as tabla, COUNT(*) as inconsistencias
FROM entity_amenities ea
LEFT JOIN hotels h ON ea.entity_type = 'HOTEL' AND ea.entity_id = h.id
LEFT JOIN room_types rt ON ea.entity_type = 'ROOM_TYPE' AND ea.entity_id = rt.id
LEFT JOIN rooms r ON ea.entity_type = 'ROOM' AND ea.entity_id = r.id
LEFT JOIN activities a ON ea.entity_type = 'ACTIVITY' AND ea.entity_id = a.id
LEFT JOIN packages p ON ea.entity_type = 'PACKAGE' AND ea.entity_id = p.id
WHERE (ea.entity_type = 'HOTEL' AND h.id IS NULL)
   OR (ea.entity_type = 'ROOM_TYPE' AND rt.id IS NULL)
   OR (ea.entity_type = 'ROOM' AND r.id IS NULL)
   OR (ea.entity_type = 'ACTIVITY' AND a.id IS NULL)
   OR (ea.entity_type = 'PACKAGE' AND p.id IS NULL);
