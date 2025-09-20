-- =========================================================
-- TABLA PARA GESTIÓN DE IMÁGENES DEL SITIO WEB
-- =========================================================

USE antigua_hotels;

-- Crear tabla para imágenes del sitio web
CREATE TABLE IF NOT EXISTS website_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Clave única para identificar la imagen (ej: hero_main, hero_accommodations, etc.)',
    title VARCHAR(255) NOT NULL COMMENT 'Título descriptivo de la imagen',
    description TEXT COMMENT 'Descripción de la imagen',
    image_url VARCHAR(500) NOT NULL COMMENT 'URL de la imagen en Cloudinary',
    cloudinary_public_id VARCHAR(255) NOT NULL COMMENT 'ID público de Cloudinary',
    alt_text VARCHAR(255) COMMENT 'Texto alternativo para accesibilidad',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Si la imagen está activa',
    sort_order INT DEFAULT 0 COMMENT 'Orden de visualización',
    page_section VARCHAR(50) DEFAULT 'hero' COMMENT 'Sección de la página (hero, gallery, etc.)',
    page_type VARCHAR(50) DEFAULT 'home' COMMENT 'Tipo de página (home, accommodations, activities, etc.)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_page_type (page_type),
    INDEX idx_page_section (page_section),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar imágenes por defecto
INSERT INTO website_images (image_key, title, description, image_url, cloudinary_public_id, alt_text, page_section, page_type, sort_order) VALUES
('hero_home', 'Antigua Guatemala Vista Principal', 'Vista panorámica de Antigua Guatemala con volcanes al fondo', 'https://res.cloudinary.com/dqayvgwhj/image/upload/v1695123456/antigua-hero-main.jpg', 'antigua-hero-main', 'Vista panorámica de Antigua Guatemala', 'hero', 'home', 1),
('hero_accommodations', 'Hoteles Boutique Antigua', 'Hermosos hoteles coloniales en el centro de Antigua', 'https://res.cloudinary.com/dqayvgwhj/image/upload/v1695123456/antigua-hotels-hero.jpg', 'antigua-hotels-hero', 'Hoteles boutique en Antigua Guatemala', 'hero', 'accommodations', 1),
('hero_activities', 'Tours y Actividades', 'Turistas disfrutando actividades en Guatemala', 'https://res.cloudinary.com/dqayvgwhj/image/upload/v1695123456/antigua-activities-hero.jpg', 'antigua-activities-hero', 'Actividades y tours en Guatemala', 'hero', 'activities', 1),
('hero_packages', 'Paquetes de Aventura', 'Experiencias completas en Guatemala', 'https://res.cloudinary.com/dqayvgwhj/image/upload/v1695123456/antigua-packages-hero.jpg', 'antigua-packages-hero', 'Paquetes de aventura en Guatemala', 'hero', 'packages', 1),
('hero_shuttle', 'Transporte Turístico', 'Shuttle service para turistas', 'https://res.cloudinary.com/dqayvgwhj/image/upload/v1695123456/antigua-shuttle-hero.jpg', 'antigua-shuttle-hero', 'Servicio de transporte turístico', 'hero', 'shuttle', 1);

-- Verificar inserción
SELECT * FROM website_images ORDER BY page_type, sort_order;
