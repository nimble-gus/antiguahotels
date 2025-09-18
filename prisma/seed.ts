import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@antiguahotels.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@antiguahotels.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create amenities
  const amenities = await Promise.all([
    // Hotel amenities
    prisma.amenity.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Free WiFi',
        description: 'Complimentary wireless internet access',
        icon: 'wifi',
        category: 'HOTEL',
      },
    }),
    prisma.amenity.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Free Parking',
        description: 'Complimentary parking space',
        icon: 'parking',
        category: 'HOTEL',
      },
    }),
    prisma.amenity.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Swimming Pool',
        description: 'Outdoor or indoor swimming pool',
        icon: 'pool',
        category: 'HOTEL',
      },
    }),
    prisma.amenity.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Fitness Center',
        description: 'Gym with exercise equipment',
        icon: 'gym',
        category: 'HOTEL',
      },
    }),
    // Room amenities
    prisma.amenity.upsert({
      where: { id: 5 },
      update: {},
      create: {
        name: 'Air Conditioning',
        description: 'Climate control in room',
        icon: 'ac',
        category: 'ROOM',
      },
    }),
    prisma.amenity.upsert({
      where: { id: 6 },
      update: {},
      create: {
        name: 'Mini Bar',
        description: 'In-room refrigerated mini bar',
        icon: 'minibar',
        category: 'ROOM',
      },
    }),
    // Activity amenities
    prisma.amenity.upsert({
      where: { id: 7 },
      update: {},
      create: {
        name: 'Equipment Included',
        description: 'All necessary equipment provided',
        icon: 'equipment',
        category: 'ACTIVITY',
      },
    }),
    prisma.amenity.upsert({
      where: { id: 8 },
      update: {},
      create: {
        name: 'Professional Guide',
        description: 'Expert guide included',
        icon: 'guide',
        category: 'ACTIVITY',
      },
    }),
  ])

  console.log('✅ Amenities created:', amenities.length)

  // Create airports
  const airports = await Promise.all([
    prisma.airport.upsert({
      where: { iata: 'GUA' },
      update: {},
      create: {
        iata: 'GUA',
        name: 'La Aurora International Airport',
        city: 'Guatemala City',
        country: 'Guatemala',
      },
    }),
    prisma.airport.upsert({
      where: { iata: 'FRS' },
      update: {},
      create: {
        iata: 'FRS',
        name: 'Mundo Maya International Airport',
        city: 'Flores',
        country: 'Guatemala',
      },
    }),
  ])

  console.log('✅ Airports created:', airports.length)

  // Create sample hotel
  const hotel = await prisma.hotel.upsert({
    where: { code: 'AH001' },
    update: {},
    create: {
      name: 'Hotel Casa Antigua',
      code: 'AH001',
      brand: 'Antigua Hotels',
      description: 'Beautiful colonial hotel in the heart of Antigua Guatemala',
      address: 'Calle del Arco #30, Antigua Guatemala',
      city: 'Antigua Guatemala',
      country: 'Guatemala',
      latitude: 14.5586,
      longitude: -90.7339,
      phone: '+502-7832-0000',
      email: 'reservas@casaantigua.com',
    },
  })

  console.log('✅ Hotel created:', hotel.name)

  // Create room types
  const roomTypes = await Promise.all([
    prisma.roomType.upsert({
      where: { id: 1 },
      update: {},
      create: {
        hotelId: hotel.id,
        name: 'Standard Double',
        description: 'Comfortable room with double bed',
        occupancy: 2,
        maxAdults: 2,
        maxChildren: 1,
        bedConfiguration: '1 Double Bed',
        roomSizeSqm: 25,
        baseRate: 85.00,
      },
    }),
    prisma.roomType.upsert({
      where: { id: 2 },
      update: {},
      create: {
        hotelId: hotel.id,
        name: 'Junior Suite',
        description: 'Spacious suite with separate sitting area',
        occupancy: 3,
        maxAdults: 2,
        maxChildren: 2,
        bedConfiguration: '1 King Bed + Sofa Bed',
        roomSizeSqm: 40,
        baseRate: 120.00,
      },
    }),
  ])

  console.log('✅ Room types created:', roomTypes.length)

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomTypeId: roomTypes[0].id,
        code: '101',
        floorNumber: 1,
      },
    }),
    prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomTypeId: roomTypes[0].id,
        code: '102',
        floorNumber: 1,
      },
    }),
    prisma.room.create({
      data: {
        hotelId: hotel.id,
        roomTypeId: roomTypes[1].id,
        code: '201',
        floorNumber: 2,
      },
    }),
  ])

  console.log('✅ Rooms created:', rooms.length)

  // Create sample activity
  const activity = await prisma.activity.create({
    data: {
      name: 'Volcano Hiking Tour',
      description: 'Guided hiking tour to Pacaya Volcano with transportation included',
      shortDescription: 'Adventure hiking to active volcano',
      durationHours: 6,
      minParticipants: 2,
      maxParticipants: 15,
      basePrice: 45.00,
      difficultyLevel: 'moderate',
      location: 'Pacaya Volcano National Park',
      meetingPoint: 'Hotel lobby at 6:00 AM',
      whatIncludes: 'Transportation, guide, entrance fees, snacks',
      whatToBring: 'Comfortable shoes, water, camera, sunscreen',
    },
  })

  console.log('✅ Activity created:', activity.name)

  // Create sample package
  const packageItem = await prisma.package.create({
    data: {
      name: 'Antigua Adventure Package',
      description: '3-day package including accommodation, volcano tour, and city exploration',
      shortDescription: 'Complete Antigua experience',
      durationDays: 3,
      durationNights: 2,
      minParticipants: 1,
      maxParticipants: 4,
      basePrice: 299.00,
      whatIncludes: '2 nights accommodation, volcano tour, city tour, breakfast',
      whatExcludes: 'Lunch, dinner, personal expenses',
      itinerary: 'Day 1: Arrival and city tour\nDay 2: Volcano hiking\nDay 3: Departure',
    },
  })

  console.log('✅ Package created:', packageItem.name)

  // Create sample guest
  const guest = await prisma.guest.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '+502-1234-5678',
      country: 'Guatemala',
    },
  })

  console.log('✅ Guest created:', `${guest.firstName} ${guest.lastName}`)

  // Create system settings
  const settings = await Promise.all([
    prisma.systemSetting.upsert({
      where: { settingKey: 'site_name' },
      update: {},
      create: {
        settingKey: 'site_name',
        settingValue: 'Antigua Hotels',
        dataType: 'STRING',
        description: 'Name of the website',
        isPublic: true,
      },
    }),
    prisma.systemSetting.upsert({
      where: { settingKey: 'default_currency' },
      update: {},
      create: {
        settingKey: 'default_currency',
        settingValue: 'USD',
        dataType: 'STRING',
        description: 'Default currency',
        isPublic: false,
      },
    }),
    prisma.systemSetting.upsert({
      where: { settingKey: 'booking_cancellation_hours' },
      update: {},
      create: {
        settingKey: 'booking_cancellation_hours',
        settingValue: '24',
        dataType: 'INTEGER',
        description: 'Hours before check-in to allow free cancellation',
        isPublic: false,
      },
    }),
  ])

  console.log('✅ System settings created:', settings.length)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
