import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface NewReservationAdminProps {
  confirmationNumber?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  hotelName?: string
  roomType?: string
  checkInDate?: string
  checkOutDate?: string
  nights?: number
  guests?: number
  totalAmount?: string
  currency?: string
  paymentStatus?: string
  source?: string
  createdAt?: string
  dashboardUrl?: string
}

export default function NewReservationAdminSimple({
  confirmationNumber = 'AH202409190001',
  guestName = 'Juan Pérez',
  guestEmail = 'juan@example.com',
  guestPhone = '+502 1234-5678',
  hotelName = 'Hotel Casa Antigua',
  roomType = 'Habitación Deluxe',
  checkInDate = '20 de septiembre, 2024',
  checkOutDate = '23 de septiembre, 2024',
  nights = 3,
  guests = 2,
  totalAmount = '750.00',
  currency = 'USD',
  paymentStatus = 'PENDING',
  source = 'WEBSITE',
  createdAt = '19 de septiembre, 2024 - 10:30 AM',
  dashboardUrl = 'http://localhost:3000/dashboard'
}: NewReservationAdminProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>🆕 Nueva Reservación</Heading>
            <Text style={subtitle}>
              Se ha creado una nueva reservación en el sistema
            </Text>
          </Section>

          <Section style={content}>
            <Row>
              <Column>
                <Heading style={h2}>Detalles de la Reservación</Heading>
                
                <Text style={label}>Número de Confirmación:</Text>
                <Text style={value}>{confirmationNumber}</Text>
                
                <Text style={label}>Huésped:</Text>
                <Text style={value}>{guestName}</Text>
                
                <Text style={label}>Email:</Text>
                <Text style={value}>{guestEmail}</Text>
                
                <Text style={label}>Teléfono:</Text>
                <Text style={value}>{guestPhone}</Text>
                
                <Hr style={divider} />
                
                <Text style={label}>Hotel:</Text>
                <Text style={value}>{hotelName}</Text>
                
                <Text style={label}>Tipo de Habitación:</Text>
                <Text style={value}>{roomType}</Text>
                
                <Text style={label}>Check-in:</Text>
                <Text style={value}>{checkInDate}</Text>
                
                <Text style={label}>Check-out:</Text>
                <Text style={value}>{checkOutDate}</Text>
                
                <Text style={label}>Noches:</Text>
                <Text style={value}>{nights}</Text>
                
                <Text style={label}>Huéspedes:</Text>
                <Text style={value}>{guests}</Text>
                
                <Hr style={divider} />
                
                <Text style={label}>Total:</Text>
                <Text style={totalAmountStyle}>{currency} {totalAmount}</Text>
                
                <Text style={label}>Estado de Pago:</Text>
                <Text style={value}>{paymentStatus}</Text>
                
                <Text style={label}>Origen:</Text>
                <Text style={value}>{source}</Text>
                
                <Text style={label}>Fecha de Creación:</Text>
                <Text style={value}>{createdAt}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={footer}>
            <Button style={button} href={dashboardUrl}>
              Ver en Dashboard
            </Button>
            
            <Hr style={footerDivider} />
            
            <Text style={footerText}>
              Este es un email automático del sistema de reservaciones de Antigua Hotels.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Estilos
const body = {
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f8fafc',
  margin: 0,
  padding: 0,
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const header = {
  backgroundColor: '#3b82f6',
  padding: '24px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const subtitle = {
  color: '#e0e7ff',
  fontSize: '16px',
  margin: '0',
}

const content = {
  padding: '24px',
}

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const label = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '16px 0 4px 0',
}

const value = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 8px 0',
}

const totalAmountStyle = {
  color: '#059669',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  display: 'inline-block',
  marginBottom: '16px',
}

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
}
