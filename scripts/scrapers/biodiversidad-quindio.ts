/**
 * Scraper de Biodiversidad - Quindío y Armenia
 *
 * Fuentes:
 * - GBIF (Global Biodiversity Information Facility)
 * - SiB Colombia (Sistema de Información sobre Biodiversidad)
 *
 * Ejecutar: npx tsx scripts/scrapers/biodiversidad-quindio.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// ============================================
// CONFIGURACIÓN
// ============================================

const OUTPUT_DIR = path.join(process.cwd(), 'data', 'raw', 'biodiversidad')

// Coordenadas de Armenia, Quindío
const ARMENIA = { lat: 4.5339, lon: -75.6811 }

// Bounding box del departamento del Quindío (aproximado)
const QUINDIO_BBOX = {
  minLat: 4.2,
  maxLat: 4.8,
  minLon: -75.9,
  maxLon: -75.4
}

// GADM codes para Colombia/Quindío
const GADM_QUINDIO = 'COL.26_1' // Departamento del Quindío

// ============================================
// UTILIDADES
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
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
// GBIF API - Búsqueda ampliada
// ============================================

const GBIF_API = 'https://api.gbif.org/v1'

interface GBIFOccurrence {
  key: number
  scientificName: string
  vernacularName?: string
  decimalLatitude?: number
  decimalLongitude?: number
  eventDate?: string
  year?: number
  basisOfRecord: string
  kingdom?: string
  phylum?: string
  class?: string
  order?: string
  family?: string
  genus?: string
  species?: string
  locality?: string
  stateProvince?: string
  municipality?: string
  datasetName?: string
}

interface GBIFResponse {
  offset: number
  limit: number
  count: number
  results: GBIFOccurrence[]
}

/**
 * Busca ocurrencias en GBIF por bounding box del Quindío
 */
async function fetchGBIFQuindio(): Promise<void> {
  console.log('\n🌿 GBIF - Biodiversidad del Quindío (búsqueda ampliada)...')

  const { minLat, maxLat, minLon, maxLon } = QUINDIO_BBOX

  // Construir URL con bounding box
  const params = new URLSearchParams({
    decimalLatitude: `${minLat},${maxLat}`,
    decimalLongitude: `${minLon},${maxLon}`,
    hasCoordinate: 'true',
    limit: '1000',
    offset: '0'
  })

  try {
    console.log(`  → Buscando en área: ${minLat}-${maxLat}°N, ${minLon}-${maxLon}°W`)

    const url = `${GBIF_API}/occurrence/search?${params}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json() as GBIFResponse

    console.log(`  ✅ Total registros en Quindío: ${data.count}`)
    console.log(`  📥 Descargados: ${data.results.length}`)

    // Estadísticas
    const stats = analyzeOccurrences(data.results)
    printStats(stats)

    saveJson({
      fecha: new Date().toISOString(),
      area: 'Quindío',
      bbox: QUINDIO_BBOX,
      total_registros: data.count,
      descargados: data.results.length,
      estadisticas: stats,
      registros: data.results
    }, 'gbif_quindio_completo.json')

  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

/**
 * Busca específicamente aves del Quindío
 */
async function fetchAvesQuindio(): Promise<void> {
  console.log('\n🐦 GBIF - Aves del Quindío...')

  const { minLat, maxLat, minLon, maxLon } = QUINDIO_BBOX

  const params = new URLSearchParams({
    decimalLatitude: `${minLat},${maxLat}`,
    decimalLongitude: `${minLon},${maxLon}`,
    hasCoordinate: 'true',
    taxonKey: '212', // Aves
    limit: '1000'
  })

  try {
    const url = `${GBIF_API}/occurrence/search?${params}`
    const response = await fetch(url)
    const data = await response.json() as GBIFResponse

    console.log(`  ✅ Total registros de aves: ${data.count}`)
    console.log(`  📥 Descargados: ${data.results.length}`)

    // Especies únicas
    const especies = new Map<string, { count: number, vernacular?: string }>()
    data.results.forEach(r => {
      if (r.species) {
        const existing = especies.get(r.species) || { count: 0, vernacular: r.vernacularName }
        existing.count++
        especies.set(r.species, existing)
      }
    })

    console.log(`  🐦 Especies únicas: ${especies.size}`)

    // Top 20 especies más registradas
    const topEspecies = Array.from(especies.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)

    console.log('\n  Top 20 especies de aves:')
    topEspecies.forEach(([sp, info], i) => {
      const vernacular = info.vernacular ? ` (${info.vernacular})` : ''
      console.log(`    ${i + 1}. ${sp}${vernacular} - ${info.count} registros`)
    })

    saveJson({
      fecha: new Date().toISOString(),
      area: 'Quindío',
      grupo: 'Aves',
      total_registros: data.count,
      especies_unicas: especies.size,
      top_especies: topEspecies.map(([sp, info]) => ({
        especie: sp,
        nombre_comun: info.vernacular,
        registros: info.count
      })),
      todas_especies: Array.from(especies.entries()).map(([sp, info]) => ({
        especie: sp,
        nombre_comun: info.vernacular,
        registros: info.count
      })),
      registros: data.results
    }, 'gbif_aves_quindio.json')

  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

/**
 * Busca plantas del Quindío
 */
async function fetchPlantasQuindio(): Promise<void> {
  console.log('\n🌱 GBIF - Plantas del Quindío...')

  const { minLat, maxLat, minLon, maxLon } = QUINDIO_BBOX

  const params = new URLSearchParams({
    decimalLatitude: `${minLat},${maxLat}`,
    decimalLongitude: `${minLon},${maxLon}`,
    hasCoordinate: 'true',
    taxonKey: '6', // Plantae
    limit: '1000'
  })

  try {
    const url = `${GBIF_API}/occurrence/search?${params}`
    const response = await fetch(url)
    const data = await response.json() as GBIFResponse

    console.log(`  ✅ Total registros de plantas: ${data.count}`)
    console.log(`  📥 Descargados: ${data.results.length}`)

    // Familias más comunes
    const familias = new Map<string, number>()
    data.results.forEach(r => {
      if (r.family) {
        familias.set(r.family, (familias.get(r.family) || 0) + 1)
      }
    })

    console.log(`  🌿 Familias botánicas: ${familias.size}`)

    const topFamilias = Array.from(familias.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)

    console.log('\n  Top 15 familias de plantas:')
    topFamilias.forEach(([fam, count], i) => {
      console.log(`    ${i + 1}. ${fam} - ${count} registros`)
    })

    saveJson({
      fecha: new Date().toISOString(),
      area: 'Quindío',
      grupo: 'Plantas',
      total_registros: data.count,
      familias_unicas: familias.size,
      top_familias: topFamilias.map(([fam, count]) => ({ familia: fam, registros: count })),
      registros: data.results
    }, 'gbif_plantas_quindio.json')

  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

/**
 * Busca mamíferos del Quindío
 */
async function fetchMamiferosQuindio(): Promise<void> {
  console.log('\n🦝 GBIF - Mamíferos del Quindío...')

  const { minLat, maxLat, minLon, maxLon } = QUINDIO_BBOX

  const params = new URLSearchParams({
    decimalLatitude: `${minLat},${maxLat}`,
    decimalLongitude: `${minLon},${maxLon}`,
    hasCoordinate: 'true',
    taxonKey: '359', // Mammalia
    limit: '500'
  })

  try {
    const url = `${GBIF_API}/occurrence/search?${params}`
    const response = await fetch(url)
    const data = await response.json() as GBIFResponse

    console.log(`  ✅ Total registros de mamíferos: ${data.count}`)

    const especies = new Set<string>()
    data.results.forEach(r => {
      if (r.species) especies.add(r.species)
    })

    console.log(`  🦝 Especies únicas: ${especies.size}`)

    if (especies.size > 0) {
      console.log('\n  Especies de mamíferos encontradas:')
      Array.from(especies).slice(0, 20).forEach(sp => {
        console.log(`    - ${sp}`)
      })
    }

    saveJson({
      fecha: new Date().toISOString(),
      area: 'Quindío',
      grupo: 'Mamíferos',
      total_registros: data.count,
      especies: Array.from(especies),
      registros: data.results
    }, 'gbif_mamiferos_quindio.json')

  } catch (error) {
    console.error('  ❌ Error:', error)
  }
}

// ============================================
// SiB Colombia API
// ============================================

const SIB_API = 'https://api.biodiversidad.co/api/v1.5'

/**
 * Busca especies en SiB Colombia
 */
async function fetchSiBColombia(): Promise<void> {
  console.log('\n🇨🇴 SiB Colombia - Biodiversidad del Quindío...')

  try {
    // Buscar por departamento
    const url = `${SIB_API}/occurrence/search?stateProvince=Quindío&limit=500`

    console.log(`  → Consultando SiB Colombia...`)

    const response = await fetch(url)

    if (!response.ok) {
      console.log(`  ⚠️  SiB API respondió con ${response.status}`)
      // Intentar endpoint alternativo
      await fetchSiBColombiaAlternative()
      return
    }

    const data = await response.json()
    console.log(`  ✅ Registros encontrados: ${data.count || data.results?.length || 0}`)

    saveJson({
      fecha: new Date().toISOString(),
      fuente: 'SiB Colombia',
      departamento: 'Quindío',
      datos: data
    }, 'sib_colombia_quindio.json')

  } catch (error) {
    console.log(`  ⚠️  Error con SiB API: ${error}`)
    await fetchSiBColombiaAlternative()
  }
}

/**
 * Endpoint alternativo de SiB Colombia
 */
async function fetchSiBColombiaAlternative(): Promise<void> {
  console.log('  → Intentando endpoint alternativo de SiB...')

  try {
    // Portal de datos alternativo
    const url = 'https://datos.biodiversidad.co/api/3/action/package_search?q=Quindío&rows=50'

    const response = await fetch(url)

    if (response.ok) {
      const data = await response.json()
      console.log(`  ✅ Datasets encontrados: ${data.result?.count || 0}`)

      if (data.result?.results) {
        console.log('\n  Datasets de biodiversidad del Quindío:')
        data.result.results.slice(0, 10).forEach((ds: { title: string, organization?: { title: string } }) => {
          console.log(`    - ${ds.title}`)
          if (ds.organization?.title) {
            console.log(`      Org: ${ds.organization.title}`)
          }
        })
      }

      saveJson({
        fecha: new Date().toISOString(),
        fuente: 'SiB Colombia - Portal Datos',
        departamento: 'Quindío',
        datasets: data.result
      }, 'sib_datasets_quindio.json')
    }
  } catch (error) {
    console.log(`  ❌ Error con endpoint alternativo: ${error}`)
  }
}

// ============================================
// UTILIDADES DE ANÁLISIS
// ============================================

interface OccurrenceStats {
  porReino: Record<string, number>
  porClase: Record<string, number>
  porFamilia: Record<string, number>
  porAnio: Record<string, number>
  conCoordenadas: number
  sinCoordenadas: number
}

function analyzeOccurrences(records: GBIFOccurrence[]): OccurrenceStats {
  const stats: OccurrenceStats = {
    porReino: {},
    porClase: {},
    porFamilia: {},
    porAnio: {},
    conCoordenadas: 0,
    sinCoordenadas: 0
  }

  records.forEach(r => {
    if (r.kingdom) {
      stats.porReino[r.kingdom] = (stats.porReino[r.kingdom] || 0) + 1
    }
    if (r.class) {
      stats.porClase[r.class] = (stats.porClase[r.class] || 0) + 1
    }
    if (r.family) {
      stats.porFamilia[r.family] = (stats.porFamilia[r.family] || 0) + 1
    }
    if (r.year) {
      stats.porAnio[r.year] = (stats.porAnio[r.year] || 0) + 1
    }
    if (r.decimalLatitude && r.decimalLongitude) {
      stats.conCoordenadas++
    } else {
      stats.sinCoordenadas++
    }
  })

  return stats
}

function printStats(stats: OccurrenceStats): void {
  console.log('\n  📊 Estadísticas:')

  console.log('\n  Por Reino:')
  Object.entries(stats.porReino)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reino, count]) => {
      console.log(`    - ${reino}: ${count}`)
    })

  console.log('\n  Top 10 Clases:')
  Object.entries(stats.porClase)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([clase, count]) => {
      console.log(`    - ${clase}: ${count}`)
    })

  console.log(`\n  Con coordenadas: ${stats.conCoordenadas}`)
  console.log(`  Sin coordenadas: ${stats.sinCoordenadas}`)
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main(): Promise<void> {
  console.log('🌍 SCRAPER DE BIODIVERSIDAD - QUINDÍO')
  console.log('=====================================')
  console.log(`Fecha: ${new Date().toISOString()}\n`)

  try {
    // 1. GBIF - Búsqueda general ampliada
    await fetchGBIFQuindio()
    await sleep(1000)

    // 2. GBIF - Aves específicamente
    await fetchAvesQuindio()
    await sleep(1000)

    // 3. GBIF - Plantas
    await fetchPlantasQuindio()
    await sleep(1000)

    // 4. GBIF - Mamíferos
    await fetchMamiferosQuindio()
    await sleep(1000)

    // 5. SiB Colombia
    await fetchSiBColombia()

    // Resumen final
    console.log('\n✅ EXTRACCIÓN DE BIODIVERSIDAD COMPLETADA')
    console.log(`Los datos están en: ${OUTPUT_DIR}`)

    if (fs.existsSync(OUTPUT_DIR)) {
      const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'))
      console.log(`\n📁 Archivos generados: ${files.length}`)
      files.forEach(f => console.log(`   - ${f}`))
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Ejecutar
main()
