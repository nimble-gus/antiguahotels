// Registry de templates para importación estática
import ReservationConfirmation from './reservation-confirmation'
import NewReservationAdmin from './new-reservation-admin'

export const emailTemplates = {
  'reservation-confirmation': ReservationConfirmation,
  'new-reservation-admin': NewReservationAdmin,
  // Agregar más templates aquí cuando los creemos
  'payment-confirmation': null, // Por implementar
  'check-in-reminder': null, // Por implementar
  'reservation-cancelled': null, // Por implementar
} as const

export type EmailTemplateName = keyof typeof emailTemplates

// Función para obtener un template
export function getEmailTemplate(templateName: string) {
  const template = emailTemplates[templateName as EmailTemplateName]
  
  if (!template) {
    console.error(`Template not found: ${templateName}`)
    console.log('Available templates:', Object.keys(emailTemplates))
    return null
  }
  
  return template
}

// Función para verificar si un template existe
export function templateExists(templateName: string): boolean {
  return templateName in emailTemplates && emailTemplates[templateName as EmailTemplateName] !== null
}

// Lista de templates disponibles
export function getAvailableTemplates(): string[] {
  return Object.keys(emailTemplates).filter(name => 
    emailTemplates[name as EmailTemplateName] !== null
  )
}









