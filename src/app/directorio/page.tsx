'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import { Search, MapPin, Phone, Mail, Store, Filter, X } from 'lucide-react'
import negociosData from '@/data/negocios.json'

interface Negocio {
  id: string
  nombre: string
  tipo: string
  categoria: string
  direccion: string
  telefono: string
  email: string
  descripcion: string
  barrio: string
  fuente: string
}

// Categorías principales para filtrar
const CATEGORIAS = [
  { id: 'todos', label: 'Todos', icon: Store },
  { id: 'restaurante', label: 'Restaurantes', keywords: ['RESTAURANTE', 'CAFETERIA', 'COMIDAS'] },
  { id: 'tienda', label: 'Tiendas', keywords: ['TIENDA', 'MISCELANEA', 'COMERCIO'] },
  { id: 'salud', label: 'Salud', keywords: ['DROGUERIA', 'MEDICAMENTOS', 'DIAGNOSTICO', 'SALUD'] },
  { id: 'belleza', label: 'Belleza', keywords: ['PELUQUERIA', 'SALON', 'BELLEZA', 'ESTETICA'] },
  { id: 'servicios', label: 'Servicios', keywords: ['SERVICIO', 'TRANSPORTE', 'PARQUEADERO', 'INMOBILIARIA'] },
  { id: 'papeleria', label: 'Papelerías', keywords: ['PAPELERIA'] },
  { id: 'alojamiento', label: 'Alojamiento', keywords: ['ALOJAMIENTO', 'HOTEL', 'HOSTAL'] },
]

function categorizarNegocio(tipo: string): string {
  const tipoUpper = tipo.toUpperCase()
  for (const cat of CATEGORIAS) {
    if (cat.keywords && cat.keywords.some(k => tipoUpper.includes(k))) {
      return cat.id
    }
  }
  return 'otros'
}

export default function DirectorioPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos')
  const [mostrarTodos, setMostrarTodos] = useState(false)

  const negocios: Negocio[] = negociosData.negocios

  const negociosFiltrados = useMemo(() => {
    return negocios.filter(negocio => {
      // Filtro por búsqueda
      const busquedaLower = busqueda.toLowerCase()
      const coincideBusqueda = busqueda === '' ||
        negocio.nombre.toLowerCase().includes(busquedaLower) ||
        negocio.tipo.toLowerCase().includes(busquedaLower) ||
        negocio.direccion.toLowerCase().includes(busquedaLower)

      // Filtro por categoría
      const coincideCategoria = categoriaSeleccionada === 'todos' ||
        categorizarNegocio(negocio.tipo) === categoriaSeleccionada

      return coincideBusqueda && coincideCategoria
    })
  }, [negocios, busqueda, categoriaSeleccionada])

  const negociosMostrados = mostrarTodos ? negociosFiltrados : negociosFiltrados.slice(0, 24)

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoriaSeleccionada('todos')
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center space-x-2 mb-4">
              <Store className="w-6 h-6 text-blue-200" />
              <span className="text-blue-100">Barrio San José y El Bosque</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Directorio de Negocios
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mb-8">
              Encuentra panaderías, restaurantes, ferreterías y más de {negocios.length} servicios
              registrados en nuestro barrio.
            </p>

            {/* Barra de búsqueda */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, tipo o dirección..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filtros y Resultados */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Filtros por categoría */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtrar por categoría:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSeleccionada(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      categoriaSeleccionada === cat.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">{negociosMostrados.length}</span>
                {!mostrarTodos && negociosFiltrados.length > 24 && (
                  <> de <span className="font-semibold text-gray-900">{negociosFiltrados.length}</span></>
                )}
                {' '}negocios
              </p>
              {(busqueda || categoriaSeleccionada !== 'todos') && (
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>

            {/* Grid de negocios */}
            {negociosFiltrados.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {negociosMostrados.map((negocio) => (
                    <NegocioCard key={negocio.id} negocio={negocio} />
                  ))}
                </div>

                {/* Botón ver más */}
                {!mostrarTodos && negociosFiltrados.length > 24 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setMostrarTodos(true)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Ver todos los {negociosFiltrados.length} negocios
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron negocios
                </h3>
                <p className="text-gray-500 mb-4">
                  Intenta con otros términos de búsqueda o cambia los filtros.
                </p>
                <button
                  onClick={limpiarFiltros}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function NegocioCard({ negocio }: { negocio: Negocio }) {
  const formatTelefono = (tel: string) => {
    // Si es un celular (10 dígitos empezando con 3), formatearlo
    if (tel.length === 10 && tel.startsWith('3')) {
      return `${tel.slice(0, 3)} ${tel.slice(3, 6)} ${tel.slice(6)}`
    }
    return tel
  }

  const formatNombre = (nombre: string) => {
    // Capitalizar correctamente
    return nombre
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Card hover className="flex flex-col h-full">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {formatNombre(negocio.nombre)}
        </h3>
        <p className="text-sm text-blue-600 mb-3 line-clamp-2">
          {negocio.tipo}
        </p>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{negocio.direccion}</span>
          </div>

          {negocio.telefono && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={`tel:${negocio.telefono}`}
                className="text-verde-jac-600 hover:text-verde-jac-700"
              >
                {formatTelefono(negocio.telefono)}
              </a>
            </div>
          )}

          {negocio.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={`mailto:${negocio.email}`}
                className="text-verde-jac-600 hover:text-verde-jac-700 truncate"
              >
                {negocio.email}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Fuente: Cámara de Comercio
        </span>
      </div>
    </Card>
  )
}
