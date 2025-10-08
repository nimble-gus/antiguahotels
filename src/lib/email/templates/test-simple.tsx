import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
} from '@react-email/components'

interface TestSimpleProps {
  name?: string
  message?: string
}

export default function TestSimple({
  name = 'Usuario de Prueba',
  message = 'Este es un email de prueba'
}: TestSimpleProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#333', fontSize: '24px' }}>
            ¡Hola {name}!
          </Heading>
          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
            {message}
          </Text>
          <Text style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
            Este email fue enviado desde el sistema de notificaciones de Antigua Hotels.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// Subject estático simple
TestSimple.subject = 'Prueba de Email - Antigua Hotels'





