/**
 * Scraper de Datos Geográficos y Ambientales
 * JAC Barrio San José y El Bosque - Armenia, Quindío
 *
 * Incluye:
 * - OpenStreetMap (límites, POIs)
 * - Geocodificación de direcciones
 * - GBIF/SiB Colombia (biodiversidad)
 *
 * Ejecutar: npx tsx scripts/scrapers/geo-data.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// ============================================
// CONFIGURACIÓN
// ============================================

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'raw', 'geo')

// Coordenadas aproximadas de Armenia, Quindío
const ARMENIA_CENTER = { lat: 4.5339, lon: -75.6811 }

// Bounding box aproximado del Barrio San José y El Bosque
// (Ajustar con datos reales cuando estén disponibles)
const BARRIO_BBOX = {
  south: 4.525,
  north: 4.545,
  west: -75.695,
  east: -75.675,
}

// ============================================
// UTILIDADES
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function saveJson(data: unknown, filename: string): void {
  ensureDir(OUTPUT_DIR)
  const filepath = path.join(OUTPUT_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`  💾 Guardado: ${filepath}`)
}

// ============================================
// 1. OPENSTREETMAP - Overpass API
// ============================================

const OVERPASS_API = 'https://overpass-api.de/api/interpreter'

interface OverpassElement {
  type: string
  id: number
  lat?: number
  lon?: number
  tags?: Record<string, string>
  nodes?: number[]
  geometry?: Array<{ lat: number; lon: number }>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

/**
 * Ejecuta una consulta Overpass
 */
async function queryOverpass(query: string): Promise<OverpassResponse> {
  console.log('  → Consultando Overpass API...')

  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })

  if (!response.ok) {
    throw new Error(`Overpass error: ${response.status}`)
  }

  return response.json() as Promise<OverpassResponse>
}

/**
 * Obtiene barrios de Armenia desde OSM
 */
async function fetchBarriosArmenia(): Promise<void> {
  console.log('\n🗺️  Buscando barrios de Armenia en OpenStreetMap...')

  const query = `
    [out:json][timeout:60];
    area["name"="Armenia"]["admin_level"="8"]->.city;
    (
      // Barrios como relaciones
      relation["place"="neighbourhood"](area.city);
      // Barrios como ways
      way["place"="neighbourhood"](area.city);
      // Barrios como nodos
      node["place"="neighbourhood"](area.city);
      // Buscar específicamente San José y El Bosque
      node["name"~"San José|El Bosque|Bosque"](area.city);
      way["name"~"San José|El Bosque|Bosque"](area.city);
    );
    out body;
    >;
    out skel qt;
  `

  try {
    const data = await queryOverpass(query)
    console.log(`  ✅ Elementos encontrados: ${data.elements.length}`)

    // Filtrar elementos con nombre
    const barrios = data.elements.filter((e) => e.tags?.name)
    console.log(`  🏘️  Barrios con nombre: ${barrios.length}`)

    if (barrios.length > 0) {
      console.log('  Barrios encontrados:')
      barrios.forEach((b) => {
        console.log(`    - ${b.tags?.name} (${b.type})`)
      })
    }

    saveJson(data, 'osm_barrios_armenia.json')
  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

/**
 * Obtiene POIs (Points of Interest) del área del barrio
 */
async function fetchPOIsBarrio(): Promise<void> {
  console.log('\n📍 Buscando POIs en el área del barrio...')

  const { south, north, west, east } = BARRIO_BBOX

  const query = `
    [out:json][timeout:60];
    (
      // Parques y áreas verdes
      way["leisure"="park"](${south},${west},${north},${east});
      node["leisure"="park"](${south},${west},${north},${east});

      // Iglesias
      node["amenity"="place_of_worship"](${south},${west},${north},${east});
      way["amenity"="place_of_worship"](${south},${west},${north},${east});

      // Escuelas y colegios
      node["amenity"="school"](${south},${west},${north},${east});
      way["amenity"="school"](${south},${west},${north},${east});

      // Estadios y deportes
      node["leisure"="stadium"](${south},${west},${north},${east});
      way["leisure"="stadium"](${south},${west},${north},${east});
      way["leisure"="pitch"](${south},${west},${north},${east});

      // Hospitales y salud
      node["amenity"="hospital"](${south},${west},${north},${east});
      node["amenity"="pharmacy"](${south},${west},${north},${east});

      // Comercios
      node["shop"](${south},${west},${north},${east});

      // Restaurantes
      node["amenity"="restaurant"](${south},${west},${north},${east});
      node["amenity"="cafe"](${south},${west},${north},${east});
    );
    out body;
    >;
    out skel qt;
  `

  try {
    const data = await queryOverpass(query)
    console.log(`  ✅ POIs encontrados: ${data.elements.length}`)

    // Contar por tipo
    const tipos: Record<string, number> = {}
    data.elements.forEach((e) => {
      if (e.tags) {
        const tipo =
          e.tags.amenity || e.tags.leisure || e.tags.shop || 'otro'
        tipos[tipo] = (tipos[tipo] || 0) + 1
      }
    })

    console.log('  Tipos de POIs:')
    Object.entries(tipos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([tipo, count]) => {
        console.log(`    - ${tipo}: ${count}`)
      })

    saveJson(data, 'osm_pois_barrio.json')
  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

/**
 * Obtiene las calles del barrio
 */
async function fetchCallesBarrio(): Promise<void> {
  console.log('\n🛤️  Obteniendo calles del área...')

  const { south, north, west, east } = BARRIO_BBOX

  const query = `
    [out:json][timeout:60];
    (
      way["highway"](${south},${west},${north},${east});
    );
    out body;
    >;
    out skel qt;
  `

  try {
    const data = await queryOverpass(query)
    console.log(`  ✅ Vías encontradas: ${data.elements.filter((e) => e.type === 'way').length}`)

    saveJson(data, 'osm_calles_barrio.json')
  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

// ============================================
// 2. GEOCODIFICACIÓN - Nominatim
// ============================================

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  importance: number
  type: string
}

interface GeocodedAddress {
  original: string
  lat: number | null
  lon: number | null
  display_name: string | null
  confidence: number
  error?: string
}

/**
 * Geocodifica una dirección usando Nominatim
 */
async function geocodeAddress(direccion: string): Promise<GeocodedAddress> {
  // Limpiar y formatear la dirección
  const cleanAddress = direccion
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

  // Agregar contexto de Armenia, Quindío
  const query = `${cleanAddress}, Armenia, Quindío, Colombia`

  try {
    const url = `${NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'JAC-SanJose-Armenia-Project/1.0 (Educational/Community)',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const results = (await response.json()) as NominatimResult[]

    if (results.length > 0) {
      return {
        original: direccion,
        lat: parseFloat(results[0].lat),
        lon: parseFloat(results[0].lon),
        display_name: results[0].display_name,
        confidence: results[0].importance,
      }
    }

    return {
      original: direccion,
      lat: null,
      lon: null,
      display_name: null,
      confidence: 0,
      error: 'No encontrado',
    }
  } catch (error) {
    return {
      original: direccion,
      lat: null,
      lon: null,
      display_name: null,
      confidence: 0,
      error: String(error),
    }
  }
}

/**
 * Geocodifica los negocios del barrio
 */
async function geocodeNegocios(): Promise<void> {
  console.log('\n📍 Geocodificando negocios del barrio...')

  // Cargar negocios
  const negociosPath = path.join(
    process.cwd(),
    'data',
    'raw',
    'inventario_barrio',
    'negocios_completo.json'
  )

  if (!fs.existsSync(negociosPath)) {
    console.log('  ⚠️  Archivo de negocios no encontrado')
    return
  }

  const data = JSON.parse(fs.readFileSync(negociosPath, 'utf-8'))
  const negocios = data.negocios as Array<{
    id: string
    nombre: string
    direccion: string
  }>

  console.log(`  Total negocios a geocodificar: ${negocios.length}`)
  console.log('  ⚠️  Esto puede tomar tiempo (1 request/segundo por rate limit)')

  // Geocodificar en batches pequeños para demo
  const BATCH_SIZE = 10 // Solo los primeros 10 para prueba
  const muestra = negocios.slice(0, BATCH_SIZE)

  console.log(`  Procesando muestra de ${muestra.length} negocios...`)

  const resultados: GeocodedAddress[] = []

  for (let i = 0; i < muestra.length; i++) {
    const negocio = muestra[i]
    console.log(
      `  [${i + 1}/${muestra.length}] ${negocio.nombre.substring(0, 40)}...`
    )

    const resultado = await geocodeAddress(negocio.direccion)
    resultados.push({
      ...resultado,
      original: `${negocio.id}: ${negocio.direccion}`,
    })

    // Rate limit: 1 request por segundo
    await sleep(1100)
  }

  // Estadísticas
  const exitosos = resultados.filter((r) => r.lat !== null).length
  console.log(`\n  ✅ Geocodificados exitosamente: ${exitosos}/${muestra.length}`)

  saveJson(
    {
      fecha: new Date().toISOString(),
      total_procesados: muestra.length,
      exitosos,
      fallidos: muestra.length - exitosos,
      resultados,
    },
    'geocoded_negocios_muestra.json'
  )

  console.log(
    '\n  💡 Para geocodificar todos los negocios, ejecutar con --full'
  )
}

// ============================================
// 3. GBIF - Biodiversidad
// ============================================

const GBIF_API = 'https://api.gbif.org/v1'

interface GBIFOccurrence {
  key: number
  scientificName: string
  vernacularName?: string
  decimalLatitude: number
  decimalLongitude: number
  eventDate?: string
  basisOfRecord: string
  kingdom?: string
  phylum?: string
  class?: string
  order?: string
  family?: string
  genus?: string
  species?: string
}

interface GBIFResponse {
  offset: number
  limit: number
  count: number
  results: GBIFOccurrence[]
}

/**
 * Obtiene registros de biodiversidad de GBIF
 */
async function fetchGBIFOccurrences(): Promise<void> {
  console.log('\n🦜 Buscando registros de biodiversidad en GBIF...')

  // Buscar por coordenadas del área de Armenia
  const { lat, lon } = ARMENIA_CENTER
  const radius = 5 // km

  try {
    // Buscar ocurrencias con coordenadas cerca de Armenia
    const url = `${GBIF_API}/occurrence/search?decimalLatitude=${lat}&decimalLongitude=${lon}&radius=${radius}km&limit=300&hasCoordinate=true`

    console.log(`  → Buscando en radio de ${radius}km desde Armenia...`)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = (await response.json()) as GBIFResponse

    console.log(`  ✅ Total registros encontrados: ${data.count}`)
    console.log(`  📥 Registros descargados: ${data.results.length}`)

    // Estadísticas por grupo taxonómico
    const porReino: Record<string, number> = {}
    const porClase: Record<string, number> = {}

    data.results.forEach((r) => {
      if (r.kingdom) {
        porReino[r.kingdom] = (porReino[r.kingdom] || 0) + 1
      }
      if (r.class) {
        porClase[r.class] = (porClase[r.class] || 0) + 1
      }
    })

    console.log('\n  Por reino:')
    Object.entries(porReino)
      .sort((a, b) => b[1] - a[1])
      .forEach(([reino, count]) => {
        console.log(`    - ${reino}: ${count}`)
      })

    console.log('\n  Clases más frecuentes:')
    Object.entries(porClase)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([clase, count]) => {
        console.log(`    - ${clase}: ${count}`)
      })

    // Guardar datos
    saveJson(
      {
        fecha: new Date().toISOString(),
        centro: ARMENIA_CENTER,
        radio_km: radius,
        total_registros: data.count,
        registros_descargados: data.results.length,
        estadisticas: {
          por_reino: porReino,
          por_clase: porClase,
        },
        registros: data.results,
      },
      'gbif_biodiversidad_armenia.json'
    )
  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

/**
 * Obtiene especies específicas (aves, plantas)
 */
async function fetchEspeciesEspecificas(): Promise<void> {
  console.log('\n🐦 Buscando aves en el área...')

  const { lat, lon } = ARMENIA_CENTER

  try {
    // Aves (Aves class)
    const avesUrl = `${GBIF_API}/occurrence/search?decimalLatitude=${lat}&decimalLongitude=${lon}&radius=10km&limit=200&hasCoordinate=true&taxonKey=212` // 212 = Aves

    const response = await fetch(avesUrl)
    const data = (await response.json()) as GBIFResponse

    console.log(`  ✅ Registros de aves: ${data.count}`)

    // Especies únicas
    const especies = new Set<string>()
    data.results.forEach((r) => {
      if (r.species) especies.add(r.species)
    })

    console.log(`  🐦 Especies de aves únicas: ${especies.size}`)

    if (especies.size > 0) {
      console.log('  Algunas especies:')
      Array.from(especies)
        .slice(0, 10)
        .forEach((sp) => {
          console.log(`    - ${sp}`)
        })
    }

    saveJson(
      {
        fecha: new Date().toISOString(),
        tipo: 'aves',
        total_registros: data.count,
        especies_unicas: Array.from(especies),
        registros: data.results,
      },
      'gbif_aves_armenia.json'
    )
  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main(): Promise<void> {
  console.log('🌍 SCRAPER DE DATOS GEOGRÁFICOS Y AMBIENTALES')
  console.log('=============================================')
  console.log('Barrio San José y El Bosque - Armenia, Quindío')
  console.log(`Fecha: ${new Date().toISOString()}\n`)

  const args = process.argv.slice(2)
  const runFull = args.includes('--full')
  const runOnly = args.find((a) => a.startsWith('--only='))?.split('=')[1]

  try {
    if (!runOnly || runOnly === 'osm') {
      // 1. OpenStreetMap
      await fetchBarriosArmenia()
      await sleep(2000)

      await fetchPOIsBarrio()
      await sleep(2000)

      await fetchCallesBarrio()
      await sleep(2000)
    }

    if (!runOnly || runOnly === 'geocode') {
      // 2. Geocodificación (muestra)
      await geocodeNegocios()
      await sleep(2000)
    }

    if (!runOnly || runOnly === 'gbif') {
      // 3. Biodiversidad GBIF
      await fetchGBIFOccurrences()
      await sleep(2000)

      await fetchEspeciesEspecificas()
    }

    console.log('\n✅ EXTRACCIÓN COMPLETADA')
    console.log(`Los datos están en: ${OUTPUT_DIR}`)

    // Resumen de archivos generados
    if (fs.existsSync(OUTPUT_DIR)) {
      const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.json'))
      console.log(`\n📁 Archivos generados: ${files.length}`)
      files.forEach((f) => console.log(`   - ${f}`))
    }
  } catch (error) {
    console.error('\n❌ Error durante la extracción:', error)
    process.exit(1)
  }
}

// Ejecutar
main()
