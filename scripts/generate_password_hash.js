// Script para generar hashes de contraseñas
// Ejecutar con: node generate_password_hash.js

const bcrypt = require('bcryptjs');

// Función para generar hash
async function generateHash(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

// Función para verificar hash
async function verifyHash(password, hash) {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
}

// Ejemplos de uso
async function examples() {
    console.log('🔐 Generador de Hashes para Contraseñas\n');
    
    // Generar hashes para contraseñas comunes
    const passwords = ['admin123', 'password', 'manager123', 'hotel2024'];
    
    for (const pwd of passwords) {
        const hash = await generateHash(pwd);
        console.log(`Contraseña: "${pwd}"`);
        console.log(`Hash: ${hash}`);
        console.log(`Verificación: ${await verifyHash(pwd, hash)}\n`);
    }
    
    console.log('💡 Para usar en SQL:');
    console.log(`INSERT INTO admin_users (..., password_hash, ...) VALUES (..., '${await generateHash('tucontraseña')}', ...);`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    examples().catch(console.error);
}

module.exports = { generateHash, verifyHash };



