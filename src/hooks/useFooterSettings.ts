'use client'

import { useState, useEffect } from 'react'

interface FooterSettings {
  phone?: string
  email?: string
  address?: string
  address_detail?: string
  phone_hours?: string
  email_response?: string
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  company_name?: string
  description?: string
  copyright?: string
  made_with_love?: string
}

export function useFooterSettings() {
  const [settings, setSettings] = useState<FooterSettings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/public/settings')
        
        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings)
        } else {
          setError('Error cargando configuraciones')
        }
      } catch (err) {
        setError('Error de conexión')
        console.error('Error fetching footer settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error }
}



