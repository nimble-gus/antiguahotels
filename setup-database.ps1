# Script de PowerShell para configurar la base de datos
# Ejecutar: .\setup-database.ps1

Write-Host "Configurando base de datos..." -ForegroundColor Green

# Leer la contraseña de MySQL
$password = Read-Host "Ingresa la contraseña de MySQL" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($plainPassword))

# Ejecutar script de contenido de páginas
Write-Host "Creando tabla de contenido de páginas..." -ForegroundColor Yellow
$content = Get-Content "bd/create_pages_content_table.sql" -Raw
$content | mysql -u root -p$plainPassword

# Ejecutar script de mensajes de contacto
Write-Host "Creando tabla de mensajes de contacto..." -ForegroundColor Yellow
$content = Get-Content "bd/create_contact_messages_table.sql" -Raw
$content | mysql -u root -p$plainPassword

Write-Host "¡Base de datos configurada exitosamente!" -ForegroundColor Green

