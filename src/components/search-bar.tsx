'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  Calendar, 
  Users, 
  Search,
  ChevronDown,
  Hotel,
  Plane,
  Car,
  Package,
  CalendarDays,
  Plus,
  Minus
} from 'lucide-react'

interface SearchOption {
  id: string
  label: string
  icon: React.ComponentType<any>
  route: string
}

// Los searchOptions se definen dentro del componente para acceder a las traducciones

export default function SearchBar() {
  const router = useRouter()
  const { t, currentLanguage } = useLanguage()
  
  // Definir searchOptions usando las traducciones
  const searchOptions: SearchOption[] = useMemo(() => [
    { id: 'accommodations', label: t('search.accommodations'), icon: Hotel, route: '/accommodations' },
    { id: 'activities', label: t('search.activities'), icon: Plane, route: '/activities' },
    { id: 'shuttle', label: t('search.shuttle'), icon: Car, route: '/shuttle' },
    { id: 'packages', label: t('search.packages'), icon: Package, route: '/packages' }
  ], [t])
  
  const [selectedService, setSelectedService] = useState(searchOptions[0])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 })
  
  // Actualizar selectedService cuando cambien las traducciones
  useEffect(() => {
    setSelectedService(searchOptions[0])
  }, [searchOptions])
  
  // Dropdown states
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showGuestSelector, setShowGuestSelector] = useState(false)
  const [calendarType, setCalendarType] = useState<'checkin' | 'checkout'>('checkin')

  // Refs for click outside detection
  const serviceRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const guestRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceRef.current && !serviceRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false)
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuestSelector(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day))
    }
    
    return days
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    
    if (calendarType === 'checkin') {
      setCheckIn(dateString)
      setCalendarType('checkout')
    } else {
      setCheckOut(dateString)
      setShowCalendar(false)
    }
  }

  const updateGuests = (type: 'adults' | 'children' | 'rooms', operation: 'add' | 'subtract') => {
    setGuests(prev => {
      const newValue = operation === 'add' ? prev[type] + 1 : Math.max(0, prev[type] - 1)
      
      // Validations
      if (type === 'adults' && newValue < 1) return prev
      if (type === 'rooms' && newValue < 1) return prev
      if (type === 'children' && newValue < 0) return prev
      
      return { ...prev, [type]: newValue }
    })
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (checkIn) params.set('checkin', checkIn)
    if (checkOut) params.set('checkout', checkOut)
    params.set('adults', guests.adults.toString())
    params.set('children', guests.children.toString())
    params.set('rooms', guests.rooms.toString())
    
    const url = `${selectedService.route}?${params.toString()}`
    router.push(url)
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="relative py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            
            {/* Service Type Selector */}
            <div className="flex-1 min-w-0" ref={serviceRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.service_type')}
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-antigua-purple focus:outline-none focus:ring-2 focus:ring-antigua-purple focus:border-transparent transition-colors"
                >
                  <div className="flex items-center">
                    <selectedService.icon className="h-5 w-5 text-antigua-purple mr-3" />
                    <span className="text-gray-900">{selectedService.label}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showServiceDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {searchOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedService(option)
                          setShowServiceDropdown(false)
                        }}
                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        <option.icon className="h-5 w-5 text-antigua-purple mr-3" />
                        <span className="text-gray-900">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="flex-1 min-w-0" ref={calendarRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.dates')}
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCalendar(!showCalendar)
                    setCalendarType('checkin')
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-antigua-purple focus:outline-none focus:ring-2 focus:ring-antigua-purple focus:border-transparent transition-colors"
                >
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {checkIn && checkOut 
                        ? `${formatDate(checkIn)} - ${formatDate(checkOut)}`
                        : t('search.select_dates')
                      }
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                </button>
                
                {showCalendar && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {calendarType === 'checkin' ? t('search.select_checkin') : t('search.select_checkout')}
                      </p>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                      
                      {calendarDays.map((date, index) => (
                        <button
                          key={index}
                          onClick={() => date && handleDateSelect(date)}
                          disabled={!date || date < new Date()}
                          className={`
                            aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                            ${!date 
                              ? 'invisible' 
                              : date < new Date()
                              ? 'text-gray-300 cursor-not-allowed'
                              : date.toISOString().split('T')[0] === checkIn || date.toISOString().split('T')[0] === checkOut
                              ? 'bg-antigua-purple text-white'
                              : 'text-gray-700 hover:bg-antigua-purple hover:text-white'
                            }
                          `}
                        >
                          {date?.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 min-w-0" ref={guestRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.guests')}
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowGuestSelector(!showGuestSelector)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-antigua-purple focus:outline-none focus:ring-2 focus:ring-antigua-purple focus:border-transparent transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {guests.adults + guests.children} {guests.adults + guests.children !== 1 ? t('search.guest_plural') : t('search.guest_single')}, {guests.rooms} {guests.rooms !== 1 ? t('search.room_plural') : t('search.room_single')}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showGuestSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {showGuestSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
                    {/* Adults */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">{t('search.adults')}</div>
                        <div className="text-sm text-gray-500">{t('search.adults_desc')}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateGuests('adults', 'subtract')}
                          disabled={guests.adults <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-antigua-purple disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{guests.adults}</span>
                        <button
                          onClick={() => updateGuests('adults', 'add')}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-antigua-purple"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">{t('search.children')}</div>
                        <div className="text-sm text-gray-500">{t('search.children_desc')}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateGuests('children', 'subtract')}
                          disabled={guests.children <= 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-antigua-purple disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{guests.children}</span>
                        <button
                          onClick={() => updateGuests('children', 'add')}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-antigua-purple"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium text-gray-900">{t('search.rooms')}</div>
                        <div className="text-sm text-gray-500">{t('search.rooms_desc')}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateGuests('rooms', 'subtract')}
                          disabled={guests.rooms <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-antigua-purple disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{guests.rooms}</span>
                        <button
                          onClick={() => updateGuests('rooms', 'add')}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-antigua-purple"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex-shrink-0">
              <Button
                onClick={handleSearch}
                size="lg"
                className="bg-antigua-purple hover:bg-antigua-purple-dark text-white px-8 py-3 h-[52px] shadow-lg"
              >
                <Search className="h-5 w-5 mr-2" />
                {t('search.search')}
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-2">{t('search.popular_searches')}</span>
              <button className="text-sm text-antigua-purple hover:text-antigua-purple-dark font-medium">
                {t('search.hotels_antigua')}
              </button>
              <span className="text-gray-300">•</span>
              <button className="text-sm text-antigua-purple hover:text-antigua-purple-dark font-medium">
                {t('search.volcano_tours')}
              </button>
              <span className="text-gray-300">•</span>
              <button className="text-sm text-antigua-purple hover:text-antigua-purple-dark font-medium">
                {t('search.family_packages')}
              </button>
              <span className="text-gray-300">•</span>
              <button className="text-sm text-antigua-purple hover:text-antigua-purple-dark font-medium">
                {t('search.airport_shuttle')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
