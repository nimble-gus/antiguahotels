-- Script para crear tabla de contenido de páginas
-- Permite gestionar el contenido de páginas estáticas desde el dashboard

CREATE TABLE IF NOT EXISTS page_content (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_key VARCHAR(100) NOT NULL UNIQUE,
    page_title VARCHAR(255) NOT NULL,
    page_description TEXT,
    content JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    
    INDEX idx_page_key (page_key),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Insertar contenido inicial para las páginas
INSERT INTO page_content (page_key, page_title, page_description, content, created_at, updated_at) VALUES
('about_us', 'Acerca de Nosotros', 'Página principal de información sobre la empresa', 
JSON_OBJECT(
    'hero_title', 'Acerca de Nosotros',
    'hero_subtitle', 'Descubre la belleza de Guatemala con experiencias auténticas y memorables',
    'story_title', 'Nuestra Historia',
    'story_content', 'Antigua Hotels Tours nació de la pasión por compartir la riqueza cultural y natural de Guatemala. Desde nuestros inicios, nos hemos dedicado a crear experiencias únicas que conecten a nuestros visitantes con la auténtica belleza de este país centroamericano.',
    'mission_title', 'Nuestra Misión',
    'mission_content', 'Conectar a nuestros huéspedes con la auténtica cultura guatemalteca a través de experiencias memorables, promoviendo el turismo sostenible y el desarrollo local.',
    'vision_title', 'Nuestra Visión',
    'vision_content', 'Ser la empresa líder en turismo cultural en Guatemala, reconocida por nuestra excelencia en servicio y compromiso con la preservación del patrimonio nacional.',
    'values_title', 'Nuestros Valores',
    'values_content', 'Autenticidad, sostenibilidad, excelencia en servicio, respeto por las comunidades locales y pasión por compartir la cultura guatemalteca.'
), NOW(), NOW()),

('faq', 'Preguntas Frecuentes', 'Página de preguntas y respuestas frecuentes',
JSON_OBJECT(
    'hero_title', 'Preguntas Frecuentes',
    'hero_subtitle', 'Encuentra respuestas a las preguntas más comunes sobre nuestros servicios',
    'search_placeholder', 'Buscar en las preguntas frecuentes...',
    'no_results_title', '¿No encontraste lo que buscabas?',
    'no_results_content', 'Nuestro equipo está aquí para ayudarte con cualquier pregunta'
), NOW(), NOW()),

('terms', 'Términos y Condiciones', 'Términos y condiciones de servicio',
JSON_OBJECT(
    'hero_title', 'Términos y Condiciones',
    'hero_subtitle', 'Información importante sobre nuestros servicios y políticas',
    'last_updated', 'Última actualización',
    'company_name', 'Antigua Hotels Tours',
    'company_address', 'Antigua Guatemala, Sacatepéquez, Guatemala',
    'company_phone', '+502 1234-5678',
    'company_email', 'info@antiguahotelstours.com'
), NOW(), NOW()),

('privacy', 'Política de Privacidad', 'Política de privacidad y protección de datos',
JSON_OBJECT(
    'hero_title', 'Política de Privacidad',
    'hero_subtitle', 'Tu privacidad es importante para nosotros',
    'last_updated', 'Última actualización',
    'company_name', 'Antigua Hotels Tours',
    'company_address', 'Antigua Guatemala, Sacatepéquez, Guatemala',
    'company_phone', '+502 1234-5678',
    'company_email', 'privacy@antiguahotelstours.com'
), NOW(), NOW());

-- Verificar que se insertaron correctamente
SELECT page_key, page_title, is_active 
FROM page_content 
ORDER BY page_key;

