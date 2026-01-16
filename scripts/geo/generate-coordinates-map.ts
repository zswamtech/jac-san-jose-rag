/**
 * Script para generar archivo de coordenadas para el frontend
 * Crea un mapa id -> coordenadas para el componente MapaDirectorio
 */

import * as fs from 'fs'
import * as path from 'path'

const GEO_DIR = path.join(__dirname, '../../data/raw/geo')
const OUTPUT_DIR = path.join(__dirname, '../../src/data')

interface GeoJSONFeature {
  type: 'Feature'
  properties: Record<string, any>
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

interface GeoJSON {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

function main() {
  console.log('🗺️ Generando mapa de coordenadas para frontend...\n')

  // Cargar negocios geocodificados
  const geojsonPath = path.join(GEO_DIR, 'negocios_geocoded.geojson')
  
  if (!fs.existsSync(geojsonPath)) {
    console.error('❌ No se encontró negocios_geocoded.geojson')
    console.log('   Ejecuta primero: npm run geo:geocode')
    process.exit(1)
  }

  const data: GeoJSON = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'))
  console.log(`   📂 Cargados ${data.features.length} negocios geocodificados`)

  // Crear mapa de coordenadas
  const coordenadas: Record<string, { lat: number; lon: number; precision: string }> = {}

  data.features.forEach(feature => {
    const id = feature.properties.id
    const [lon, lat] = feature.geometry.coordinates
    
    coordenadas[id] = {
      lat,
      lon,
      precision: feature.properties.precision || 'desconocida'
    }
  })

  // Asegurar que el directorio existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Guardar como TypeScript
  const tsContent = `/**
 * Coordenadas de negocios geocodificados
 * Generado automáticamente - No editar manualmente
 * Fecha: ${new Date().toISOString()}
 */

export interface Coordenada {
  lat: number
  lon: number
  precision: 'interpolada' | 'centroide_barrio' | 'verificada' | 'desconocida'
}

export const coordenadasNegocios: Record<string, Coordenada> = ${JSON.stringify(coordenadas, null, 2)} as const

export function getCoordenadas(id: string): Coordenada | null {
  return coordenadasNegocios[id] || null
}

export function getCoordenadasMultiple(ids: string[]): Record<string, Coordenada> {
  const result: Record<string, Coordenada> = {}
  ids.forEach(id => {
    const coord = coordenadasNegocios[id]
    if (coord) result[id] = coord
  })
  return result
}
`

  const outputPath = path.join(OUTPUT_DIR, 'coordenadas-negocios.ts')
  fs.writeFileSync(outputPath, tsContent)
  console.log(`   ✅ Guardado: ${outputPath}`)

  // Estadísticas
  const interpoladas = Object.values(coordenadas).filter(c => c.precision === 'interpolada').length
  const centroide = Object.values(coordenadas).filter(c => c.precision === 'centroide_barrio').length

  console.log('\n📊 Resumen:')
  console.log(`   Total: ${Object.keys(coordenadas).length}`)
  console.log(`   Interpoladas: ${interpoladas} (${((interpoladas/Object.keys(coordenadas).length)*100).toFixed(1)}%)`)
  console.log(`   Centroide: ${centroide} (${((centroide/Object.keys(coordenadas).length)*100).toFixed(1)}%)`)

  console.log('\n✅ Listo! Importa en tu componente:')
  console.log("   import { getCoordenadas } from '@/data/coordenadas-negocios'")
}

main()
