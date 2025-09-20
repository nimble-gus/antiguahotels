-- =========================================================
-- SISTEMA DE NOTIFICACIONES - TABLAS
-- =========================================================

USE antigua_hotels;

-- 1. Configuración de notificaciones
CREATE TABLE notification_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('EMAIL', 'SMS') NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  recipient_type ENUM('GUEST', 'ADMIN') NOT NULL,
  template_name VARCHAR(50) NOT NULL,
  delay_minutes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_notification (type, event_type, recipient_type)
);

-- 2. Log de notificaciones enviadas
CREATE TABLE notification_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('EMAIL', 'SMS') NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  template_name VARCHAR(50) NOT NULL,
  status ENUM('PENDING', 'SENT', 'FAILED', 'BOUNCED') DEFAULT 'PENDING',
  provider_id VARCHAR(100),
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  reservation_id BIGINT,
  guest_id BIGINT,
  admin_user_id BIGINT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reservation (reservation_id),
  INDEX idx_status (status),
  INDEX idx_event_type (event_type),
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_sent_at (sent_at)
);

-- 3. Cola de notificaciones
CREATE TABLE notification_queue (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('EMAIL', 'SMS') NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  template_name VARCHAR(50) NOT NULL,
  template_data JSON NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  status ENUM('PENDING', 'PROCESSING', 'SENT', 'FAILED') DEFAULT 'PENDING',
  error_message TEXT,
  reservation_id BIGINT,
  guest_id BIGINT,
  admin_user_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_scheduled (scheduled_for, status),
  INDEX idx_status (status),
  INDEX idx_reservation (reservation_id)
);

-- Insertar configuraciones por defecto
INSERT INTO notification_settings (type, event_type, recipient_type, template_name, delay_minutes) VALUES
-- Notificaciones para huéspedes
('EMAIL', 'RESERVATION_CREATED', 'GUEST', 'reservation-confirmation', 0),
('EMAIL', 'PAYMENT_CONFIRMED', 'GUEST', 'payment-confirmation', 0),
('EMAIL', 'CHECK_IN_REMINDER', 'GUEST', 'check-in-reminder', 1440), -- 24 horas antes
('EMAIL', 'RESERVATION_CANCELLED', 'GUEST', 'reservation-cancelled', 0),

-- Notificaciones para administradores
('EMAIL', 'NEW_RESERVATION_ADMIN', 'ADMIN', 'new-reservation-admin', 0),
('EMAIL', 'PAYMENT_RECEIVED_ADMIN', 'ADMIN', 'payment-received-admin', 0),
('EMAIL', 'RESERVATION_CANCELLED_ADMIN', 'ADMIN', 'reservation-cancelled-admin', 0),
('EMAIL', 'DAILY_REPORT', 'ADMIN', 'daily-report', 0);

-- Verificar tablas creadas
SELECT 'notification_settings' as tabla, COUNT(*) as registros FROM notification_settings
UNION ALL
SELECT 'notification_logs' as tabla, COUNT(*) as registros FROM notification_logs
UNION ALL  
SELECT 'notification_queue' as tabla, COUNT(*) as registros FROM notification_queue;
