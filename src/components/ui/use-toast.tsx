export function useToast() {
  const toast = ({ title, description, variant = 'default' }: any) => {
    // Simple implementation using browser alert for now
    const message = title ? `${title}: ${description || ''}` : description || 'Notificación'
    alert(message)
    
    return {
      id: Date.now().toString(),
      dismiss: () => {},
      update: () => {}
    }
  }

  return { toast }
}

export function Toaster() {
  return null
}
