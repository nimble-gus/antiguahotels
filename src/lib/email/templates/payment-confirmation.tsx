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

interface PaymentConfirmationProps {
  guestName: string
  confirmationNumber: string
  paymentAmount: string
  currency: string
  paymentMethod: string
  processedAt: string
  dashboardUrl?: string
}

export default function PaymentConfirmation({
  guestName = 'Estimado Huésped',
  confirmationNumber = 'AH202409190001',
  paymentAmount = '500.00',
  currency = 'USD',
  paymentMethod = 'Tarjeta de Crédito',
  processedAt = '19 de septiembre, 2024 - 10:30 AM',
  dashboardUrl = 'https://dashboard.antiguahotels.com'
}: PaymentConfirmationProps) {
  const previewText = `Pago confirmado ${currency} ${paymentAmount} - Reservación ${confirmationNumber}`

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
                <Text style={headerSubtitle}>Confirmación de Pago</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Success Message */}
            <Row>
              <Column style={successSection}>
                <Text style={successIcon}>💳</Text>
                <Heading style={successTitle}>¡Pago Confirmado!</Heading>
                <Text style={successText}>
                  Estimado/a {guestName}, hemos recibido y procesado exitosamente su pago.
                </Text>
              </Column>
            </Row>

            <Hr style={divider} />

            {/* Payment Details */}
            <Row>
              <Column>
                <Heading style={sectionTitle}>💰 Detalles del Pago</Heading>
                
                <Section style={paymentBox}>
                  <Row>
                    <Column style={paymentHeader}>
                      <Text style={paymentAmountText}>{currency} {paymentAmount}</Text>
                      <Text style={paymentStatusText}>✅ CONFIRMADO</Text>
                    </Column>
                  </Row>
                  
                  <Hr style={paymentDivider} />
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Reservación:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}><strong>{confirmationNumber}</strong></Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Método de Pago:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{paymentMethod}</Text>
                    </Column>
                  </Row>
                  
                  <Row>
                    <Column style={detailLabel}>
                      <Text style={labelText}>Fecha de Procesamiento:</Text>
                    </Column>
                    <Column style={detailValue}>
                      <Text style={valueText}>{processedAt}</Text>
                    </Column>
                  </Row>
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
                    • <strong>Comprobante:</strong> Conserve este email como comprobante de pago<br />
                    • <strong>Reservación:</strong> Su reservación está ahora confirmada<br />
                    • <strong>Check-in:</strong> Presente este comprobante al momento del check-in<br />
                    • <strong>Facturación:</strong> Si necesita factura fiscal, contáctenos<br />
                    • <strong>Soporte:</strong> Para cualquier consulta sobre su pago, contáctenos
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

            {/* Receipt Section */}
            <Row>
              <Column>
                <Section style={receiptBox}>
                  <Heading style={receiptTitle}>📄 Recibo de Pago</Heading>
                  <Row>
                    <Column style={receiptLeft}>
                      <Text style={receiptLabel}>Monto Pagado:</Text>
                      <Text style={receiptLabel}>Reservación:</Text>
                      <Text style={receiptLabel}>Fecha:</Text>
                      <Text style={receiptLabel}>Estado:</Text>
                    </Column>
                    <Column style={receiptRight}>
                      <Text style={receiptValue}>{currency} {paymentAmount}</Text>
                      <Text style={receiptValue}>{confirmationNumber}</Text>
                      <Text style={receiptValue}>{processedAt}</Text>
                      <Text style={receiptValue}>✅ Confirmado</Text>
                    </Column>
                  </Row>
                </Section>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este email fue enviado automáticamente por el sistema de pagos de Antigua Hotels.
              <br />
              Para soporte, contacte a: admin@antiguahotels.com
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

// Subject function
PaymentConfirmation.subject = (props: PaymentConfirmationProps) => 
  `💳 Pago Confirmado ${props.currency} ${props.paymentAmount} - ${props.confirmationNumber}`

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
  backgroundColor: '#059669',
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
  color: '#a7f3d0',
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

const paymentBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #059669',
  borderRadius: '12px',
  padding: '24px',
  margin: '16px 0',
}

const paymentHeader = {
  textAlign: 'center' as const,
  marginBottom: '16px',
}

const paymentAmountText = {
  color: '#059669',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const paymentStatusText = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const paymentDivider = {
  borderColor: '#bbf7d0',
  margin: '16px 0',
}

const infoBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
}

const receiptBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const receiptTitle = {
  color: '#475569',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
}

const receiptLeft = {
  width: '50%',
  paddingRight: '10px',
}

const receiptRight = {
  width: '50%',
  textAlign: 'right' as const,
}

const receiptLabel = {
  color: '#64748b',
  fontSize: '14px',
  margin: '4px 0',
}

const receiptValue = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '4px 0',
}

const detailLabel = {
  width: '40%',
  paddingRight: '10px',
}

const detailValue = {
  width: '60%',
}

const labelText = {
  color: '#065f46',
  fontSize: '14px',
  margin: '4px 0',
}

const valueText = {
  color: '#064e3b',
  fontSize: '14px',
  margin: '4px 0',
}

const infoText = {
  color: '#1e40af',
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





