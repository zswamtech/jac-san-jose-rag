'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Church,
  Trophy,
  Music,
  Megaphone,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react'

interface Evento {
  id: string
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  lugar: string
  categoria: 'misa' | 'reunion' | 'cultural' | 'deportivo' | 'comunitario'
  recurrente?: string
}

const categorias = [
  { id: 'todos', label: 'Todos', icon: Calendar, color: 'bg-gray-500' },
  { id: 'misa', label: 'Misas', icon: Church, color: 'bg-purple-500' },
  { id: 'reunion', label: 'Reuniones JAC', icon: Users, color: 'bg-verde-jac-500' },
  { id: 'cultural', label: 'Culturales', icon: Music, color: 'bg-pink-500' },
  { id: 'deportivo', label: 'Deportivos', icon: Trophy, color: 'bg-blue-500' },
  { id: 'comunitario', label: 'Comunitarios', icon: Megaphone, color: 'bg-orange-500' },
]

// Eventos de ejemplo - estos se pueden mover a una base de datos o CMS
const eventosData: Evento[] = [
  // Misas recurrentes
  {
    id: 'misa-dom-7',
    titulo: 'Santa Misa Dominical',
    descripcion: 'Eucaristía dominical en la Parroquia San José Obrero.',
    fecha: 'Todos los domingos',
    hora: '7:00 AM',
    lugar: 'Parroquia San José Obrero',
    categoria: 'misa',
    recurrente: 'Semanal'
  },
  {
    id: 'misa-dom-10',
    titulo: 'Santa Misa Dominical',
    descripcion: 'Eucaristía dominical para toda la familia.',
    fecha: 'Todos los domingos',
    hora: '10:00 AM',
    lugar: 'Parroquia San José Obrero',
    categoria: 'misa',
    recurrente: 'Semanal'
  },
  {
    id: 'misa-dom-6pm',
    titulo: 'Santa Misa Vespertina',
    descripcion: 'Misa dominical en horario de la tarde.',
    fecha: 'Todos los domingos',
    hora: '6:00 PM',
    lugar: 'Parroquia San José Obrero',
    categoria: 'misa',
    recurrente: 'Semanal'
  },
  {
    id: 'misa-sab',
    titulo: 'Misa Sabatina',
    descripcion: 'Misa de vigilia del domingo.',
    fecha: 'Todos los sábados',
    hora: '6:00 PM',
    lugar: 'Parroquia San José Obrero',
    categoria: 'misa',
    recurrente: 'Semanal'
  },
  // Reuniones JAC
  {
    id: 'reunion-jac-mensual',
    titulo: 'Asamblea General JAC',
    descripcion: 'Reunión mensual de la Junta de Acción Comunal. Se tratarán temas de interés comunitario, rendición de cuentas y nuevos proyectos.',
    fecha: 'Primer sábado de cada mes',
    hora: '3:00 PM',
    lugar: 'Salón Comunal - Barrio San José',
    categoria: 'reunion',
    recurrente: 'Mensual'
  },
  {
    id: 'reunion-junta-directiva',
    titulo: 'Reunión Junta Directiva',
    descripcion: 'Reunión de la junta directiva para planificación y seguimiento de proyectos.',
    fecha: 'Tercer miércoles de cada mes',
    hora: '6:00 PM',
    lugar: 'Oficina JAC',
    categoria: 'reunion',
    recurrente: 'Mensual'
  },
  // Eventos Culturales
  {
    id: 'fundanza-presentacion',
    titulo: 'Presentación Fundanza',
    descripcion: 'Muestra artística de los estudiantes del Bachillerato Artístico. Danza, música y teatro.',
    fecha: '2026-02-15',
    hora: '4:00 PM',
    lugar: 'Fundanza - Calle 19 con Carrera 27',
    categoria: 'cultural'
  },
  {
    id: 'clases-danza',
    titulo: 'Clases de Danza Folclórica',
    descripcion: 'Clases abiertas para niños y jóvenes del barrio. Inscripciones en Fundanza.',
    fecha: 'Todos los martes y jueves',
    hora: '4:00 PM - 6:00 PM',
    lugar: 'Fundanza',
    categoria: 'cultural',
    recurrente: 'Semanal'
  },
  // Eventos Deportivos
  {
    id: 'torneo-microfutbol',
    titulo: 'Torneo de Microfútbol Barrial',
    descripcion: 'Torneo inter-barrios organizado por la JAC. Inscripciones abiertas para equipos del sector.',
    fecha: '2026-02-01',
    hora: '2:00 PM',
    lugar: 'Parque de la Cultura Deportiva (Antiguo Estadio San José)',
    categoria: 'deportivo'
  },
  {
    id: 'aerobicos-parque',
    titulo: 'Aeróbicos en el Parque',
    descripcion: 'Clases de aeróbicos gratuitas para la comunidad. Trae tu mat y agua.',
    fecha: 'Todos los sábados',
    hora: '7:00 AM',
    lugar: 'Parque El Bosque',
    categoria: 'deportivo',
    recurrente: 'Semanal'
  },
  {
    id: 'caminata-ecologica',
    titulo: 'Caminata Ecológica',
    descripcion: 'Recorrido por los senderos del Bosque Municipal. Actividad familiar.',
    fecha: '2026-01-26',
    hora: '8:00 AM',
    lugar: 'Entrada Parque El Bosque',
    categoria: 'deportivo'
  },
  // Eventos Comunitarios
  {
    id: 'jornada-limpieza',
    titulo: 'Jornada de Limpieza Comunitaria',
    descripcion: 'Únete a la limpieza de nuestro barrio. La JAC provee los implementos.',
    fecha: '2026-01-25',
    hora: '7:00 AM',
    lugar: 'Punto de encuentro: Parque San José',
    categoria: 'comunitario'
  },
  {
    id: 'vacunacion-mascotas',
    titulo: 'Jornada de Vacunación de Mascotas',
    descripcion: 'Vacunación gratuita para perros y gatos del barrio. Cupos limitados.',
    fecha: '2026-02-08',
    hora: '9:00 AM - 1:00 PM',
    lugar: 'Parque San José',
    categoria: 'comunitario'
  },
  {
    id: 'mercado-campesino',
    titulo: 'Mercado Campesino',
    descripcion: 'Productos frescos directamente de los agricultores del Quindío.',
    fecha: 'Todos los domingos',
    hora: '6:00 AM - 12:00 PM',
    lugar: 'Plaza de Mercado - Barrio San José',
    categoria: 'comunitario',
    recurrente: 'Semanal'
  },
  // Confenalco
  {
    id: 'cursos-confenalco',
    titulo: 'Inscripciones Cursos Confenalco',
    descripcion: 'Abierta la inscripción para cursos de inglés, sistemas, y formación técnica.',
    fecha: '2026-01-20',
    hora: '8:00 AM - 5:00 PM',
    lugar: 'Confenalco - Carrera 23 con Calle 23',
    categoria: 'comunitario'
  },
]

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function EventosPage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos')
  const [mesActual, setMesActual] = useState(0) // 0 = Enero 2026

  const eventosFiltrados = eventosData.filter(evento =>
    categoriaSeleccionada === 'todos' || evento.categoria === categoriaSeleccionada
  )

  const eventosRecurrentes = eventosFiltrados.filter(e => e.recurrente)
  const eventosUnicos = eventosFiltrados.filter(e => !e.recurrente)

  const getCategoriaInfo = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId) || categorias[0]
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-verde-jac-600 via-verde-jac-500 to-verde-jac-700 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-6 h-6 text-verde-jac-200" />
              <span className="text-verde-jac-100">Barrio San José y El Bosque</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Eventos y Actividades
            </h1>
            <p className="text-lg text-verde-jac-100 max-w-2xl mb-6">
              Mantente informado sobre misas, reuniones de la JAC, eventos culturales,
              deportivos y actividades comunitarias de nuestro barrio.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-verde-jac-100 text-sm">Próximos eventos:</span>
                <span className="ml-2 font-bold">{eventosUnicos.length}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-verde-jac-100 text-sm">Actividades recurrentes:</span>
                <span className="ml-2 font-bold">{eventosRecurrentes.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros por categoría */}
        <section className="py-6 bg-white border-b sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaSeleccionada(cat.id)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    categoriaSeleccionada === cat.id
                      ? `${cat.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Eventos Recurrentes */}
        {eventosRecurrentes.length > 0 && (
          <section className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <CalendarDays className="w-6 h-6 text-verde-jac-500" />
                <span>Actividades Recurrentes</span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventosRecurrentes.map((evento) => {
                  const catInfo = getCategoriaInfo(evento.categoria)
                  return (
                    <Card key={evento.id} hover className="relative overflow-hidden">
                      {/* Category badge */}
                      <div className={`absolute top-0 right-0 ${catInfo.color} text-white text-xs px-3 py-1 rounded-bl-lg`}>
                        {catInfo.label}
                      </div>

                      <div className="pt-2">
                        <h3 className="font-semibold text-gray-900 mb-2 pr-20">{evento.titulo}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{evento.descripcion}</p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-verde-jac-500" />
                            <span className="font-medium">{evento.fecha}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{evento.hora}</span>
                          </div>
                          <div className="flex items-start space-x-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="line-clamp-1">{evento.lugar}</span>
                          </div>
                        </div>

                        {evento.recurrente && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="inline-flex items-center px-2 py-1 bg-verde-jac-100 text-verde-jac-700 text-xs rounded-full">
                              Recurrente: {evento.recurrente}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Próximos Eventos */}
        {eventosUnicos.length > 0 && (
          <section className="py-8 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                <span>Próximos Eventos</span>
              </h2>

              <div className="space-y-4">
                {eventosUnicos.map((evento) => {
                  const catInfo = getCategoriaInfo(evento.categoria)
                  return (
                    <Card key={evento.id} hover className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Date box */}
                      <div className={`${catInfo.color} text-white rounded-lg p-4 text-center md:w-24 flex-shrink-0`}>
                        <div className="text-2xl font-bold">
                          {evento.fecha.includes('-') ? evento.fecha.split('-')[2] : '--'}
                        </div>
                        <div className="text-xs uppercase">
                          {evento.fecha.includes('-')
                            ? meses[parseInt(evento.fecha.split('-')[1]) - 1]?.slice(0, 3)
                            : evento.fecha.slice(0, 10)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`inline-block px-2 py-0.5 ${catInfo.color} text-white text-xs rounded mb-2`}>
                              {catInfo.label}
                            </span>
                            <h3 className="font-semibold text-gray-900">{evento.titulo}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 mb-3">{evento.descripcion}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{evento.hora}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{evento.lugar}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Empty state */}
        {eventosFiltrados.length === 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay eventos en esta categoría
              </h3>
              <p className="text-gray-500 mb-4">
                Intenta con otra categoría o vuelve pronto para ver nuevos eventos.
              </p>
              <button
                onClick={() => setCategoriaSeleccionada('todos')}
                className="text-verde-jac-600 hover:text-verde-jac-700 font-medium"
              >
                Ver todos los eventos
              </button>
            </div>
          </section>
        )}

        {/* Horarios de Misas - Sección especial */}
        <section className="py-12 bg-purple-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Church className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Horarios de Misas
              </h2>
              <p className="text-gray-600">Parroquia San José Obrero</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4">Domingos</h3>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-purple-600">7:00 AM</p>
                  <p className="text-2xl font-bold text-purple-600">10:00 AM</p>
                  <p className="text-2xl font-bold text-purple-600">6:00 PM</p>
                </div>
              </Card>

              <Card className="text-center">
                <h3 className="font-semibold text-gray-900 mb-4">Sábados (Vigilia)</h3>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-purple-600">6:00 PM</p>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Consultar horarios de misas entre semana en la parroquia
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA - Proponer evento */}
        <section className="py-12 bg-verde-jac-500 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿Tienes un evento para la comunidad?
            </h2>
            <p className="text-verde-jac-100 mb-6 max-w-2xl mx-auto">
              Si quieres organizar una actividad en el barrio o proponer un evento comunitario,
              contáctanos y te ayudamos a difundirlo.
            </p>
            <a
              href="https://wa.me/573001234567?text=Hola,%20quiero%20proponer%20un%20evento%20para%20el%20barrio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white text-verde-jac-600 px-6 py-3 rounded-lg font-semibold hover:bg-verde-jac-50 transition-colors"
            >
              <span>Proponer evento</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
