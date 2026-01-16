import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import JACChat from '@/components/chat/JACChat'
import { Calendar, Store, FileText, History, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    name: 'Directorio de Negocios',
    description: 'Encuentra panaderías, restaurantes, ferreterías y más servicios del barrio.',
    icon: Store,
    href: '/directorio',
    color: 'bg-blue-500',
  },
  {
    name: 'Eventos y Actividades',
    description: 'Mantente informado sobre misas, reuniones, eventos culturales y deportivos.',
    icon: Calendar,
    href: '/eventos',
    color: 'bg-verde-jac-500',
  },
  {
    name: 'Trámites JAC',
    description: 'Certificados de residencia, afiliación, quejas y más trámites de la JAC.',
    icon: FileText,
    href: '/tramites',
    color: 'bg-amarillo-sol-500',
  },
  {
    name: 'Historia del Barrio',
    description: 'Conoce la rica historia del estadio, el batallón, la plaza de toros y más.',
    icon: History,
    href: '/historia',
    color: 'bg-cafe-quindio-500',
  },
]

const stats = [
  { label: 'Años de historia', value: '50+' },
  { label: 'Familias', value: '2,000+' },
  { label: 'Negocios locales', value: '100+' },
  { label: 'Colegios', value: '4' },
]

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-verde-jac-600 via-verde-jac-500 to-verde-jac-700 text-white">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-amarillo-sol-400" />
                  <span className="text-verde-jac-100">Armenia, Quindío</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Barrio San José y El Bosque
                </h1>
                <p className="text-lg text-verde-jac-100 mb-8">
                  Tu comunidad en un solo lugar. Accede a información del barrio,
                  directorio de negocios, eventos, trámites de la JAC y mucho más.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/directorio"
                    className="inline-flex items-center space-x-2 bg-white text-verde-jac-600 px-6 py-3 rounded-lg font-semibold hover:bg-verde-jac-50 transition-colors"
                  >
                    <Store className="w-5 h-5" />
                    <span>Ver Directorio</span>
                  </Link>
                  <Link
                    href="/tramites"
                    className="inline-flex items-center space-x-2 bg-verde-jac-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-verde-jac-700 border border-verde-jac-400 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Trámites JAC</span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-verde-jac-400">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-3xl font-bold text-amarillo-sol-400">{stat.value}</p>
                      <p className="text-sm text-verde-jac-200">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Widget */}
              <div className="lg:pl-8">
                <JACChat />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Todo lo que necesitas saber del barrio
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Información actualizada y completa sobre servicios, eventos y trámites
                de la Junta de Acción Comunal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-verde-jac-200 transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Uno de los mejores barrios de Armenia
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    El Barrio San José y El Bosque es un sector emblemático de Armenia, Quindío,
                    con una rica historia que incluye el <strong>primer estadio de la ciudad</strong>,
                    donde el Deportes Quindío conquistó su primera estrella.
                  </p>
                  <p>
                    Cuenta con excelente infraestructura: 4 instituciones educativas,
                    Confenalco con gimnasio y formación técnica, plaza de mercado,
                    supermercado de gran superficie, hotel, y comercio diverso incluyendo
                    las dos mejores panaderías de la ciudad.
                  </p>
                  <p>
                    Donde antes funcionó un batallón militar, hoy hay un moderno conjunto
                    residencial. El bosque natural que da nombre al barrio es un pulmón verde
                    que alberga la histórica plaza de toros.
                  </p>
                </div>
                <div className="mt-8 flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 bg-verde-jac-100 rounded-full flex items-center justify-center border-2 border-white">
                      <Users className="w-5 h-5 text-verde-jac-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Junta de Acción Comunal</p>
                    <p className="text-sm text-gray-500">Trabajando por nuestra comunidad</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-verde-jac-50 to-verde-jac-100 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-verde-jac-800 mb-6">
                  Lo que nos hace especiales
                </h3>
                <ul className="space-y-4">
                  {[
                    'Primer estadio de Armenia - Historia deportiva',
                    'Dos de las mejores panaderías de la ciudad',
                    'Confenalco con gym y formación técnica',
                    'Restaurantes chino y de mar con tradición',
                    'Fábricas de calzado y marroquinería',
                    'Plaza de mercado de abastos',
                    'Bosque natural urbano',
                    'Excelente conectividad con el centro',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-verde-jac-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-verde-jac-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-verde-jac-500 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Necesitas ayuda de la JAC?
            </h2>
            <p className="text-verde-jac-100 mb-8 max-w-2xl mx-auto">
              Estamos aquí para servirte. Visítanos en nuestra oficina o contáctanos
              por teléfono o WhatsApp.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+573001234567"
                className="inline-flex items-center space-x-2 bg-white text-verde-jac-600 px-6 py-3 rounded-lg font-semibold hover:bg-verde-jac-50 transition-colors"
              >
                <span>Llamar ahora</span>
              </a>
              <a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
