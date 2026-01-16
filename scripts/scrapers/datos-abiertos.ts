/**
 * Scraper de Datos Abiertos Colombia (datos.gov.co)
 * JAC Barrio San José y El Bosque - Armenia, Quindío
 * 
 * Usa la API Socrata SODA para obtener datos en formato JSON
 * Documentación: https://dev.socrata.com/docs/queries/
 * 
 * Ejecutar: npx tsx scripts/scrapers/datos-abiertos.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Base URL de la API Socrata
const SOCRATA_BASE = 'https://www.datos.gov.co/resource'

// Datasets de Armenia disponibles
const DATASETS = {
  // Cámara de Comercio Armenia
  establecimientos_comercio: {
    id: '9evq-x8rx',
    name: 'Establecimientos de Comercio Activos Armenia',
    description: 'Negocios registrados en la Cámara de Comercio',
  },
  comerciantes: {
    id: 'rptq-q4rd', 
    name: 'Comerciantes Personas Naturales y Jurídicas',
    description: 'Registro de comerciantes de Armenia',
  },
  entidades_sin_lucro: {
    id: '8hes-t424',
    name: 'Entidades Sin Ánimo de Lucro Activas',
    description: 'ONGs, fundaciones, asociaciones de Armenia',
  },
  
  // Alcaldía de Armenia
  propiedad_horizontal: {
    id: 'yt69-qmjq',
    name: 'Propiedad Horizontal Armenia Quindío',
    description: 'Conjuntos residenciales y edificios',
  },
  
  // SECOP - Contratación Pública
  secop_procesos: {
    id: 'urv6-axvk',
    name: 'SECOP II - Procesos de Contratación Armenia',
    description: 'Contratos y licitaciones del municipio',
  },
  secop_proveedores: {
    id: '56sy-nvip',
    name: 'SECOP II - Proveedores Registrados Armenia',
    description: 'Proveedores del Estado en Armenia',
  },
  contratacion_municipal: {
    id: 'bvbe-867b',
    name: 'Vista Contratación Municipio de Armenia',
    description: 'Contratos finalizados SECOP I y II',
  },
  
  // Servicios Públicos
  usuarios_epa: {
    id: 'gqhg-jix2',
    name: 'Usuarios Empresas Públicas de Armenia',
    description: 'Usuarios por servicio, estrato y uso',
  },
  sedes_epa: {
    id: '66ku-wyca',
    name: 'Sedes de Empresas Públicas de Armenia',
    description: 'Ubicación de oficinas EPA',
  },
  
  // Turismo
  rnt_prestadores: {
    id: '64jt-inpp',
    name: 'RNT Armenia Quindío',
    description: 'Prestadores de servicios turísticos',
  },
  
  // Tienda Virtual del Estado
  tvec: {
    id: 'qc6t-5eda',
    name: 'Tienda Virtual del Estado - Armenia',
    description: 'Compras públicas por agregación de demanda',
  },
} as const

type DatasetKey = keyof typeof DATASETS

interface SocrataQueryOptions {
  limit?: number
  offset?: number
  where?: string
  select?: string
  order?: string
  q?: string // Búsqueda de texto completo
}

// Barrios del área de interés para filtrar
const BARRIOS_INTERES = [
  'san jose',
  'san josé',
  'el bosque',
  'bosque',
  'estadio',
]

/**
 * Construye la URL de la API Socrata con parámetros de consulta
 */
function buildSocrataUrl(datasetId: string, options: SocrataQueryOptions = {}): string {
  const url = new URL(`${SOCRATA_BASE}/${datasetId}.json`)
  
  // Límite por defecto alto para obtener todos los datos
  url.searchParams.set('$limit', String(options.limit || 50000))
  
  if (options.offset) {
    url.searchParams.set('$offset', String(options.offset))
  }
  if (options.where) {
    url.searchParams.set('$where', options.where)
  }
  if (options.select) {
    url.searchParams.set('$select', options.select)
  }
  if (options.order) {
    url.searchParams.set('$order', options.order)
  }
  if (options.q) {
    url.searchParams.set('$q', options.q)
  }
  
  return url.toString()
}

/**
 * Fetch con reintentos y manejo de rate limiting
 */
async function fetchWithRetry(
  url: string, 
  maxRetries = 3, 
  delayMs = 1000
): Promise<unknown[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  → Fetching (intento ${attempt}/${maxRetries})...`)
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          // Agregar App Token si tienes uno (opcional pero recomendado)
          // 'X-App-Token': process.env.SOCRATA_APP_TOKEN || '',
        },
      })
      
      if (response.status === 429) {
        // Rate limited - esperar más tiempo
        const waitTime = delayMs * attempt * 2
        console.log(`  ⚠️  Rate limited. Esperando ${waitTime}ms...`)
        await sleep(waitTime)
        continue
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data as unknown[]
      
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      console.log(`  ⚠️  Error en intento ${attempt}: ${error}. Reintentando...`)
      await sleep(delayMs * attempt)
    }
  }
  
  return []
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Descarga un dataset completo de Socrata
 */
async function fetchDataset(
  datasetKey: DatasetKey, 
  options: SocrataQueryOptions = {}
): Promise<unknown[]> {
  const dataset = DATASETS[datasetKey]
  console.log(`\n📊 Descargando: ${dataset.name}`)
  console.log(`   Dataset ID: ${dataset.id}`)
  
  const url = buildSocrataUrl(dataset.id, options)
  console.log(`   URL: ${url}`)
  
  const data = await fetchWithRetry(url)
  console.log(`   ✅ Registros obtenidos: ${data.length}`)
  
  return data
}

/**
 * Guarda datos en archivo JSON
 */
function saveToJson(data: unknown, filename: string): void {
  const outputDir = path.join(process.cwd(), 'data', 'raw', 'datos_publicos')
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const filepath = path.join(outputDir, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`   💾 Guardado en: ${filepath}`)
}

/**
 * Filtra registros que podrían pertenecer al barrio San José o El Bosque
 */
function filterByBarrio(records: Record<string, unknown>[], addressField: string): Record<string, unknown>[] {
  return records.filter(record => {
    const address = String(record[addressField] || '').toLowerCase()
    const barrio = String(record['barrio'] || record['nombre_barrio'] || '').toLowerCase()
    
    return BARRIOS_INTERES.some(b => 
      address.includes(b) || barrio.includes(b)
    )
  })
}

/**
 * Procesa y enriquece datos de establecimientos comerciales
 */
async function processEstablecimientosComercio(): Promise<void> {
  const data = await fetchDataset('establecimientos_comercio') as Record<string, unknown>[]
  
  // Guardar todos los datos
  saveToJson(data, 'establecimientos_comercio_armenia.json')
  
  // Filtrar por barrio si hay campo de dirección
  if (data.length > 0 && data[0]) {
    console.log(`   Campos disponibles: ${Object.keys(data[0]).join(', ')}`)
    
    // Intentar filtrar por barrio
    const addressFields = ['direccion', 'direccion_comercial', 'domicilio', 'ubicacion']
    for (const field of addressFields) {
      if (field in data[0]) {
        const filtrados = filterByBarrio(data, field)
        if (filtrados.length > 0) {
          saveToJson(filtrados, 'establecimientos_barrio_san_jose.json')
          console.log(`   🏘️  Filtrados del barrio: ${filtrados.length}`)
        }
        break
      }
    }
  }
}

/**
 * Procesa datos de propiedad horizontal
 */
async function processPropiedadHorizontal(): Promise<void> {
  const data = await fetchDataset('propiedad_horizontal') as Record<string, unknown>[]
  
  saveToJson(data, 'propiedad_horizontal_armenia.json')
  
  // Mostrar campos para análisis
  if (data.length > 0 && data[0]) {
    console.log(`   Campos disponibles: ${Object.keys(data[0]).join(', ')}`)
  }
}

/**
 * Procesa datos de SECOP - Contratación pública
 */
async function processSecop(): Promise<void> {
  // Procesos de contratación recientes (último año)
  const currentYear = new Date().getFullYear()
  const data = await fetchDataset('secop_procesos', {
    where: `fecha_de_publicacion > '${currentYear - 1}-01-01'`,
    order: 'fecha_de_publicacion DESC',
    limit: 5000,
  }) as Record<string, unknown>[]
  
  saveToJson(data, 'secop_procesos_armenia.json')
  
  // Contratación municipal histórica
  const contratacion = await fetchDataset('contratacion_municipal', {
    limit: 10000,
  }) as Record<string, unknown>[]
  
  saveToJson(contratacion, 'contratacion_municipal_armenia.json')
}

/**
 * Procesa entidades sin ánimo de lucro (incluye JACs)
 */
async function processEntidadesSinLucro(): Promise<void> {
  const data = await fetchDataset('entidades_sin_lucro') as Record<string, unknown>[]
  
  saveToJson(data, 'entidades_sin_lucro_armenia.json')
  
  // Buscar específicamente JACs
  const jacs = data.filter(record => {
    const nombre = String(record['razon_social'] || record['nombre'] || '').toLowerCase()
    return nombre.includes('junta de accion') || 
           nombre.includes('junta de acción') ||
           nombre.includes('jac ')
  })
  
  if (jacs.length > 0) {
    saveToJson(jacs, 'juntas_accion_comunal_armenia.json')
    console.log(`   🏛️  JACs encontradas: ${jacs.length}`)
  }
}

/**
 * Procesa prestadores de servicios turísticos
 */
async function processTurismo(): Promise<void> {
  const data = await fetchDataset('rnt_prestadores') as Record<string, unknown>[]
  
  saveToJson(data, 'prestadores_turisticos_armenia.json')
}

/**
 * Genera resumen estadístico de los datos descargados
 */
function generateSummary(): void {
  const outputDir = path.join(process.cwd(), 'data', 'raw', 'datos_publicos')
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'))
  
  console.log('\n📈 RESUMEN DE DATOS DESCARGADOS')
  console.log('================================')
  
  const summary: Record<string, number> = {}
  
  for (const file of files) {
    const filepath = path.join(outputDir, file)
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
    const count = Array.isArray(data) ? data.length : 1
    summary[file] = count
    console.log(`  ${file}: ${count} registros`)
  }
  
  saveToJson({
    fecha_extraccion: new Date().toISOString(),
    datasets: summary,
    total_registros: Object.values(summary).reduce((a, b) => a + b, 0),
  }, '_resumen_extraccion.json')
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  console.log('🚀 SCRAPER DE DATOS ABIERTOS COLOMBIA')
  console.log('=====================================')
  console.log('Objetivo: JAC Barrio San José y El Bosque - Armenia, Quindío')
  console.log(`Fecha: ${new Date().toISOString()}\n`)
  
  try {
    // 1. Establecimientos comerciales (negocios)
    await processEstablecimientosComercio()
    await sleep(1000) // Respetar rate limits
    
    // 2. Propiedad horizontal (conjuntos, edificios)
    await processPropiedadHorizontal()
    await sleep(1000)
    
    // 3. SECOP - Contratación pública
    await processSecop()
    await sleep(1000)
    
    // 4. Entidades sin ánimo de lucro (buscar otras JACs)
    await processEntidadesSinLucro()
    await sleep(1000)
    
    // 5. Turismo
    await processTurismo()
    
    // Generar resumen
    generateSummary()
    
    console.log('\n✅ EXTRACCIÓN COMPLETADA')
    console.log('Los datos están en: data/raw/datos_publicos/')
    
  } catch (error) {
    console.error('\n❌ Error durante la extracción:', error)
    process.exit(1)
  }
}

// Ejecutar
main()
