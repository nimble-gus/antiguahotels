// Script para probar conexión directa a MySQL
require('dotenv').config()
const mysql = require('mysql2/promise')

async function testConnection() {
  console.log('🔍 Testing database connection...')
  
  // Extraer de DATABASE_URL si existe
  const databaseUrl = process.env.DATABASE_URL
  console.log('🔗 DATABASE_URL exists:', !!databaseUrl)
  
  const dbConfig = {
    host: process.env.DB_HOST || process.env.DATABASE_HOST,
    port: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '3306'),
    user: process.env.DB_USER || process.env.DATABASE_USER,
    password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
    database: process.env.DB_NAME || process.env.DATABASE_NAME,
    ssl: { rejectUnauthorized: false }
  }

  console.log('📋 Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    password: dbConfig.password ? '***hidden***' : 'MISSING'
  })

  try {
    const connection = await mysql.createConnection(dbConfig)
    console.log('✅ Connected to database successfully')
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM activities')
    console.log('📊 Activities count:', rows[0].count)
    
    // Test entity_images table
    const [imageRows] = await connection.execute('SELECT COUNT(*) as count FROM entity_images')
    console.log('📸 Entity images count:', imageRows[0].count)
    
    await connection.end()
    console.log('✅ Database test completed successfully')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
}

testConnection()
