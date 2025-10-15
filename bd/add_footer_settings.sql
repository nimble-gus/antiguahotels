-- Script para agregar configuraciones del footer
-- Ejecutar después de crear las configuraciones por defecto

-- Configuraciones de contacto del footer
INSERT INTO system_settings (setting_key, setting_value, data_type, description, is_public, created_at, updated_at) VALUES
('company.footer_phone', '+502 1234-5678', 'STRING', 'Número de teléfono que aparece en el footer', true, NOW(), NOW()),
('company.footer_email', 'info@antiguahotelstours.com', 'STRING', 'Correo electrónico que aparece en el footer', true, NOW(), NOW()),
('company.footer_address', 'Antigua Guatemala', 'STRING', 'Dirección que aparece en el footer', true, NOW(), NOW()),
('company.footer_address_detail', 'Sacatepéquez, Guatemala', 'STRING', 'Detalle adicional de la dirección en el footer', true, NOW(), NOW()),
('company.footer_phone_hours', 'Lunes - Viernes 8:00 - 18:00', 'STRING', 'Horarios de atención telefónica', true, NOW(), NOW()),
('company.footer_email_response', 'Respuesta dentro de 24 horas', 'STRING', 'Tiempo de respuesta por email', true, NOW(), NOW()),
('company.footer_facebook_url', '#', 'STRING', 'URL de Facebook', true, NOW(), NOW()),
('company.footer_instagram_url', '#', 'STRING', 'URL de Instagram', true, NOW(), NOW()),
('company.footer_twitter_url', '#', 'STRING', 'URL de Twitter', true, NOW(), NOW()),
('company.footer_company_name', 'Antigua Hotels Tours', 'STRING', 'Nombre de la empresa en el footer', true, NOW(), NOW()),
('company.footer_description', 'Descubre la belleza de Guatemala con nuestras experiencias auténticas de alojamiento, actividades y aventuras.', 'STRING', 'Descripción de la empresa en el footer', true, NOW(), NOW()),
('company.footer_copyright', 'Todos los derechos reservados.', 'STRING', 'Texto de copyright en el footer', true, NOW(), NOW()),
('company.footer_made_with_love', 'Hecho con ❤️ en Guatemala', 'STRING', 'Mensaje de cierre en el footer', true, NOW(), NOW());

-- Verificar que se insertaron correctamente
SELECT setting_key, setting_value, is_public 
FROM system_settings 
WHERE setting_key LIKE 'company.footer_%' 
ORDER BY setting_key;



