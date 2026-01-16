'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCoordenadas } from '@/data/coordenadas-negocios'

interface Negocio {
  id: string
  nombre: string
  direccion: string
  categoria?: string
  precision: string
  coordinates: [number, number]
}

interface MapaDirectorioProps {
  negocios: any[]
  negocioSeleccionado?: string | null
  onNegocioClick?: (id: string) => void
}

// POIs verificados del barrio
const POIS = [
  { id: 'estadio', nombre: 'Estadio San José', lat: 4.53172, lon: -75.67935, icon: '🏟️', tipo: 'Deportivo' },
  { id: 'plaza_toros', nombre: 'Plaza de Toros El Bosque', lat: 4.54025, lon: -75.67550, icon: '🐂', tipo: 'Patrimonio' },
  { id: 'parroquia', nombre: 'Parroquia San José Obrero', lat: 4.53050, lon: -75.68005, icon: '⛪', tipo: 'Religioso' },
  { id: 'fundanza', nombre: 'FUNDANZA', lat: 4.53580, lon: -75.67650, icon: '🎭', tipo: 'Cultural' },
  { id: 'rufino', nombre: 'Colegio Rufino J. Cuervo', lat: 4.53750, lon: -75.67700, icon: '🏫', tipo: 'Educación' },
  { id: 'parque', nombre: 'Parque El Bosque', lat: 4.5395, lon: -75.6760, icon: '🌲', tipo: 'Recreación' },
]

// Polígonos de barrios
const BARRIO_SAN_JOSE: L.LatLngExpression[] = [
  [4.5260, -75.6850],
  [4.5260, -75.6750],
  [4.5350, -75.6750],
  [4.5350, -75.6850],
]

const BARRIO_EL_BOSQUE: L.LatLngExpression[] = [
  [4.5350, -75.6800],
  [4.5350, -75.6700],
  [4.5450, -75.6700],
  [4.5450, -75.6800],
]

export default function MapaDirectorio({ negocios, negocioSeleccionado, onNegocioClick }: MapaDirectorioProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const [mostrarPOIs, setMostrarPOIs] = useState(true)
  const [mostrarBarrios, setMostrarBarrios] = useState(true)
  
  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Crear mapa
    const map = L.map(mapContainerRef.current, {
      center: [4.5360, -75.6775],
      zoom: 15,
      zoomControl: true,
    })
    
    // Capa base OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Layer group para marcadores de negocios
    markersRef.current = L.layerGroup().addTo(map)

    // Agregar polígonos de barrios
    L.polygon(BARRIO_SAN_JOSE, {
      color: '#2d8f4a',
      fillColor: '#2d8f4a',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map).bindPopup('<strong>Barrio San José</strong><br>Comuna 6')

    L.polygon(BARRIO_EL_BOSQUE, {
      color: '#1a5f2a',
      fillColor: '#1a5f2a',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map).bindPopup('<strong>Barrio El Bosque</strong><br>Comuna 5')

    // Agregar POIs
    POIS.forEach(poi => {
      const icon = L.divIcon({
        className: 'custom-poi-icon',
        html: `<div style="font-size: 24px; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">${poi.icon}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })
      
      L.marker([poi.lat, poi.lon], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 5px;">${poi.icon}</div>
            <strong>${poi.nombre}</strong><br>
            <span style="color: #666; font-size: 12px;">${poi.tipo}</span>
          </div>
        `)
    })

    // Escala
    L.control.scale({ metric: true, imperial: false }).addTo(map)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Actualizar marcadores de negocios
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return

    // Limpiar marcadores existentes
    markersRef.current.clearLayers()

    // Agregar marcadores con coordenadas reales
    negocios.forEach((negocio) => {
      // Obtener coordenadas del archivo geocodificado
      const coords = getCoordenadas(negocio.id)
      if (!coords) return // Saltar si no tiene coordenadas
      
      const { lat, lon, precision } = coords
      const isSelected = negocioSeleccionado === negocio.id
      const isInterpolated = precision === 'interpolada'
      
      const icon = L.divIcon({
        className: 'custom-negocio-icon',
        html: `
          <div style="
            width: ${isSelected ? '16px' : '10px'};
            height: ${isSelected ? '16px' : '10px'};
            background: ${isSelected ? '#FF5722' : (isInterpolated ? '#2196F3' : '#FFC107')};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            transition: all 0.2s;
          "></div>
        `,
        iconSize: [isSelected ? 16 : 10, isSelected ? 16 : 10],
        iconAnchor: [isSelected ? 8 : 5, isSelected ? 8 : 5],
      })

      const marker = L.marker([lat, lon], { icon })
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong style="font-size: 14px; color: #1a5f2a;">${negocio.nombre}</strong><br>
            <span style="color: #666; font-size: 12px;">${negocio.tipo || 'Comercio'}</span><br>
            <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">
            <div style="font-size: 12px;">
              <strong>📍</strong> ${negocio.direccion || 'Sin dirección'}<br>
              ${negocio.telefono ? `<strong>📞</strong> ${negocio.telefono}` : ''}
            </div>
          </div>
        `)
        .on('click', () => {
          if (onNegocioClick) onNegocioClick(negocio.id)
        })

      markersRef.current?.addLayer(marker)
    })
  }, [negocios, negocioSeleccionado, onNegocioClick])

  // Centrar en negocio seleccionado
  useEffect(() => {
    if (!mapRef.current || !negocioSeleccionado) return

    const coords = getCoordenadas(negocioSeleccionado)
    if (coords) {
      mapRef.current.setView([coords.lat, coords.lon], 17)
    }
  }, [negocioSeleccionado])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
      
      {/* Controles del mapa */}
      <div className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => mapRef.current?.setView([4.5360, -75.6775], 15)}
          className="block w-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Centrar mapa"
        >
          🎯 Centrar
        </button>
        <button
          onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 15) + 1)}
          className="block w-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          ➕ Zoom +
        </button>
        <button
          onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() || 15) - 1)}
          className="block w-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          ➖ Zoom -
        </button>
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-semibold mb-2">Leyenda</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow"></div>
          <span>Ubicación precisa ({negocios.length})</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full border border-white shadow"></div>
          <span>Ubicación aproximada</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🏟️</span>
          <span>POIs verificados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 opacity-50 rounded"></div>
          <span>Área del barrio</span>
        </div>
      </div>
    </div>
  )
}
