'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Tipos para las traducciones
interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

interface LanguageContextType {
  currentLanguage: string
  setLanguage: (language: string) => void
  t: (key: string) => string
  languages: Array<{
    code: string
    name: string
    flag: string
  }>
}

// Traducciones básicas
const translations: Translations = {
  es: {
    // Header
    'header.phone': '+502 1234-5678',
    'header.email': 'info@antiguahotelstours.com',
    'header.location': 'Antigua Guatemala, Sacatepéquez',
    'header.home': 'Inicio',
    'header.accommodations': 'Alojamientos',
    'header.activities': 'Actividades',
    'header.packages': 'Paquetes',
    'header.shuttle': 'Shuttle Service',
    'header.contact': 'Contacto',
    'header.book_now': 'Reservar Ahora',
    
    // Homepage
    'home.hero.title': 'Descubre la Magia de Guatemala',
    'home.hero.subtitle': 'Experiencias Auténticas en Antigua',
    'home.hero.description': 'Sumérgete en la rica cultura guatemalteca con nuestros hoteles boutique, tours únicos y aventuras inolvidables en el corazón de Antigua Guatemala.',
    'home.hero.explore_services': 'Explorar Servicios',
    'home.hero.view_packages': 'Ver Paquetes',
    
    'home.featured.title': 'Actividades Destacadas',
    'home.featured.description': 'Descubre nuestras experiencias más populares, cuidadosamente seleccionadas para ofrecerte aventuras únicas en Guatemala.',
    'home.featured.no_activities': 'No hay actividades destacadas disponibles',
    'home.featured.configure': 'Configura actividades destacadas desde el admin dashboard',
    'home.featured.view_all': 'Ver Todas las Actividades',
    
    'home.why_choose.title': '¿Por Qué Elegirnos?',
    'home.why_choose.description': 'Somos más que un servicio de turismo, somos tus guías locales para descubrir la verdadera esencia de Guatemala.',
    'home.why_choose.experience': 'Experiencia Garantizada',
    'home.why_choose.experience_desc': 'Más de 10 años creando experiencias únicas en Guatemala',
    'home.why_choose.quality': 'Calidad Premium',
    'home.why_choose.quality_desc': 'Hoteles y servicios cuidadosamente seleccionados',
    'home.why_choose.attention': 'Atención Personalizada',
    'home.why_choose.attention_desc': 'Guías locales expertos y servicio 24/7',
    'home.why_choose.security': 'Reservas Seguras',
    'home.why_choose.security_desc': 'Pagos seguros y cancelación flexible',
    
    'home.testimonials.title': 'Lo Que Dicen Nuestros Huéspedes',
    'home.testimonials.description': 'Miles de viajeros han confiado en nosotros para sus aventuras en Guatemala',
    
    'home.cta.title': '¿Listo para tu Aventura?',
    'home.cta.description': 'Reserva ahora y obtén el 10% de descuento en tu primera experiencia con nosotros',
    'home.cta.book_now': 'Reservar Ahora',
    'home.cta.contact': 'Contáctanos',
    'home.cta.trust.secure': 'Reservas 100% Seguras',
    'home.cta.trust.flexible': 'Cancelación Flexible',
    'home.cta.trust.reviews': '+1000 Reseñas 5★',
    
    // Service Card
    'service.view_details': 'Ver Detalles',
    'service.from': 'Desde',
    'service.people': 'personas',
    'service.hours': 'horas',
    
    // Search Bar
    'search.service_type': 'Tipo de Servicio',
    'search.dates': 'Fechas',
    'search.guests': 'Huéspedes',
    'search.search': 'Buscar',
    'search.select_dates': 'Seleccionar fechas',
    'search.select_checkin': 'Selecciona fecha de entrada',
    'search.select_checkout': 'Selecciona fecha de salida',
    'search.adults': 'Adultos',
    'search.children': 'Niños',
    'search.rooms': 'Habitaciones',
    'search.adults_desc': '13 años o más',
    'search.children_desc': '2-12 años',
    'search.rooms_desc': 'Para alojamientos',
    'search.guest_single': 'huésped',
    'search.guest_plural': 'huéspedes',
    'search.room_single': 'habitación',
    'search.room_plural': 'habitaciones',
    'search.popular_searches': 'Búsquedas populares:',
    'search.hotels_antigua': 'Hoteles en Antigua',
    'search.volcano_tours': 'Tours al Volcán',
    'search.family_packages': 'Paquetes Familiares',
    'search.airport_shuttle': 'Shuttle Aeropuerto',
    'search.accommodations': 'Alojamientos',
    'search.activities': 'Actividades',
    'search.shuttle': 'Shuttle',
    'search.packages': 'Paquetes',
    
    // Footer
    'footer.services': 'Servicios',
    'footer.company': 'Empresa',
    'footer.contact': 'Contacto',
    'footer.about_us': 'Sobre Nosotros',
    'footer.contact_us': 'Contacto',
    'footer.faq': 'FAQ',
    'footer.terms': 'Términos y Condiciones',
    'footer.unique_experiences': 'Experiencias únicas en Guatemala',
    'footer.description': 'Descubre la belleza de Guatemala con nuestras experiencias auténticas de alojamiento, actividades y aventuras inolvidables.',
    'footer.features.online_booking': 'Reservas Online 24/7',
    'footer.features.personalized': 'Atención Personalizada',
    'footer.features.secure': 'Reservas Seguras',
    'footer.features.unique': 'Experiencias Únicas',
    'footer.phone_hours': 'Lunes - Viernes 8:00 - 18:00',
    'footer.email_response': 'Respuesta en 24 horas',
    'footer.location_detail': 'Sacatepéquez, Guatemala',
    'footer.follow_us': 'Síguenos',
    'footer.all_rights': 'Todos los derechos reservados.',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms_use': 'Términos de Uso',
    'footer.made_with_love': 'Hecho con ❤️ en Guatemala',
    
    // Activities
    'activity.volcano_tour': 'Tour Volcán Pacaya',
    'activity.volcano_desc': 'Aventura única al volcán activo con guía experto y equipamiento incluido.',
    'activity.city_tour': 'City Tour Antigua',
    'activity.city_desc': 'Recorrido histórico por la ciudad colonial más hermosa de Guatemala.',
    'activity.cooking_class': 'Mercado y Cocina Local',
    'activity.cooking_desc': 'Experiencia gastronómica auténtica con clase de cocina tradicional.',
    'activity.pacaya_location': 'Volcán Pacaya',
    'activity.antigua_location': 'Antigua Guatemala',
    'activity.hours': 'horas',
    'activity.people': 'personas',
    'activity.adventure_badge': 'Aventura',
    'activity.cultural_badge': 'Cultural',
    'activity.culinary_badge': 'Gastronómico',
  },
  
  en: {
    // Header
    'header.phone': '+502 1234-5678',
    'header.email': 'info@antiguahotelstours.com',
    'header.location': 'Antigua Guatemala, Sacatepéquez',
    'header.home': 'Home',
    'header.accommodations': 'Accommodations',
    'header.activities': 'Activities',
    'header.packages': 'Packages',
    'header.shuttle': 'Shuttle Service',
    'header.contact': 'Contact',
    'header.book_now': 'Book Now',
    
    // Homepage
    'home.hero.title': 'Discover the Magic of Guatemala',
    'home.hero.subtitle': 'Authentic Experiences in Antigua',
    'home.hero.description': 'Immerse yourself in rich Guatemalan culture with our boutique hotels, unique tours and unforgettable adventures in the heart of Antigua Guatemala.',
    'home.hero.explore_services': 'Explore Services',
    'home.hero.view_packages': 'View Packages',
    
    'home.featured.title': 'Featured Activities',
    'home.featured.description': 'Discover our most popular experiences, carefully selected to offer you unique adventures in Guatemala.',
    'home.featured.no_activities': 'No featured activities available',
    'home.featured.configure': 'Configure featured activities from admin dashboard',
    'home.featured.view_all': 'View All Activities',
    
    'home.why_choose.title': 'Why Choose Us?',
    'home.why_choose.description': 'We are more than a tourism service, we are your local guides to discover the true essence of Guatemala.',
    'home.why_choose.experience': 'Guaranteed Experience',
    'home.why_choose.experience_desc': 'Over 10 years creating unique experiences in Guatemala',
    'home.why_choose.quality': 'Premium Quality',
    'home.why_choose.quality_desc': 'Carefully selected hotels and services',
    'home.why_choose.attention': 'Personalized Attention',
    'home.why_choose.attention_desc': 'Expert local guides and 24/7 service',
    'home.why_choose.security': 'Secure Reservations',
    'home.why_choose.security_desc': 'Secure payments and flexible cancellation',
    
    'home.testimonials.title': 'What Our Guests Say',
    'home.testimonials.description': 'Thousands of travelers have trusted us for their Guatemala adventures',
    
    'home.cta.title': 'Ready for Your Adventure?',
    'home.cta.description': 'Book now and get 10% discount on your first experience with us',
    'home.cta.book_now': 'Book Now',
    'home.cta.contact': 'Contact Us',
    'home.cta.trust.secure': '100% Secure Bookings',
    'home.cta.trust.flexible': 'Flexible Cancellation',
    'home.cta.trust.reviews': '+1000 Reviews 5★',
    
    // Service Card
    'service.view_details': 'View Details',
    'service.from': 'From',
    'service.people': 'people',
    'service.hours': 'hours',
    
    // Search Bar
    'search.service_type': 'Service Type',
    'search.dates': 'Dates',
    'search.guests': 'Guests',
    'search.search': 'Search',
    'search.select_dates': 'Select dates',
    'search.select_checkin': 'Select check-in date',
    'search.select_checkout': 'Select check-out date',
    'search.adults': 'Adults',
    'search.children': 'Children',
    'search.rooms': 'Rooms',
    'search.adults_desc': '13 years or older',
    'search.children_desc': '2-12 years',
    'search.rooms_desc': 'For accommodations',
    'search.guest_single': 'guest',
    'search.guest_plural': 'guests',
    'search.room_single': 'room',
    'search.room_plural': 'rooms',
    'search.popular_searches': 'Popular searches:',
    'search.hotels_antigua': 'Hotels in Antigua',
    'search.volcano_tours': 'Volcano Tours',
    'search.family_packages': 'Family Packages',
    'search.airport_shuttle': 'Airport Shuttle',
    'search.accommodations': 'Accommodations',
    'search.activities': 'Activities',
    'search.shuttle': 'Shuttle',
    'search.packages': 'Packages',
    
    // Footer
    'footer.services': 'Services',
    'footer.company': 'Company',
    'footer.contact': 'Contact',
    'footer.about_us': 'About Us',
    'footer.contact_us': 'Contact Us',
    'footer.faq': 'FAQ',
    'footer.terms': 'Terms and Conditions',
    'footer.unique_experiences': 'Unique experiences in Guatemala',
    'footer.description': 'Discover the beauty of Guatemala with our authentic accommodation, activity and adventure experiences.',
    'footer.features.online_booking': '24/7 Online Booking',
    'footer.features.personalized': 'Personalized Attention',
    'footer.features.secure': 'Secure Bookings',
    'footer.features.unique': 'Unique Experiences',
    'footer.phone_hours': 'Monday - Friday 8:00 - 18:00',
    'footer.email_response': 'Response within 24 hours',
    'footer.location_detail': 'Sacatepéquez, Guatemala',
    'footer.follow_us': 'Follow Us',
    'footer.all_rights': 'All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms_use': 'Terms of Use',
    'footer.made_with_love': 'Made with ❤️ in Guatemala',
    
    // Activities
    'activity.volcano_tour': 'Pacaya Volcano Tour',
    'activity.volcano_desc': 'Unique adventure to the active volcano with expert guide and equipment included.',
    'activity.city_tour': 'Antigua City Tour',
    'activity.city_desc': 'Historical tour through Guatemala\'s most beautiful colonial city.',
    'activity.cooking_class': 'Local Market & Cooking',
    'activity.cooking_desc': 'Authentic gastronomic experience with traditional cooking class.',
    'activity.pacaya_location': 'Pacaya Volcano',
    'activity.antigua_location': 'Antigua Guatemala',
    'activity.hours': 'hours',
    'activity.people': 'people',
    'activity.adventure_badge': 'Adventure',
    'activity.cultural_badge': 'Cultural',
    'activity.culinary_badge': 'Culinary',
  },
  
  fr: {
    // Header
    'header.phone': '+502 1234-5678',
    'header.email': 'info@antiguahotelstours.com',
    'header.location': 'Antigua Guatemala, Sacatepéquez',
    'header.home': 'Accueil',
    'header.accommodations': 'Hébergements',
    'header.activities': 'Activités',
    'header.packages': 'Forfaits',
    'header.shuttle': 'Service Navette',
    'header.contact': 'Contact',
    'header.book_now': 'Réserver Maintenant',
    
    // Homepage
    'home.hero.title': 'Découvrez la Magie du Guatemala',
    'home.hero.subtitle': 'Expériences Authentiques à Antigua',
    'home.hero.description': 'Plongez dans la riche culture guatémaltèque avec nos hôtels boutique, tours uniques et aventures inoubliables au cœur d\'Antigua Guatemala.',
    'home.hero.explore_services': 'Explorer les Services',
    'home.hero.view_packages': 'Voir les Forfaits',
    
    'home.featured.title': 'Activités en Vedette',
    'home.featured.description': 'Découvrez nos expériences les plus populaires, soigneusement sélectionnées pour vous offrir des aventures uniques au Guatemala.',
    'home.featured.no_activities': 'Aucune activité en vedette disponible',
    'home.featured.configure': 'Configurez les activités en vedette depuis le tableau de bord admin',
    'home.featured.view_all': 'Voir Toutes les Activités',
    
    'home.why_choose.title': 'Pourquoi Nous Choisir?',
    'home.why_choose.description': 'Nous sommes plus qu\'un service touristique, nous sommes vos guides locaux pour découvrir la véritable essence du Guatemala.',
    'home.why_choose.experience': 'Expérience Garantie',
    'home.why_choose.experience_desc': 'Plus de 10 ans à créer des expériences uniques au Guatemala',
    'home.why_choose.quality': 'Qualité Premium',
    'home.why_choose.quality_desc': 'Hôtels et services soigneusement sélectionnés',
    'home.why_choose.attention': 'Attention Personnalisée',
    'home.why_choose.attention_desc': 'Guides locaux experts et service 24/7',
    'home.why_choose.security': 'Réservations Sécurisées',
    'home.why_choose.security_desc': 'Paiements sécurisés et annulation flexible',
    
    'home.testimonials.title': 'Ce Que Disent Nos Clients',
    'home.testimonials.description': 'Des milliers de voyageurs nous ont fait confiance pour leurs aventures au Guatemala',
    
    'home.cta.title': 'Prêt pour Votre Aventure?',
    'home.cta.description': 'Réservez maintenant et obtenez 10% de réduction sur votre première expérience avec nous',
    'home.cta.book_now': 'Réserver Maintenant',
    'home.cta.contact': 'Nous Contacter',
    'home.cta.trust.secure': 'Réservations 100% Sécurisées',
    'home.cta.trust.flexible': 'Annulation Flexible',
    'home.cta.trust.reviews': '+1000 Avis 5★',
    
    // Service Card
    'service.view_details': 'Voir Détails',
    'service.from': 'À partir de',
    'service.people': 'personnes',
    'service.hours': 'heures',
    
    // Search Bar
    'search.service_type': 'Type de Service',
    'search.dates': 'Dates',
    'search.guests': 'Invités',
    'search.search': 'Rechercher',
    'search.select_dates': 'Sélectionner les dates',
    'search.select_checkin': 'Sélectionner la date d\'arrivée',
    'search.select_checkout': 'Sélectionner la date de départ',
    'search.adults': 'Adultes',
    'search.children': 'Enfants',
    'search.rooms': 'Chambres',
    'search.adults_desc': '13 ans ou plus',
    'search.children_desc': '2-12 ans',
    'search.rooms_desc': 'Pour les hébergements',
    'search.guest_single': 'invité',
    'search.guest_plural': 'invités',
    'search.room_single': 'chambre',
    'search.room_plural': 'chambres',
    'search.popular_searches': 'Recherches populaires :',
    'search.hotels_antigua': 'Hôtels à Antigua',
    'search.volcano_tours': 'Tours du Volcan',
    'search.family_packages': 'Forfaits Familiaux',
    'search.airport_shuttle': 'Navette Aéroport',
    'search.accommodations': 'Hébergements',
    'search.activities': 'Activités',
    'search.shuttle': 'Navette',
    'search.packages': 'Forfaits',
    
    // Footer
    'footer.services': 'Services',
    'footer.company': 'Entreprise',
    'footer.contact': 'Contact',
    'footer.about_us': 'À Propos',
    'footer.contact_us': 'Nous Contacter',
    'footer.faq': 'FAQ',
    'footer.terms': 'Termes et Conditions',
    'footer.unique_experiences': 'Expériences uniques au Guatemala',
    'footer.description': 'Découvrez la beauté du Guatemala avec nos expériences authentiques d\'hébergement, d\'activités et d\'aventures inoubliables.',
    'footer.features.online_booking': 'Réservations en ligne 24/7',
    'footer.features.personalized': 'Attention Personnalisée',
    'footer.features.secure': 'Réservations Sécurisées',
    'footer.features.unique': 'Expériences Uniques',
    'footer.phone_hours': 'Lundi - Vendredi 8:00 - 18:00',
    'footer.email_response': 'Réponse sous 24 heures',
    'footer.location_detail': 'Sacatepéquez, Guatemala',
    'footer.follow_us': 'Suivez-nous',
    'footer.all_rights': 'Tous droits réservés.',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms_use': 'Conditions d\'Utilisation',
    'footer.made_with_love': 'Fait avec ❤️ au Guatemala',
    
    // Activities
    'activity.volcano_tour': 'Tour du Volcan Pacaya',
    'activity.volcano_desc': 'Aventure unique au volcan actif avec guide expert et équipement inclus.',
    'activity.city_tour': 'Visite de la Ville d\'Antigua',
    'activity.city_desc': 'Visite historique de la plus belle ville coloniale du Guatemala.',
    'activity.cooking_class': 'Marché Local et Cuisine',
    'activity.cooking_desc': 'Expérience gastronomique authentique avec cours de cuisine traditionnelle.',
    'activity.pacaya_location': 'Volcan Pacaya',
    'activity.antigua_location': 'Antigua Guatemala',
    'activity.hours': 'heures',
    'activity.people': 'personnes',
    'activity.adventure_badge': 'Aventure',
    'activity.cultural_badge': 'Culturel',
    'activity.culinary_badge': 'Culinaire',
  },
  
  de: {
    // Header
    'header.phone': '+502 1234-5678',
    'header.email': 'info@antiguahotelstours.com',
    'header.location': 'Antigua Guatemala, Sacatepéquez',
    'header.home': 'Startseite',
    'header.accommodations': 'Unterkünfte',
    'header.activities': 'Aktivitäten',
    'header.packages': 'Pakete',
    'header.shuttle': 'Shuttle Service',
    'header.contact': 'Kontakt',
    'header.book_now': 'Jetzt Buchen',
    
    // Homepage
    'home.hero.title': 'Entdecken Sie die Magie Guatemalas',
    'home.hero.subtitle': 'Authentische Erlebnisse in Antigua',
    'home.hero.description': 'Tauchen Sie ein in die reiche guatemaltekische Kultur mit unseren Boutique-Hotels, einzigartigen Touren und unvergesslichen Abenteuern im Herzen von Antigua Guatemala.',
    'home.hero.explore_services': 'Services Erkunden',
    'home.hero.view_packages': 'Pakete Ansehen',
    
    'home.featured.title': 'Empfohlene Aktivitäten',
    'home.featured.description': 'Entdecken Sie unsere beliebtesten Erlebnisse, sorgfältig ausgewählt, um Ihnen einzigartige Abenteuer in Guatemala zu bieten.',
    'home.featured.no_activities': 'Keine empfohlenen Aktivitäten verfügbar',
    'home.featured.configure': 'Konfigurieren Sie empfohlene Aktivitäten im Admin-Dashboard',
    'home.featured.view_all': 'Alle Aktivitäten Ansehen',
    
    'home.why_choose.title': 'Warum Uns Wählen?',
    'home.why_choose.description': 'Wir sind mehr als ein Tourismusservice, wir sind Ihre lokalen Führer, um die wahre Essenz Guatemalas zu entdecken.',
    'home.why_choose.experience': 'Garantierte Erfahrung',
    'home.why_choose.experience_desc': 'Über 10 Jahre einzigartige Erlebnisse in Guatemala schaffen',
    'home.why_choose.quality': 'Premium Qualität',
    'home.why_choose.quality_desc': 'Sorgfältig ausgewählte Hotels und Services',
    'home.why_choose.attention': 'Persönliche Betreuung',
    'home.why_choose.attention_desc': 'Experte lokale Führer und 24/7 Service',
    'home.why_choose.security': 'Sichere Reservierungen',
    'home.why_choose.security_desc': 'Sichere Zahlungen und flexible Stornierung',
    
    'home.testimonials.title': 'Was Unsere Gäste Sagen',
    'home.testimonials.description': 'Tausende von Reisenden haben uns für ihre Guatemala-Abenteuer vertraut',
    
    'home.cta.title': 'Bereit für Ihr Abenteuer?',
    'home.cta.description': 'Buchen Sie jetzt und erhalten Sie 10% Rabatt auf Ihr erstes Erlebnis mit uns',
    'home.cta.book_now': 'Jetzt Buchen',
    'home.cta.contact': 'Kontaktieren Sie Uns',
    'home.cta.trust.secure': '100% Sichere Buchungen',
    'home.cta.trust.flexible': 'Flexible Stornierung',
    'home.cta.trust.reviews': '+1000 Bewertungen 5★',
    
    // Service Card
    'service.view_details': 'Details Ansehen',
    'service.from': 'Ab',
    'service.people': 'Personen',
    'service.hours': 'Stunden',
    
    // Search Bar
    'search.service_type': 'Service-Typ',
    'search.dates': 'Daten',
    'search.guests': 'Gäste',
    'search.search': 'Suchen',
    'search.select_dates': 'Daten auswählen',
    'search.select_checkin': 'Anreisedatum auswählen',
    'search.select_checkout': 'Abreisedatum auswählen',
    'search.adults': 'Erwachsene',
    'search.children': 'Kinder',
    'search.rooms': 'Zimmer',
    'search.adults_desc': '13 Jahre oder älter',
    'search.children_desc': '2-12 Jahre',
    'search.rooms_desc': 'Für Unterkünfte',
    'search.guest_single': 'Gast',
    'search.guest_plural': 'Gäste',
    'search.room_single': 'Zimmer',
    'search.room_plural': 'Zimmer',
    'search.popular_searches': 'Beliebte Suchen:',
    'search.hotels_antigua': 'Hotels in Antigua',
    'search.volcano_tours': 'Vulkan-Touren',
    'search.family_packages': 'Familienpakete',
    'search.airport_shuttle': 'Flughafen-Shuttle',
    'search.accommodations': 'Unterkünfte',
    'search.activities': 'Aktivitäten',
    'search.shuttle': 'Shuttle',
    'search.packages': 'Pakete',
    
    // Footer
    'footer.services': 'Dienstleistungen',
    'footer.company': 'Unternehmen',
    'footer.contact': 'Kontakt',
    'footer.about_us': 'Über Uns',
    'footer.contact_us': 'Kontaktieren Sie Uns',
    'footer.faq': 'FAQ',
    'footer.terms': 'Geschäftsbedingungen',
    'footer.unique_experiences': 'Einzigartige Erlebnisse in Guatemala',
    'footer.description': 'Entdecken Sie die Schönheit Guatemalas mit unseren authentischen Unterkunfts-, Aktivitäts- und Abenteuererlebnissen.',
    'footer.features.online_booking': '24/7 Online-Buchung',
    'footer.features.personalized': 'Personalisierte Aufmerksamkeit',
    'footer.features.secure': 'Sichere Buchungen',
    'footer.features.unique': 'Einzigartige Erlebnisse',
    'footer.phone_hours': 'Montag - Freitag 8:00 - 18:00',
    'footer.email_response': 'Antwort innerhalb von 24 Stunden',
    'footer.location_detail': 'Sacatepéquez, Guatemala',
    'footer.follow_us': 'Folgen Sie Uns',
    'footer.all_rights': 'Alle Rechte vorbehalten.',
    'footer.privacy': 'Datenschutzrichtlinie',
    'footer.terms_use': 'Nutzungsbedingungen',
    'footer.made_with_love': 'Mit ❤️ in Guatemala gemacht',
    
    // Activities
    'activity.volcano_tour': 'Pacaya Vulkan Tour',
    'activity.volcano_desc': 'Einzigartiges Abenteuer zum aktiven Vulkan mit Expertenführer und Ausrüstung.',
    'activity.city_tour': 'Antigua Stadtführung',
    'activity.city_desc': 'Historische Tour durch Guatemalas schönste Kolonialstadt.',
    'activity.cooking_class': 'Lokaler Markt & Kochen',
    'activity.cooking_desc': 'Authentisches kulinarisches Erlebnis mit traditionellem Kochkurs.',
    'activity.pacaya_location': 'Pacaya Vulkan',
    'activity.antigua_location': 'Antigua Guatemala',
    'activity.hours': 'Stunden',
    'activity.people': 'Personen',
    'activity.adventure_badge': 'Abenteuer',
    'activity.cultural_badge': 'Kulturell',
    'activity.culinary_badge': 'Kulinarisch',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('es')

  // Cargar idioma del localStorage al iniciar (solo en cliente)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language')
      if (savedLanguage && translations[savedLanguage]) {
        setCurrentLanguage(savedLanguage)
      }
    }
  }, [])

  // Guardar idioma en localStorage cuando cambie
  const setLanguage = (language: string) => {
    setCurrentLanguage(language)
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language)
    }
  }

  // Función de traducción
  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || key
  }

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ]

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      languages
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
