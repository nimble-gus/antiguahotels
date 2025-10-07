-- =========================================================
-- CONFIGURACIONES POR DEFECTO DEL SISTEMA
-- =========================================================

USE antigua_hotels;

-- Limpiar configuraciones existentes (opcional)
-- DELETE FROM system_settings;

-- =========================================================
-- CONFIGURACIONES GENERALES
-- =========================================================

INSERT INTO system_settings (setting_key, setting_value, data_type, description, is_public, created_at, updated_at) VALUES

-- Información de la empresa
('company.name', 'Antigua Hotels Tours', 'STRING', 'Nombre de la empresa', true, NOW(), NOW()),
('company.description', 'Experiencias únicas en Guatemala - Hoteles, Tours y Aventuras', 'STRING', 'Descripción de la empresa', true, NOW(), NOW()),
('company.phone', '+502 1234-5678', 'STRING', 'Teléfono principal', true, NOW(), NOW()),
('company.email', 'info@antiguahotelstours.com', 'STRING', 'Email de contacto', true, NOW(), NOW()),
('company.address', 'Antigua Guatemala, Sacatepéquez', 'STRING', 'Dirección principal', true, NOW(), NOW()),
('company.website', 'https://antiguahotelstours.com', 'STRING', 'Sitio web principal', true, NOW(), NOW()),

-- Configuración de reservaciones
('reservations.advance_booking_days', '365', 'INTEGER', 'Días máximos de anticipación para reservas', false, NOW(), NOW()),
('reservations.min_advance_hours', '24', 'INTEGER', 'Horas mínimas de anticipación', false, NOW(), NOW()),
('reservations.auto_confirm_payment', 'true', 'BOOLEAN', 'Auto-confirmar reservas al recibir pago completo', false, NOW(), NOW()),
('reservations.allow_same_day', 'true', 'BOOLEAN', 'Permitir reservas para el mismo día', false, NOW(), NOW()),
('reservations.default_currency', 'USD', 'STRING', 'Moneda por defecto', false, NOW(), NOW()),

-- Políticas de cancelación
('cancellation.free_cancellation_hours', '48', 'INTEGER', 'Horas para cancelación gratuita', true, NOW(), NOW()),
('cancellation.partial_refund_hours', '24', 'INTEGER', 'Horas para reembolso parcial', true, NOW(), NOW()),
('cancellation.partial_refund_percentage', '50', 'DECIMAL', 'Porcentaje de reembolso parcial', true, NOW(), NOW()),
('cancellation.no_show_policy', 'No hay reembolso por no presentarse', 'STRING', 'Política de no-show', true, NOW(), NOW()),

-- =========================================================
-- CONFIGURACIONES DE PAGOS
-- =========================================================

-- Monedas soportadas
('currencies.primary', 'USD', 'STRING', 'Moneda principal', false, NOW(), NOW()),
('currencies.secondary', 'GTQ', 'STRING', 'Moneda secundaria', false, NOW(), NOW()),
('currencies.exchange_rate_usd_gtq', '7.75', 'DECIMAL', 'Tipo de cambio USD a GTQ', false, NOW(), NOW()),
('currencies.auto_update_rates', 'false', 'BOOLEAN', 'Actualizar tipos de cambio automáticamente', false, NOW(), NOW()),

-- Configuración de pagos
('payments.require_deposit', 'true', 'BOOLEAN', 'Requerir depósito para confirmar reserva', false, NOW(), NOW()),
('payments.deposit_percentage', '30', 'DECIMAL', 'Porcentaje de depósito requerido', false, NOW(), NOW()),
('payments.payment_due_days', '7', 'INTEGER', 'Días para completar el pago', false, NOW(), NOW()),
('payments.late_payment_fee', '25.00', 'DECIMAL', 'Cargo por pago tardío', false, NOW(), NOW()),

-- CyberSource/NeoNet
('cybersource.enabled', 'false', 'BOOLEAN', 'Habilitar pagos con CyberSource', false, NOW(), NOW()),
('cybersource.environment', 'sandbox', 'STRING', 'Ambiente: sandbox o production', false, NOW(), NOW()),
('cybersource.merchant_id', '', 'STRING', 'ID del comercio en CyberSource', false, NOW(), NOW()),
('cybersource.test_mode', 'true', 'BOOLEAN', 'Modo de prueba activado', false, NOW(), NOW()),

-- =========================================================
-- CONFIGURACIONES DE NOTIFICACIONES
-- =========================================================

-- Email
('notifications.email_enabled', 'true', 'BOOLEAN', 'Habilitar notificaciones por email', false, NOW(), NOW()),
('notifications.admin_emails', '["admin@antiguahotelstours.com"]', 'JSON', 'Lista de emails de administradores', false, NOW(), NOW()),
('notifications.from_name', 'Antigua Hotels Tours', 'STRING', 'Nombre del remitente', false, NOW(), NOW()),
('notifications.reply_to', 'noreply@antiguahotelstours.com', 'STRING', 'Email de respuesta', false, NOW(), NOW()),

-- SMS (futuro)
('notifications.sms_enabled', 'false', 'BOOLEAN', 'Habilitar notificaciones por SMS', false, NOW(), NOW()),
('notifications.sms_provider', 'twilio', 'STRING', 'Proveedor de SMS', false, NOW(), NOW()),

-- Recordatorios
('notifications.checkin_reminder_hours', '24', 'INTEGER', 'Horas antes del check-in para recordatorio', false, NOW(), NOW()),
('notifications.payment_reminder_days', '3', 'INTEGER', 'Días antes del vencimiento para recordatorio de pago', false, NOW(), NOW()),
('notifications.followup_days', '1', 'INTEGER', 'Días después del checkout para email de seguimiento', false, NOW(), NOW()),

-- =========================================================
-- CONFIGURACIONES DE NEGOCIO
-- =========================================================

-- Horarios de operación
('business.checkin_time', '15:00', 'STRING', 'Hora de check-in por defecto', true, NOW(), NOW()),
('business.checkout_time', '11:00', 'STRING', 'Hora de check-out por defecto', true, NOW(), NOW()),
('business.office_hours_start', '08:00', 'STRING', 'Inicio de horario de oficina', true, NOW(), NOW()),
('business.office_hours_end', '18:00', 'STRING', 'Fin de horario de oficina', true, NOW(), NOW()),
('business.timezone', 'America/Guatemala', 'STRING', 'Zona horaria del negocio', false, NOW(), NOW()),

-- Políticas generales
('business.min_age_checkin', '18', 'INTEGER', 'Edad mínima para check-in', true, NOW(), NOW()),
('business.max_guests_per_room', '4', 'INTEGER', 'Máximo de huéspedes por habitación', false, NOW(), NOW()),
('business.pet_policy', 'No se permiten mascotas', 'STRING', 'Política de mascotas', true, NOW(), NOW()),
('business.smoking_policy', 'Prohibido fumar en todas las áreas', 'STRING', 'Política de fumadores', true, NOW(), NOW()),

-- =========================================================
-- CONFIGURACIONES DE SISTEMA
-- =========================================================

-- Mantenimiento
('system.maintenance_mode', 'false', 'BOOLEAN', 'Modo de mantenimiento activado', false, NOW(), NOW()),
('system.maintenance_message', 'Sistema en mantenimiento. Volveremos pronto.', 'STRING', 'Mensaje de mantenimiento', true, NOW(), NOW()),
('system.backup_enabled', 'true', 'BOOLEAN', 'Habilitar backups automáticos', false, NOW(), NOW()),
('system.backup_frequency_hours', '24', 'INTEGER', 'Frecuencia de backup en horas', false, NOW(), NOW()),

-- Logs y auditoría
('system.log_level', 'INFO', 'STRING', 'Nivel de logging: DEBUG, INFO, WARN, ERROR', false, NOW(), NOW()),
('system.audit_enabled', 'true', 'BOOLEAN', 'Habilitar logs de auditoría', false, NOW(), NOW()),
('system.session_timeout_minutes', '480', 'INTEGER', 'Timeout de sesión en minutos (8 horas)', false, NOW(), NOW()),

-- Performance
('system.cache_enabled', 'true', 'BOOLEAN', 'Habilitar cache del sistema', false, NOW(), NOW()),
('system.cache_ttl_minutes', '60', 'INTEGER', 'TTL del cache en minutos', false, NOW(), NOW()),
('system.rate_limit_requests', '100', 'INTEGER', 'Requests por minuto por IP', false, NOW(), NOW()),

-- =========================================================
-- CONFIGURACIONES DE CLOUDINARY
-- =========================================================

('cloudinary.auto_optimize', 'true', 'BOOLEAN', 'Optimización automática de imágenes', false, NOW(), NOW()),
('cloudinary.max_file_size_mb', '10', 'INTEGER', 'Tamaño máximo de archivo en MB', false, NOW(), NOW()),
('cloudinary.allowed_formats', '["jpg", "jpeg", "png", "webp"]', 'JSON', 'Formatos de imagen permitidos', false, NOW(), NOW()),
('cloudinary.auto_backup', 'true', 'BOOLEAN', 'Backup automático de imágenes', false, NOW(), NOW()),

-- =========================================================
-- CONFIGURACIONES PÚBLICAS (para el sitio web)
-- =========================================================

-- SEO
('seo.site_title', 'Antigua Hotels Tours - Experiencias Únicas en Guatemala', 'STRING', 'Título del sitio web', true, NOW(), NOW()),
('seo.meta_description', 'Descubre Guatemala con nuestros hoteles boutique, tours exclusivos y paquetes de aventura. Reserva tu experiencia única en Antigua Guatemala.', 'STRING', 'Meta descripción', true, NOW(), NOW()),
('seo.keywords', 'hoteles guatemala, tours antigua, paquetes turísticos, aventuras guatemala', 'STRING', 'Palabras clave SEO', true, NOW(), NOW()),

-- Redes sociales
('social.facebook', 'https://facebook.com/antiguahotelstours', 'STRING', 'URL de Facebook', true, NOW(), NOW()),
('social.instagram', 'https://instagram.com/antiguahotelstours', 'STRING', 'URL de Instagram', true, NOW(), NOW()),
('social.whatsapp', '+502 1234-5678', 'STRING', 'Número de WhatsApp', true, NOW(), NOW()),

-- Configuración del sitio web
('website.show_prices', 'true', 'BOOLEAN', 'Mostrar precios en el sitio web', true, NOW(), NOW()),
('website.allow_online_booking', 'true', 'BOOLEAN', 'Permitir reservas online', true, NOW(), NOW()),
('website.require_phone_verification', 'false', 'BOOLEAN', 'Requerir verificación telefónica', false, NOW(), NOW()),
('website.show_availability_calendar', 'true', 'BOOLEAN', 'Mostrar calendario de disponibilidad', true, NOW(), NOW());

-- Verificar configuraciones insertadas
SELECT 
  SUBSTRING_INDEX(setting_key, '.', 1) as categoria,
  COUNT(*) as configuraciones
FROM system_settings 
GROUP BY SUBSTRING_INDEX(setting_key, '.', 1)
ORDER BY categoria;
