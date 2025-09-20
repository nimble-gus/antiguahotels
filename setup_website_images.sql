    -- Script simplificado para crear la tabla website_images
USE antigua_hotels;

-- Crear tabla para imágenes del sitio web
CREATE TABLE IF NOT EXISTS website_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    page_section VARCHAR(50) DEFAULT 'hero',
    page_type VARCHAR(50) DEFAULT 'home',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_page_type (page_type),
    INDEX idx_page_section (page_section),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar una imagen de ejemplo
INSERT INTO website_images (image_key, title, description, image_url, cloudinary_public_id, alt_text, page_section, page_type, sort_order) VALUES
('hero_home', 'Antigua Guatemala Vista Principal', 'Vista panorámica de Antigua Guatemala con volcanes al fondo', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', 'antigua-hero-main', 'Vista panorámica de Antigua Guatemala', 'hero', 'home', 1);

-- Verificar que se creó correctamente
SELECT * FROM website_images;
