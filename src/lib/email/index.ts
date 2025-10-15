import { Resend } from 'resend'
import { render } from '@react-email/render'
import { prisma } from '@/lib/prisma'
import ReservationConfirmation from './templates/reservation-confirmation'
import NewReservationAdminSimple from './templates/new-reservation-admin-simple'
import PaymentConfirmation from './templates/payment-confirmation'
import TestSimple from './templates/test-simple'

// Inicializar cliente de Resend
export const resend = new Resend(process.env.RESEND_API_KEY)

// Tipos para el sistema de email
export interface EmailData {
  to: string | string[]
  subject: string
  template: string
  data: Record<string, any>
  reservationId?: bigint
  guestId?: bigint
  adminUserId?: bigint
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

// Configuración base de email
export const EMAIL_CONFIG = {
  from: `${process.env.RESEND_FROM_NAME || 'Antigua Hotels'} <${process.env.RESEND_FROM_EMAIL || 'noreply@antiguahotels.com'}>`,
  replyTo: process.env.RESEND_FROM_EMAIL || 'noreply@antiguahotels.com',
}

// Función principal para enviar emails
export async function sendEmail({
  to,
  subject,
  template,
  data,
  reservationId,
  guestId,
  adminUserId
}: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    console.log('📧 Sending email:', { to, subject, template })

    // Verificar si las notificaciones están habilitadas
    if (process.env.NOTIFICATION_ENABLED !== 'true') {
      console.log('📧 Notifications disabled, skipping email')
      return { success: false, error: 'Notifications disabled' }
    }

    // Obtener el template renderizado
    const emailTemplate = await getEmailTemplate(template, data)
    if (!emailTemplate) {
      throw new Error(`Template ${template} not found`)
    }

    // Enviar email con Resend
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(to) ? to : [to],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      replyTo: EMAIL_CONFIG.replyTo,
    })

    console.log('✅ Email sent successfully:', result.data?.id)

    // Registrar en el log de notificaciones
    await logNotification({
      type: 'EMAIL',
      eventType: template,
      recipientEmail: Array.isArray(to) ? to[0] : to,
      templateName: template,
      status: 'SENT',
      providerId: result.data?.id || null,
      sentAt: new Date(),
      reservationId,
      guestId,
      adminUserId,
      metadata: { subject: emailTemplate.subject, recipients: Array.isArray(to) ? to.length : 1 }
    })

    return { success: true, messageId: result.data?.id }

  } catch (error) {
    console.error('❌ Error sending email:', error)

    // Registrar error en el log
    await logNotification({
      type: 'EMAIL',
      eventType: template,
      recipientEmail: Array.isArray(to) ? to[0] : to,
      templateName: template,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      reservationId,
      guestId,
      adminUserId,
      metadata: { subject, error: error instanceof Error ? error.message : 'Unknown error' }
    })

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Registry de templates estático
const templateRegistry = {
  'reservation-confirmation': ReservationConfirmation,
  'new-reservation-admin': NewReservationAdminSimple,
  'payment-confirmation': PaymentConfirmation,
  'test-simple': TestSimple,
} as const

// Función para obtener templates renderizados
async function getEmailTemplate(templateName: string, data: Record<string, any>): Promise<EmailTemplate | null> {
  try {
    console.log(`🔍 Loading template: ${templateName}`)
    console.log('📋 Available templates:', Object.keys(templateRegistry))

    // Obtener el template del registry
    const TemplateComponent = templateRegistry[templateName as keyof typeof templateRegistry]

    if (!TemplateComponent) {
      console.error(`❌ Template component not found: ${templateName}`)
      console.log('📋 Available templates:', Object.keys(templateRegistry))
      return null
    }

    console.log(`✅ Template ${templateName} loaded successfully`)

    // Renderizar el template con los datos
    console.log(`🎨 Rendering template with data:`, Object.keys(data))
    const renderedHtml = render(TemplateComponent(data))
    
    // Asegurar que tenemos un string (manejo robusto)
    const html = await Promise.resolve(renderedHtml).then(html => 
      typeof html === 'string' ? html : String(html)
    )
    console.log(`📄 Rendered HTML type: ${typeof renderedHtml}, length: ${html.length}`)
    
    // Generar versión de texto plano (simplificada)
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

    // Obtener el subject del template o usar uno por defecto
    const subject = TemplateComponent.subject 
      ? (typeof TemplateComponent.subject === 'function' 
          ? TemplateComponent.subject(data) 
          : TemplateComponent.subject)
      : `Notificación - ${templateName}`

    console.log(`📧 Generated subject: ${subject}`)

    return { subject, html, text }

  } catch (error) {
    console.error(`❌ Error loading template ${templateName}:`, error)
    return null
  }
}

// Función auxiliar para obtener lista de templates disponibles
function getAvailableTemplatesList(): string[] {
  return Object.keys(templateRegistry)
}

// Función para registrar notificaciones en la base de datos
async function logNotification({
  type,
  eventType,
  recipientEmail,
  recipientPhone,
  templateName,
  status,
  providerId,
  errorMessage,
  sentAt,
  openedAt,
  clickedAt,
  reservationId,
  guestId,
  adminUserId,
  metadata
}: {
  type: 'EMAIL' | 'SMS'
  eventType: string
  recipientEmail?: string
  recipientPhone?: string
  templateName: string
  status: 'PENDING' | 'SENT' | 'FAILED' | 'BOUNCED'
  providerId?: string | null
  errorMessage?: string
  sentAt?: Date
  openedAt?: Date
  clickedAt?: Date
  reservationId?: bigint
  guestId?: bigint
  adminUserId?: bigint
  metadata?: Record<string, any>
}) {
  try {
    await prisma.notificationLog.create({
      data: {
        type,
        eventType,
        recipientEmail,
        recipientPhone,
        templateName,
        status,
        providerId,
        errorMessage,
        sentAt,
        openedAt,
        clickedAt,
        reservationId,
        guestId,
        adminUserId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })
  } catch (error) {
    console.error('Error logging notification:', error)
  }
}

// Función utilitaria para enviar emails a administradores
export async function sendEmailToAdmins(
  subject: string, 
  template: string, 
  data: Record<string, any>,
  reservationId?: bigint
) {
  const adminEmails = [process.env.ADMIN_EMAIL].filter(Boolean) as string[]
  
  if (adminEmails.length === 0) {
    console.warn('No admin emails configured')
    return { success: false, error: 'No admin emails configured' }
  }

  return sendEmail({
    to: adminEmails,
    subject,
    template,
    data,
    reservationId
  })
}

// Función para probar la configuración de email
export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: [process.env.ADMIN_EMAIL || 'test@example.com'],
      subject: '🧪 Test de Configuración - Sistema de Notificaciones',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>✅ Configuración de Email Exitosa</h2>
          <p>Este es un email de prueba para confirmar que el sistema de notificaciones está funcionando correctamente.</p>
          <hr style="margin: 20px 0; border: 1px solid #eee;">
          <p><strong>Configuración:</strong></p>
          <ul>
            <li>Proveedor: Resend</li>
            <li>From: ${EMAIL_CONFIG.from}</li>
            <li>Fecha: ${new Date().toLocaleString()}</li>
          </ul>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Este email fue enviado automáticamente por el sistema de notificaciones de Antigua Hotels.
          </p>
        </div>
      `,
    })

    console.log('✅ Test email sent successfully:', result.data?.id)
    return { success: true }

  } catch (error) {
    console.error('❌ Test email failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
