'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import {
  FileText,
  Users,
  MessageSquareWarning,
  Lightbulb,
  CalendarCheck,
  Home,
  Clock,
  MapPin,
  CheckCircle2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Phone,
  DollarSign,
  AlertCircle
} from 'lucide-react'

interface Tramite {
  id: string
  title: string
  shortTitle: string
  icon: React.ElementType
  color: string
  description: string
  requisitos: string[]
  documentos: string[]
  pasos: string[]
  costo: string
  tiempo: string
  donde: string
  horario: string
}

const tramites: Tramite[] = [
  {
    id: 'certificado-residencia',
    title: 'Certificado de Residencia JAC',
    shortTitle: 'Certificado de Residencia',
    icon: FileText,
    color: 'bg-blue-500',
    description: 'Documento que certifica que una persona reside en el barrio San José y El Bosque. Útil para trámites ante entidades públicas y privadas.',
    requisitos: [
      'Fotocopia de la cédula de ciudadanía',
      'Recibo de servicios públicos reciente (agua, luz o gas)',
      'Carta de un vecino que certifique la residencia (opcional)',
      'Diligenciar formato de solicitud en la oficina JAC'
    ],
    documentos: [
      'Cédula de ciudadanía',
      'Recibo de servicios públicos',
      'Formato de solicitud JAC'
    ],
    pasos: [
      'Reunir los documentos requeridos (cédula y recibo de servicios)',
      'Acercarse a la oficina de la JAC en horario de atención',
      'Diligenciar el formato de solicitud',
      'Entregar los documentos al funcionario de la JAC',
      'Esperar la verificación (puede tomar de 1 a 3 días)',
      'Recoger el certificado en la oficina'
    ],
    costo: 'Gratuito',
    tiempo: '1 a 3 días hábiles',
    donde: 'Oficina de la JAC - Barrio San José',
    horario: 'Lunes a Viernes, 8:00 AM - 12:00 PM'
  },
  {
    id: 'afiliacion',
    title: 'Afiliación a la JAC',
    shortTitle: 'Afiliación JAC',
    icon: Users,
    color: 'bg-verde-jac-500',
    description: 'Permite participar activamente en las decisiones comunitarias, votar en asambleas, proponer proyectos y acceder a beneficios de programas sociales.',
    requisitos: [
      'Ser mayor de 14 años',
      'Residir en el barrio San José o El Bosque',
      'Presentar cédula de ciudadanía o tarjeta de identidad',
      'Diligenciar formato de afiliación',
      'Asistir a una asamblea de inducción'
    ],
    documentos: [
      'Cédula de ciudadanía o tarjeta de identidad',
      'Comprobante de residencia',
      'Formato de afiliación diligenciado'
    ],
    pasos: [
      'Acercarse a la oficina de la JAC y solicitar formato de afiliación',
      'Diligenciar el formato con datos personales',
      'Adjuntar fotocopia de cédula y comprobante de residencia',
      'Entregar documentación completa',
      'Esperar aprobación en la siguiente reunión de junta directiva',
      'Asistir a asamblea de inducción',
      'Recibir carné de afiliado'
    ],
    costo: 'Gratuito',
    tiempo: 'Según calendario de reuniones de junta directiva',
    donde: 'Oficina de la JAC - Barrio San José',
    horario: 'Lunes a Viernes, 8:00 AM - 12:00 PM'
  },
  {
    id: 'queja-reclamo',
    title: 'Presentar Queja o Reclamo',
    shortTitle: 'Quejas y Reclamos',
    icon: MessageSquareWarning,
    color: 'bg-orange-500',
    description: 'Reporte problemas comunitarios: alumbrado público, estado de las vías, convivencia vecinal, ruido, mascotas, entre otros. La JAC gestiona ante las autoridades.',
    requisitos: [
      'Ser residente del barrio',
      'Describir claramente el problema o situación',
      'Indicar ubicación exacta del problema',
      'Proporcionar datos de contacto'
    ],
    documentos: [
      'Formato de queja diligenciado',
      'Evidencias fotográficas (opcional pero recomendado)',
      'Cédula de ciudadanía'
    ],
    pasos: [
      'Acercarse a la oficina de la JAC o enviar la queja por escrito',
      'Describir detalladamente el problema',
      'Indicar dirección exacta y referencias',
      'Dejar datos de contacto para seguimiento',
      'La JAC registra la queja y la canaliza a la entidad correspondiente',
      'Se realiza seguimiento y se informa al ciudadano'
    ],
    costo: 'Gratuito',
    tiempo: 'Variable según el tipo de queja y la entidad responsable',
    donde: 'Oficina de la JAC - Barrio San José',
    horario: 'Lunes a Viernes, 8:00 AM - 12:00 PM'
  },
  {
    id: 'alumbrado',
    title: 'Solicitud de Alumbrado Público',
    shortTitle: 'Alumbrado Público',
    icon: Lightbulb,
    color: 'bg-amarillo-sol-500',
    description: 'Solicite reparación o instalación de luminarias en zonas con problemas de alumbrado público (lámparas dañadas, zonas oscuras).',
    requisitos: [
      'Identificar el poste o zona con problema',
      'Describir el tipo de daño (lámpara apagada, intermitente, etc.)',
      'Proporcionar dirección exacta'
    ],
    documentos: [
      'Formato de solicitud',
      'Fotografía del poste con problema (opcional)'
    ],
    pasos: [
      'Identificar el número del poste (si es visible)',
      'Reportar a la JAC con dirección exacta',
      'La JAC registra y envía la solicitud a la empresa de alumbrado',
      'Se programa visita técnica',
      'Se realiza la reparación o instalación'
    ],
    costo: 'Gratuito',
    tiempo: '7 a 15 días hábiles según disponibilidad de la empresa',
    donde: 'Oficina de la JAC o reporte directo a la empresa de alumbrado',
    horario: 'Lunes a Viernes, 8:00 AM - 12:00 PM'
  },
  {
    id: 'asambleas',
    title: 'Participar en Asambleas',
    shortTitle: 'Asambleas',
    icon: CalendarCheck,
    color: 'bg-purple-500',
    description: 'Las asambleas son espacios de participación ciudadana para tomar decisiones, elegir dignatarios, aprobar proyectos y rendir cuentas. Todo afiliado tiene derecho a voz y voto.',
    requisitos: [
      'Estar afiliado a la JAC',
      'Asistir puntualmente a las convocatorias',
      'Presentar cédula de ciudadanía para registro de asistencia'
    ],
    documentos: [
      'Cédula de ciudadanía',
      'Carné de afiliado JAC'
    ],
    pasos: [
      'Estar atento a las convocatorias (carteleras, WhatsApp, perifoneo)',
      'Confirmar fecha, hora y lugar de la asamblea',
      'Asistir puntualmente',
      'Registrar asistencia con cédula',
      'Participar activamente en debates y votaciones',
      'Firmar actas si es requerido'
    ],
    costo: 'Gratuito',
    tiempo: 'Según estatutos (ordinarias y extraordinarias)',
    donde: 'Salón comunal o espacio público designado',
    horario: 'Según convocatoria'
  },
  {
    id: 'salon-comunal',
    title: 'Solicitar Uso del Salón Comunal',
    shortTitle: 'Salón Comunal',
    icon: Home,
    color: 'bg-cyan-500',
    description: 'Los afiliados pueden solicitar el salón comunal para eventos familiares, reuniones o actividades comunitarias, sujeto a disponibilidad.',
    requisitos: [
      'Estar afiliado a la JAC',
      'Estar al día con aportes (si aplica)',
      'Solicitar con mínimo 15 días de anticipación',
      'Firmar compromiso de buen uso y entrega'
    ],
    documentos: [
      'Formato de solicitud de salón comunal',
      'Cédula de ciudadanía',
      'Carné de afiliado'
    ],
    pasos: [
      'Verificar disponibilidad en la oficina de la JAC',
      'Diligenciar formato de solicitud indicando fecha, hora y tipo de evento',
      'Firmar compromiso de responsabilidad',
      'Realizar depósito de garantía (si aplica)',
      'Recibir las llaves el día del evento',
      'Entregar el salón en las mismas condiciones'
    ],
    costo: 'Variable según evento y duración. Consultar tarifas vigentes.',
    tiempo: 'Aprobación en 3 a 5 días hábiles',
    donde: 'Oficina de la JAC - Barrio San José',
    horario: 'Lunes a Viernes, 8:00 AM - 12:00 PM'
  }
]

export default function TramitesPage() {
  const [expandedTramite, setExpandedTramite] = useState<string | null>('certificado-residencia')

  const toggleTramite = (id: string) => {
    setExpandedTramite(expandedTramite === id ? null : id)
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amarillo-sol-500 via-amarillo-sol-400 to-amarillo-sol-600 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-6 h-6 text-amarillo-sol-100" />
              <span className="text-amarillo-sol-100">Junta de Acción Comunal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-amarillo-sol-900">
              Trámites JAC
            </h1>
            <p className="text-lg text-amarillo-sol-800 max-w-2xl mb-6">
              Certificados de residencia, afiliación, quejas y más servicios de la Junta de Acción Comunal
              del Barrio San José y El Bosque.
            </p>

            {/* Quick info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <Clock className="w-5 h-5 text-amarillo-sol-900 mb-2" />
                <p className="text-sm text-amarillo-sol-900 font-medium">Horario</p>
                <p className="text-xs text-amarillo-sol-800">Lun - Vie, 8AM - 12PM</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <MapPin className="w-5 h-5 text-amarillo-sol-900 mb-2" />
                <p className="text-sm text-amarillo-sol-900 font-medium">Ubicación</p>
                <p className="text-xs text-amarillo-sol-800">Oficina JAC - Barrio San José</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <Phone className="w-5 h-5 text-amarillo-sol-900 mb-2" />
                <p className="text-sm text-amarillo-sol-900 font-medium">Contacto</p>
                <p className="text-xs text-amarillo-sol-800">300 123 4567</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <DollarSign className="w-5 h-5 text-amarillo-sol-900 mb-2" />
                <p className="text-sm text-amarillo-sol-900 font-medium">Costo</p>
                <p className="text-xs text-amarillo-sol-800">Mayoría gratuitos</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-8 bg-white border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Trámites disponibles:</h2>
            <div className="flex flex-wrap gap-2">
              {tramites.map((tramite) => (
                <button
                  key={tramite.id}
                  onClick={() => {
                    setExpandedTramite(tramite.id)
                    document.getElementById(tramite.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    expandedTramite === tramite.id
                      ? 'bg-verde-jac-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tramite.icon className="w-4 h-4" />
                  <span>{tramite.shortTitle}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tramites List */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {tramites.map((tramite) => (
                <div key={tramite.id} id={tramite.id}>
                <Card padding="none" className="overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggleTramite(tramite.id)}
                    className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${tramite.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <tramite.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{tramite.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{tramite.description}</p>
                      </div>
                    </div>
                    {expandedTramite === tramite.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {expandedTramite === tramite.id && (
                    <div className="px-4 md:px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4 space-y-6">
                        {/* Description */}
                        <p className="text-gray-700">{tramite.description}</p>

                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <DollarSign className="w-4 h-4 text-verde-jac-500" />
                              <span className="text-xs text-gray-500">Costo</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{tramite.costo}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span className="text-xs text-gray-500">Tiempo</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{tramite.tiempo}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <span className="text-xs text-gray-500">Dónde</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{tramite.donde}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span className="text-xs text-gray-500">Horario</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{tramite.horario}</p>
                          </div>
                        </div>

                        {/* Two Column Layout for Requirements and Documents */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Requisitos */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                              <AlertCircle className="w-5 h-5 text-orange-500" />
                              <span>Requisitos</span>
                            </h4>
                            <ul className="space-y-2">
                              {tramite.requisitos.map((req, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Documentos */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                              <FileCheck className="w-5 h-5 text-blue-500" />
                              <span>Documentos requeridos</span>
                            </h4>
                            <ul className="space-y-2">
                              {tramite.documentos.map((doc, i) => (
                                <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span>{doc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Pasos */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <CheckCircle2 className="w-5 h-5 text-verde-jac-500" />
                            <span>Paso a paso</span>
                          </h4>
                          <div className="space-y-3">
                            {tramite.pasos.map((paso, i) => (
                              <div key={i} className="flex items-start space-x-3">
                                <span className="w-6 h-6 bg-verde-jac-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {i + 1}
                                </span>
                                <p className="text-sm text-gray-700 pt-0.5">{paso}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 bg-verde-jac-500 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  ¿Tienes dudas sobre algún trámite?
                </h2>
                <p className="text-verde-jac-100 mb-6">
                  Acércate a nuestra oficina o contáctanos por WhatsApp. Estamos para servirte.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://wa.me/573001234567?text=Hola,%20tengo%20una%20consulta%20sobre%20trámites%20de%20la%20JAC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-white text-verde-jac-600 px-6 py-3 rounded-lg font-semibold hover:bg-verde-jac-50 transition-colors"
                  >
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="tel:+573001234567"
                    className="inline-flex items-center space-x-2 bg-verde-jac-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-verde-jac-700 border border-verde-jac-400 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Llamar</span>
                  </a>
                </div>
              </div>

              <div className="bg-verde-jac-600 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Información de contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-verde-jac-200 mt-0.5" />
                    <div>
                      <p className="font-medium">Dirección</p>
                      <p className="text-sm text-verde-jac-200">Oficina JAC - Barrio San José, Armenia</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-verde-jac-200 mt-0.5" />
                    <div>
                      <p className="font-medium">Horario de atención</p>
                      <p className="text-sm text-verde-jac-200">Lunes a Viernes, 8:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-verde-jac-200 mt-0.5" />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-sm text-verde-jac-200">300 123 4567</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
