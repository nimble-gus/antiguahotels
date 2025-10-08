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
  Preview,
} from '@react-email/components'

interface NewReservationAdminProps {
  confirmationNumber: string
  guestName: string
  guestEmail: string
  guestPhone: string
  hotelName: string
  roomType: string
  checkInDate: string
  checkOutDate: string
  nights: number
  guests: number
  totalAmount: string
  currency: string
  paymentStatus: string
  source: string
  createdAt: string
  dashboardUrl?: string
}

export default function NewReservationAdmin({
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
  dashboardUrl = 'https://dashboard.antiguahotels.com'
}: NewReservationAdminProps) {
  const previewText = `Nueva reservación ${confirmationNumber} - ${guestName}`

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#059669'
      case 'PENDING': return '#d97706'
      case 'PARTIAL': return '#0ea5e9'
      case 'FAILED': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pagado'
      case 'PENDING': return 'Pendiente'
      case 'PARTIAL': return 'Parcial'
      case 'FAILED': return 'Fallido'
      default: return status
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'WEBSITE': return 'Sitio Web'
      case 'PHONE': return 'Teléfono'
      case 'EMAIL': return 'Email'
      case 'WALK_IN': return 'Walk-in'
      case 'ADMIN': return 'Dashboard Admin'
      default: return source
    }
  }

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
                <Heading style={headerTitle}>🆕 Nueva Reservación</Heading>
                <Text style={headerSubtitle}>Dashboard Administrativo - Antigua Hotels</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Alert Section */}
            <Row>
              <Column style={alertSection}>
                <Text style={alertIcon}>🔔</Text>
                <Heading style={alertTitle}>Nueva Reservación Recibida</Heading>
                <Text style={alertText}>
                  Se ha registrado una nueva reservación en el sistema.
                  Revise los detalles a continuación.
                </Text>
              </Column>
            </Row>

            <Hr style={divider} />

            {/* Quick Info */}
            <Row>
              <Column>
                <Section style={quickInfoBox}>
                  <Row>
                    <Column style={quickInfoItem}>
                      <Text style={quickInfoLabel}>Código:</Text>
                      <Text style={quickInfoValue}>{confirmationNumber}</Text>
                    </Column>
                    <Column style={quickInfoItem}>
                      <Text style={quickInfoLabel}>Huésped:</Text>
                      <Text style={quickInfoValue}>{guestName}</Text>
                    </Column>
                    <Column style={quickInfoItem}>
                      <Text style={quickInfoLabel}>Total:</Text>
                      <Text style={quickInfoValue}>{currency} {totalAmount}</Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>

            <Hr style={divider} />

            {/* Guest Information */}
            <Row>
              <Column>
                <Heading style={sectionTitle}>👤 Información del Huésped</Heading>
                <Section style={detailsBox}>
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Nombre Completo:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}><strong>{guestName}</strong></Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Email:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{guestEmail}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Teléfono:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{guestPhone}</Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>

            {/* Reservation Details */}
            <Row>
              <Column>
                <Heading style={sectionTitle}>📋 Detalles de la Reservación</Heading>
                <Section style={detailsBox}>
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Hotel:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}><strong>{hotelName}</strong></Text>
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

            {/* Payment & Status */}
            <Row>
              <Column>
                <Heading style={sectionTitle}>💳 Estado de Pago</Heading>
                <Section style={paymentBox}>
                  <Row>
                    <Column style={paymentLabel}>
                      <Text style={paymentLabelText}>Total:</Text>
                    </Column>
                    <Column style={paymentValue}>
                      <Text style={paymentAmountText}>{currency} {totalAmount}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={paymentLabel}>
                      <Text style={paymentLabelText}>Estado:</Text>
                    </Column>
                    <Column style={paymentValue}>
                      <Text style={{
                        ...paymentStatusText,
                        color: getPaymentStatusColor(paymentStatus)
                      }}>
                        {getPaymentStatusLabel(paymentStatus)}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>

            {/* System Information */}
            <Row>
              <Column>
                <Heading style={sectionTitle}>⚙️ Información del Sistema</Heading>
                <Section style={systemBox}>
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Fuente:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{getSourceLabel(source)}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Fecha de Creación:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{createdAt}</Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>

            {/* Action Buttons */}
            <Row>
              <Column style={buttonContainer}>
                <Button style={primaryButton} href={`${dashboardUrl}/reservations`}>
                  Ver en Dashboard
                </Button>
                <Text style={buttonSpacer}></Text>
                <Button style={secondaryButton} href={`${dashboardUrl}/payments`}>
                  Gestionar Pago
                </Button>
              </Column>
            </Row>

            {/* Important Notice */}
            <Row>
              <Column>
                <Section style={noticeBox}>
                  <Text style={noticeText}>
                    <strong>⚠️ Acción Requerida:</strong><br />
                    {paymentStatus === 'PENDING' && 'Esta reservación requiere confirmación de pago.'}
                    {paymentStatus === 'PAID' && 'Esta reservación está completamente pagada.'}
                    {paymentStatus === 'PARTIAL' && 'Esta reservación tiene un pago parcial pendiente.'}
                    {paymentStatus === 'FAILED' && 'El pago de esta reservación ha fallado, contacte al huésped.'}
                  </Text>
                </Section>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este email fue enviado automáticamente por el sistema de notificaciones administrativas.
              <br />
              Dashboard: <a href={dashboardUrl} style={footerLink}>{dashboardUrl}</a>
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerCopyright}>
              © 2024 Antigua Hotels - Sistema Administrativo
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Subject function
NewReservationAdmin.subject = (props: NewReservationAdminProps) => 
  `🆕 Nueva Reservación ${props.confirmationNumber} - ${props.guestName}`

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
  backgroundColor: '#dc2626',
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const headerSubtitle = {
  color: '#fca5a5',
  fontSize: '14px',
  margin: '0',
}

const content = {
  padding: '30px',
}

const alertSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  margin: '0 0 20px 0',
}

const alertIcon = {
  fontSize: '32px',
  margin: '0 0 12px 0',
}

const alertTitle = {
  color: '#dc2626',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const alertText = {
  color: '#7f1d1d',
  fontSize: '14px',
  margin: '0',
}

const quickInfoBox = {
  backgroundColor: '#1f2937',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
}

const quickInfoItem = {
  textAlign: 'center' as const,
  width: '33.33%',
}

const quickInfoLabel = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
}

const quickInfoValue = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const sectionTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
}

const paymentBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #22c55e',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
}

const systemBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #64748b',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
}

const noticeBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
}

const detailLabel = {
  width: '40%',
  paddingRight: '10px',
}

const detailValue = {
  width: '60%',
}

const paymentLabel = {
  width: '30%',
}

const paymentValue = {
  width: '70%',
  textAlign: 'right' as const,
}

const labelText = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '2px 0',
}

const valueText = {
  color: '#1f2937',
  fontSize: '13px',
  margin: '2px 0',
}

const paymentLabelText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '2px 0',
}

const paymentAmountText = {
  color: '#065f46',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '2px 0',
}

const paymentStatusText = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '2px 0',
}

const noticeText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const primaryButton = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  marginRight: '10px',
}

const secondaryButton = {
  backgroundColor: '#6b7280',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  marginLeft: '10px',
}

const buttonSpacer = {
  display: 'inline-block',
  width: '10px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
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
  margin: '0 0 12px 0',
}

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
}

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '11px',
  margin: '0',
}





