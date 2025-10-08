-- Script para crear tabla de mensajes de contacto
-- Permite gestionar los mensajes enviados desde el formulario de contacto

CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(40),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    preferred_contact VARCHAR(20) DEFAULT 'email',
    status ENUM('NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED') DEFAULT 'NEW',
    is_read BOOLEAN DEFAULT FALSE,
    response TEXT,
    responded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_contact_status (status),
    INDEX idx_contact_read (is_read),
    INDEX idx_contact_created (created_at),
    INDEX idx_contact_email (email)
);

-- Verificar que se creó correctamente
DESCRIBE contact_messages;

