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
  Img,
  Link,
  Preview,
} from '@react-email/components'

interface ReservationConfirmationProps {
  guestName: string
  confirmationNumber: string
  hotelName: string
  hotelAddress: string
  hotelPhone: string
  checkInDate: string
  checkOutDate: string
  nights: number
  roomType: string
  guests: number
  totalAmount: string
  currency: string
  reservationItems?: Array<{
    type: string
    name: string
    amount: string
  }>
  dashboardUrl?: string
}

export default function ReservationConfirmation({
  guestName = 'Estimado Huésped',
  confirmationNumber = 'AH202409190001',
  hotelName = 'Hotel Casa Antigua',
  hotelAddress = 'Calle Real 123, Antigua Guatemala',
  hotelPhone = '+502 1234-5678',
  checkInDate = '20 de septiembre, 2024',
  checkOutDate = '23 de septiembre, 2024',
  nights = 3,
  roomType = 'Habitación Deluxe',
  guests = 2,
  totalAmount = '750.00',
  currency = 'USD',
  reservationItems = [],
  dashboardUrl = 'https://dashboard.antiguahotels.com'
}: ReservationConfirmationProps) {
  const previewText = `Confirmación de reservación ${confirmationNumber} - ${hotelName}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={headerTitle}>Antigua Hotels</Heading>
                <Text style={headerSubtitle}>Experiencias Únicas en Guatemala</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Success Message */}
            <Row>
              <Column style={successSection}>
                <Text style={successIcon}>✅</Text>
                <Heading style={successTitle}>¡Reservación Confirmada!</Heading>
                <Text style={successText}>
                  Estimado/a {guestName}, gracias por elegir {hotelName}. 
                  Su reservación ha sido confirmada exitosamente.
                </Text>
              </Column>
            </Row>

            <Hr style={divider} />

            {/* Reservation Details */}
            <Row>
              <Column>
                <Heading style={sectionTitle}>📋 Detalles de su Reservación</Heading>
                
                <Section style={detailsBox}>
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Código de Confirmación:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}><strong>{confirmationNumber}</strong></Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Hotel:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{hotelName}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Tipo de Habitación:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{roomType}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Check-in:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{checkInDate}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Check-out:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{checkOutDate}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Noches:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{nights} {nights === 1 ? 'noche' : 'noches'}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Huéspedes:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{guests} {guests === 1 ? 'persona' : 'personas'}</Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>

            {/* Additional Services */}
            {reservationItems && reservationItems.length > 0 && (
              <>
                <Hr style={divider} />
                <Row>
                  <Column>
                    <Heading style={sectionTitle}>🎯 Servicios Adicionales</Heading>
                    <Section style={servicesBox}>
                      {reservationItems.map((item, index) => (
                        <Row key={index}>
                          <Column style={serviceLabel}>
                            <Text style={labelText}>{item.name}:</Text>
                          </Column>
                          <Column style={serviceValue}>
                            <Text style={valueText}>{currency} {item.amount}</Text>
                          </Column>
                        </Row>
                      ))}
                    </Section>
                  </Column>
                </Row>
              </>
            )}

            <Hr style={divider} />

            {/* Total Amount */}
            <Row>
              <Column>
                <Section style={totalBox}>
                  <Row>
                    <Column style={totalLabel}>
                      <Text style={totalText}>Total a Pagar:</Text>
                    </Column>
                    <Column style={totalValue}>
                      <Text style={totalAmountStyle}>{currency} {totalAmount}</Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>

            <Hr style={divider} />

            {/* Hotel Information */}
            <Row>
              <Column>
                <Heading style={sectionTitle}>🏨 Información del Hotel</Heading>
                <Section style={hotelBox}>
                  <Text style={hotelInfo}>
                    <strong>{hotelName}</strong><br />
                    📍 {hotelAddress}<br />
                    📞 {hotelPhone}
                  </Text>
                </Section>
              </Column>
            </Row>

            <Hr style={divider} />

            {/* Important Information */}
            <Row>
              <Column>
                <Heading style={sectionTitle}>ℹ️ Información Importante</Heading>
                <Section style={infoBox}>
                  <Text style={infoText}>
                    • <strong>Check-in:</strong> A partir de las 3:00 PM<br />
                    • <strong>Check-out:</strong> Hasta las 12:00 PM<br />
                    • <strong>Documentos:</strong> Presente su DPI/Pasaporte al momento del check-in<br />
                    • <strong>Cancelaciones:</strong> Consulte nuestra política de cancelación<br />
                    • <strong>Contacto:</strong> Para cualquier consulta, contáctenos al {hotelPhone}
                  </Text>
                </Section>
              </Column>
            </Row>

            {/* Action Button */}
            <Row>
              <Column style={buttonContainer}>
                <Button style={button} href={`${dashboardUrl}/reservations`}>
                  Ver Mi Reservación
                </Button>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este email fue enviado automáticamente por el sistema de reservaciones de Antigua Hotels.
              <br />
              Para soporte técnico, contacte a: admin@antiguahotels.com
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerCopyright}>
              © 2024 Antigua Hotels. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Subject function for dynamic subject generation
ReservationConfirmation.subject = (props: ReservationConfirmationProps) => 
  `✅ Confirmación de Reservación ${props.confirmationNumber} - ${props.hotelName}`

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#1f2937',
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const headerSubtitle = {
  color: '#9ca3af',
  fontSize: '16px',
  margin: '0',
}

const content = {
  padding: '30px',
}

const successSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
}

const successIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
}

const successTitle = {
  color: '#059669',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const successText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const sectionTitle = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const servicesBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const hotelBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const infoBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #0ea5e9',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const totalBox = {
  backgroundColor: '#059669',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const detailLabel = {
  width: '40%',
  paddingRight: '10px',
}

const detailValue = {
  width: '60%',
}

const serviceLabel = {
  width: '70%',
  paddingRight: '10px',
}

const serviceValue = {
  width: '30%',
  textAlign: 'right' as const,
}

const totalLabel = {
  width: '60%',
}

const totalValue = {
  width: '40%',
  textAlign: 'right' as const,
}

const labelText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '4px 0',
}

const valueText = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '4px 0',
}

const totalText = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
}

const totalAmountStyle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
}

const hotelInfo = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const infoText = {
  color: '#0c4a6e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#059669',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer = {
  backgroundColor: '#f9fafb',
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 16px 0',
}

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}








