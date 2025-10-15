import { NextResponse } from 'next/server'
import ReservationConfirmation from '@/lib/email/templates/reservation-confirmation'
import NewReservationAdmin from '@/lib/email/templates/new-reservation-admin'
import { render } from '@react-email/render'

export async function GET() {
  try {
    console.log('🔍 Debug: Checking template imports...')

    // Verificar que los templates se importan correctamente
    const templateStatus = {
      'reservation-confirmation': {
        imported: !!ReservationConfirmation,
        hasSubject: !!(ReservationConfirmation as any).subject,
        type: typeof ReservationConfirmation
      },
      'new-reservation-admin': {
        imported: !!NewReservationAdmin,
        hasSubject: !!(NewReservationAdmin as any).subject,
        type: typeof NewReservationAdmin
      }
    }

    console.log('📊 Template status:', templateStatus)

    // Intentar renderizar un template simple
    let renderTest = null
    try {
      const testData = {
        guestName: 'Test User',
        confirmationNumber: 'TEST123',
        hotelName: 'Test Hotel',
        hotelAddress: 'Test Address',
        hotelPhone: '123-456-7890',
        checkInDate: '2024-01-01',
        checkOutDate: '2024-01-03',
        totalAmount: '300.00',
        currency: 'USD',
        roomType: 'Standard Room',
        adults: 2,
        children: 0,
        nights: 2,
        guests: 2
      }

      const html = await Promise.resolve(render(ReservationConfirmation(testData)))
      renderTest = {
        success: true,
        htmlLength: typeof html === 'string' ? html.length : 'Not a string',
        htmlType: typeof html,
        htmlPreview: typeof html === 'string' ? html.substring(0, 200) + '...' : 'Cannot preview - not a string'
      }
    } catch (renderError) {
      renderTest = {
        success: false,
        error: renderError instanceof Error ? renderError.message : 'Unknown render error'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Template debug information',
      templates: templateStatus,
      renderTest,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasResendKey: !!process.env.RESEND_API_KEY,
        notificationEnabled: process.env.NOTIFICATION_ENABLED
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
