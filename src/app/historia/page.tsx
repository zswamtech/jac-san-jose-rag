'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import {
  History,
  MapPin,
  Calendar,
  Trophy,
  Building2,
  TreePine,
  Church,
  GraduationCap,
  Music,
  Utensils,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Timeline data
const timelineEvents = [
  { year: '1930s', title: 'Calle 21 - Eje Hípico', description: 'La calle 21 funcionaba como circuito para actividades ecuestres' },
  { year: '1937', title: 'Nace el Bosque Municipal', description: 'Se establece el parque como pulmón verde de la ciudad' },
  { year: '1948', title: 'Plaza de Toros El Bosque', description: 'Construcción de la plaza de toros dentro del bosque' },
  { year: '1951', title: 'Estadio San José', description: 'Inauguración el 19 de marzo del primer estadio de Armenia', highlight: true },
  { year: '1956', title: 'Primera Estrella', description: 'Deportes Quindío conquista su único campeonato', highlight: true },
  { year: '1958', title: 'Batallón Cisneros', description: 'El ejército establece su sede en el barrio' },
  { year: '1959', title: 'Monumento a San José', description: 'Se erige el monumento en el parque principal' },
  { year: '1988', title: 'Fundanza y Estadio Centenario', description: 'Nace Fundanza y se inaugura el nuevo estadio' },
  { year: '1999', title: 'Terremoto', description: 'El sismo del 25 de enero destruye gran parte del barrio', highlight: true, disaster: true },
  { year: '2001', title: 'Traslado del Batallón', description: 'El Batallón Cisneros se reubica en Montenegro' },
  { year: '2009', title: 'Parque de la Cultura Deportiva', description: 'Renace el antiguo estadio como espacio comunitario' },
]

// Historical sections data
const historicalSections = [
  {
    id: 'estadio',
    icon: Trophy,
    title: 'Estadio San José: Cuna del Fútbol Quindiano',
    period: '1951 - 1999',
    color: 'bg-green-500',
    content: {
      intro: 'El Estadio San José fue el verdadero corazón del fútbol regional, mucho antes de la existencia del Centenario. Este recinto histórico presenció el momento más glorioso del deporte quindiano.',
      facts: [
        { label: 'Inauguración', value: '19 de marzo de 1951' },
        { label: 'Campeonato histórico', value: '1956 - Primera estrella del Deportes Quindío' },
        { label: 'Capacidad original', value: '~12,000 espectadores' },
        { label: 'Destruido', value: 'Terremoto del 25 de enero de 1999' },
      ],
      transformation: 'Tras el sismo, el estadio fue demolido y renació en 2009 como el "Parque de la Cultura Deportiva", un espacio comunitario con capacidad reducida de 2,000 personas que preserva la memoria de aquellos llenos históricos.',
      note: 'Importante: El Estadio Centenario (1988) es el escenario actual, construido para reemplazar al San José como sede profesional. No confundir con el estadio histórico del barrio.'
    }
  },
  {
    id: 'batallon',
    icon: Building2,
    title: 'Batallón Cisneros: De la Seguridad a la Comunidad',
    period: '1958 - 1999',
    color: 'bg-gray-600',
    content: {
      intro: 'El Batallón de Ingenieros No. 8 "Francisco Javier Cisneros" fue una presencia institucional importante durante cuatro décadas, contribuyendo a obras civiles y seguridad en la región.',
      facts: [
        { label: 'Establecimiento', value: 'Enero de 1958' },
        { label: 'Función', value: 'Ingeniería militar y obras civiles' },
        { label: 'Destruido', value: 'Terremoto de 1999 (destrucción total)' },
        { label: 'Traslado', value: 'Montenegro, Quindío (2001)' },
      ],
      transformation: 'El extenso terreno militar experimentó una fragmentación estratégica que hoy alberga tres pilares del barrio:',
      subdivisions: [
        'Colegio Rufino José Cuervo Centro - Educación pública',
        'Conjunto Residencial Cisneros - Vivienda',
        'Plaza Minorista - Comercio y abastecimiento'
      ],
      note: 'Esta transición representa uno de los cambios urbanísticos más profundos de la zona, convirtiendo un enclave militar en un núcleo de servicios comunitarios.'
    }
  },
  {
    id: 'plaza-toros',
    icon: MapPin,
    title: 'Plaza de Toros El Bosque',
    period: '1948 - 1999',
    color: 'bg-red-600',
    content: {
      intro: 'Construida dentro del bosque que da nombre al barrio, la Plaza de Toros El Bosque fue escenario de la tradición taurina quindiana durante medio siglo.',
      facts: [
        { label: 'Construcción', value: 'Finales de la década de 1940' },
        { label: 'Ubicación', value: 'Dentro del Parque El Bosque' },
        { label: 'Última actividad', value: 'Aproximadamente una década antes de 2024' },
        { label: 'Estado actual', value: 'Abandonada / En ruinas' },
      ],
      transformation: 'Con la prohibición de las corridas de toros en Colombia, la plaza dejó de funcionar. Hoy existen proyectos innovadores para transformarla en un "megavivero" o eje ambiental, integrándola al concepto de "biodiverciudad" y conectándola con el parque circundante.',
      note: 'La estructura permanece como un recordatorio de otras épocas y tradiciones, con potencial de convertirse en un pulmón ecológico.'
    }
  },
  {
    id: 'bosque',
    icon: TreePine,
    title: 'Parque El Bosque: Pulmón Verde de Armenia',
    period: '1937 - Presente',
    color: 'bg-emerald-600',
    content: {
      intro: 'El Bosque Municipal es el principal punto de convergencia familiar de la ciudad desde mediados del siglo XX. Más que una simple área verde, es el corazón social del barrio.',
      facts: [
        { label: 'Establecimiento', value: '1937' },
        { label: 'Denominación', value: 'Bosque Municipal' },
        { label: 'Función histórica', value: '"Entrada verde" y punto de encuentro familiar' },
        { label: 'Estado actual', value: 'Activo, con necesidades de mantenimiento' },
      ],
      transformation: 'Aunque no posee un estatus de reserva nacional estricta, funciona como un área de protección ambiental urbana vital. Alberga aves y especies menores típicas de la región cafetera.',
      note: 'Su conservación ha estado ligada a su uso como espacio de encuentro social. El futuro proyecta una integración ecológica con la antigua plaza de toros.'
    }
  },
  {
    id: 'terremoto',
    icon: AlertTriangle,
    title: 'El Terremoto de 1999: Destrucción y Renacimiento',
    period: '25 de enero de 1999',
    color: 'bg-orange-600',
    content: {
      intro: 'El sismo del 25 de enero de 1999 marcó un antes y un después en la historia del barrio San José y El Bosque. La tragedia redefinió completamente el paisaje urbano y social del sector.',
      facts: [
        { label: 'Fecha', value: '25 de enero de 1999' },
        { label: 'Magnitud', value: '6.2 en escala de Richter' },
        { label: 'Epicentro', value: 'Córdoba, Quindío' },
        { label: 'Impacto en Armenia', value: 'Destrucción masiva del centro y barrios tradicionales' },
      ],
      destroyed: [
        'Estadio San José - Demolido completamente',
        'Batallón Cisneros - Destrucción total',
        'Plaza de Toros - Daños severos',
        'Escuelas y viviendas - Pérdidas incalculables'
      ],
      transformation: 'El proceso de reconstrucción tomó años y transformó el uso del suelo. De las ruinas surgieron nuevas instituciones, conjuntos residenciales y espacios comunitarios que hoy definen la identidad del barrio.',
      note: 'La tragedia también trajo oportunidades: Fundanza encontró su hogar definitivo en el barrio, ocupando el terreno de una escuela destruida.'
    }
  },
  {
    id: 'fundanza',
    icon: Music,
    title: 'Fundanza: El Alma Cultural del Barrio',
    period: '1988 - Presente',
    color: 'bg-purple-600',
    content: {
      intro: 'La Fundación Cultural del Quindío (Fundanza) es la institución cultural más importante del sector y un referente nacional en la enseñanza de las artes. Su historia es un testimonio de resiliencia.',
      facts: [
        { label: 'Fundación', value: 'Febrero de 1988' },
        { label: 'Fundador', value: 'Maestro James González Mata' },
        { label: 'Origen', value: 'Egresados bailarines del INEM José Celestino Mutis' },
        { label: 'Ubicación actual', value: 'Calle 19 con Carrera 27' },
      ],
      transformation: 'Tras el terremoto de 1999, Fundanza encontró su hogar definitivo en el barrio. El director gestionó un comodato con el concejo municipal para ocupar el terreno de una escuela primaria destruida. La recuperación fue una labor titánica financiada con préstamo y trabajo propio.',
      education: {
        title: 'Modelo Educativo Único',
        description: 'En convenio con la Escuela Normal Superior del Quindío, ofrece el Bachillerato Artístico: materias académicas tradicionales junto con énfasis profundo en danza, música o teatro. Los jóvenes se gradúan como bachilleres con competencias artísticas certificadas.'
      },
      note: 'Fundanza ha funcionado como un escudo protector contra la vulnerabilidad social, rescatando tradiciones como la "Danza de los Macheteros" y posicionando al Quindío en festivales internacionales.'
    }
  },
  {
    id: 'religion',
    icon: Church,
    title: 'Fe y Tradición: Los Templos del Barrio',
    period: 'Siglo XX - Presente',
    color: 'bg-amber-600',
    content: {
      intro: 'La geografía espiritual del barrio está marcada por dos referentes fundamentales que han moldeado la identidad de la comunidad.',
      temples: [
        {
          name: 'Parroquia San José Obrero',
          description: 'Lleva el nombre del barrio y está vinculada al monumento de San José erigido en 1959. La elección del patrono de los trabajadores no fue casual: refleja la vocación laboral de los primeros pobladores y la cercanía a las antiguas fábricas.'
        },
        {
          name: 'Santuario del Sagrado Corazón de Jesús',
          description: 'Conocida popularmente como la "Iglesia de Piedra" por su arquitectura distintiva. Ubicada estratégicamente cerca de la Calle 21, es el referente religioso principal para muchos habitantes del sector.'
        }
      ],
      note: 'El monumento a San José de 1959 en el parque principal simboliza la fe y laboriosidad que definieron a las familias fundadoras del barrio.'
    }
  },
  {
    id: 'comercio',
    icon: Utensils,
    title: 'Sabores y Comercio: La Calle 21',
    period: '1930s - Presente',
    color: 'bg-cyan-600',
    content: {
      intro: 'La Calle 21 es el eje comercial vital del occidente de Armenia. Su transformación de circuito hípico a arteria comercial refleja la evolución del barrio.',
      facts: [
        { label: 'Origen', value: 'Década de 1930 - Actividades ecuestres' },
        { label: 'Transformación', value: 'Pavimentación y urbanización' },
        { label: 'Estado actual', value: 'Principal corredor comercial del sector' },
      ],
      landmarks: [
        {
          name: 'Restaurante Kong Sing',
          description: 'El referente indiscutible de comida china tradicional que ha marcado a varias generaciones sobre la Calle 21.'
        },
        {
          name: 'Panaderías El Triunfo y El Rey',
          description: 'Establecimientos de mediados del siglo XX, consideradas entre las mejores panaderías de Armenia.'
        },
        {
          name: 'Restaurante de Mariscos Tradicional',
          description: 'Un secreto local guardado en la memoria oral del vecindario, símbolo de los sabores que definieron al barrio.'
        }
      ],
      note: 'La tradición comercial incluye fábricas de calzado y marroquinería que representan la vocación manufacturera de la región.'
    }
  },
  {
    id: 'educacion',
    icon: GraduationCap,
    title: 'Educación: Formando Generaciones',
    period: 'Siglo XX - Presente',
    color: 'bg-blue-600',
    content: {
      intro: 'El barrio San José y El Bosque se consolidó como un polo educativo de Armenia, con instituciones públicas y privadas que han formado a miles de familias.',
      schools: [
        {
          name: 'Colegio San José de los Hermanos Maristas',
          type: 'Privado',
          description: 'Pilar de la formación privada que ha moldeado a las familias pioneras del sector desde sus inicios.'
        },
        {
          name: 'Colegio de la Sagrada Familia (Capuchinas)',
          type: 'Privado',
          description: 'Institución tradicional vinculada a la comunidad religiosa.'
        },
        {
          name: 'Colegio Rufino José Cuervo Centro',
          type: 'Público',
          description: 'Se erige hoy en terrenos que pertenecieron al antiguo Batallón Cisneros, surgido tras la reconstrucción.'
        },
        {
          name: 'Fundanza - Bachillerato Artístico',
          type: 'Convenio',
          description: 'Modelo único de educación formal con énfasis en artes escénicas.'
        }
      ],
      services: {
        name: 'Comfenalco Quindío',
        location: 'Carrera 23 con Calle 23',
        description: 'Ofrece gimnasio, formación técnica, cursos de idiomas y capacitaciones, ampliando las oportunidades educativas para jóvenes y adultos del sector.'
      }
    }
  }
]

export default function HistoriaPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('estadio')

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cafe-quindio-700 via-cafe-quindio-600 to-cafe-quindio-800 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center space-x-2 mb-4">
              <History className="w-6 h-6 text-amarillo-sol-400" />
              <span className="text-cafe-quindio-200">Barrio San José y El Bosque</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Historia del Barrio
            </h1>
            <p className="text-lg text-cafe-quindio-100 max-w-3xl mb-6">
              Desde 1937 hasta hoy: la rica historia del estadio donde nació la gloria del Deportes Quindío,
              el batallón que se transformó en comunidad, y el bosque que sigue siendo el pulmón verde de Armenia.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-cafe-quindio-500/50 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 inline mr-1" /> Campeonato 1956
              </span>
              <span className="bg-cafe-quindio-500/50 px-3 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4 inline mr-1" /> Terremoto 1999
              </span>
              <span className="bg-cafe-quindio-500/50 px-3 py-1 rounded-full">
                <TreePine className="w-4 h-4 inline mr-1" /> Bosque desde 1937
              </span>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Línea del Tiempo
            </h2>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-cafe-quindio-200 transform md:-translate-x-1/2"></div>

              <div className="space-y-8">
                {timelineEvents.map((event, index) => (
                  <div
                    key={event.year}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-4 md:left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 z-10 ${
                      event.disaster ? 'bg-red-500' : event.highlight ? 'bg-verde-jac-500' : 'bg-cafe-quindio-400'
                    }`}></div>

                    {/* Content */}
                    <div className={`ml-12 md:ml-0 md:w-1/2 ${
                      index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                    }`}>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${
                        event.disaster ? 'bg-red-100 text-red-700' : event.highlight ? 'bg-verde-jac-100 text-verde-jac-700' : 'bg-cafe-quindio-100 text-cafe-quindio-700'
                      }`}>
                        {event.year}
                      </div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Historical Sections */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Lugares y Momentos Históricos
            </h2>

            <div className="space-y-4">
              {historicalSections.map((section) => (
                <Card key={section.id} padding="none" className="overflow-hidden">
                  {/* Header - Always visible */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{section.title}</h3>
                        <p className="text-sm text-gray-500">{section.period}</p>
                      </div>
                    </div>
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Expanded content */}
                  {expandedSection === section.id && (
                    <div className="px-4 md:px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4 space-y-4">
                        <p className="text-gray-700">{section.content.intro}</p>

                        {/* Facts grid */}
                        {section.content.facts && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {section.content.facts.map((fact, i) => (
                              <div key={i} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">{fact.label}</p>
                                <p className="text-sm font-medium text-gray-900">{fact.value}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Transformation text */}
                        {section.content.transformation && (
                          <div className="bg-verde-jac-50 border-l-4 border-verde-jac-500 p-4 rounded-r-lg">
                            <p className="text-verde-jac-800 font-medium mb-2">Transformación:</p>
                            <p className="text-verde-jac-700 text-sm">{section.content.transformation}</p>
                          </div>
                        )}

                        {/* Subdivisions list */}
                        {section.content.subdivisions && (
                          <ul className="space-y-2">
                            {section.content.subdivisions.map((item, i) => (
                              <li key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                                <ArrowRight className="w-4 h-4 text-verde-jac-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Destroyed list (for earthquake) */}
                        {section.content.destroyed && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <p className="text-red-800 font-medium mb-2">Estructuras destruidas:</p>
                            <ul className="space-y-1">
                              {section.content.destroyed.map((item, i) => (
                                <li key={i} className="text-red-700 text-sm flex items-center space-x-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Education model (for Fundanza) */}
                        {section.content.education && (
                          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                            <p className="text-purple-800 font-medium mb-2">{section.content.education.title}</p>
                            <p className="text-purple-700 text-sm">{section.content.education.description}</p>
                          </div>
                        )}

                        {/* Temples (for religion) */}
                        {section.content.temples && (
                          <div className="grid md:grid-cols-2 gap-4">
                            {section.content.temples.map((temple, i) => (
                              <div key={i} className="bg-amber-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-amber-900 mb-2">{temple.name}</h4>
                                <p className="text-sm text-amber-800">{temple.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Landmarks (for commerce) */}
                        {section.content.landmarks && (
                          <div className="grid md:grid-cols-3 gap-4">
                            {section.content.landmarks.map((landmark, i) => (
                              <div key={i} className="bg-cyan-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-cyan-900 mb-2">{landmark.name}</h4>
                                <p className="text-sm text-cyan-800">{landmark.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Schools (for education) */}
                        {section.content.schools && (
                          <div className="space-y-3">
                            {section.content.schools.map((school, i) => (
                              <div key={i} className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  school.type === 'Privado' ? 'bg-blue-200 text-blue-800' :
                                  school.type === 'Público' ? 'bg-green-200 text-green-800' :
                                  'bg-purple-200 text-purple-800'
                                }`}>
                                  {school.type}
                                </span>
                                <div>
                                  <h4 className="font-semibold text-blue-900">{school.name}</h4>
                                  <p className="text-sm text-blue-800">{school.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Services (for education - Comfenalco) */}
                        {section.content.services && (
                          <div className="bg-indigo-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-indigo-900 mb-1">{section.content.services.name}</h4>
                            <p className="text-xs text-indigo-600 mb-2">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {section.content.services.location}
                            </p>
                            <p className="text-sm text-indigo-800">{section.content.services.description}</p>
                          </div>
                        )}

                        {/* Note */}
                        {section.content.note && (
                          <p className="text-sm text-gray-500 italic border-t border-gray-100 pt-4">
                            {section.content.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-cafe-quindio-500 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿Tienes fotos o historias del barrio?
            </h2>
            <p className="text-cafe-quindio-100 mb-6 max-w-2xl mx-auto">
              Ayúdanos a preservar la memoria de nuestra comunidad. Si tienes fotografías antiguas,
              documentos históricos o recuerdos que quieras compartir, contáctanos.
            </p>
            <a
              href="https://wa.me/573001234567?text=Hola,%20tengo%20fotos%20o%20historias%20del%20barrio%20San%20José"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white text-cafe-quindio-600 px-6 py-3 rounded-lg font-semibold hover:bg-cafe-quindio-50 transition-colors"
            >
              <span>Compartir mi historia</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
