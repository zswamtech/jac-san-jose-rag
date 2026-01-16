/**
 * Scraper de SECOP - Contratación Pública Colombia
 * JAC Barrio San José y El Bosque - Armenia, Quindío
 * 
 * Obtiene contratos de obra pública del Quindío para identificar
 * proyectos que benefician o afectan al barrio.
 * 
 * Fuentes:
 * - SECOP I y II via datos.gov.co
 * - API directa de Colombia Compra Eficiente
 * 
 * Ejecutar: npx tsx scripts/scrapers/secop-contratos.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// APIs de SECOP
const SECOP_APIS = {
  // Datos.gov.co - SECOP II Armenia
  procesos_armenia: 'https://www.datos.gov.co/resource/urv6-axvk.json',
  proveedores_armenia: 'https://www.datos.gov.co/resource/56sy-nvip.json',
  contratacion_armenia: 'https://www.datos.gov.co/resource/bvbe-867b.json',
  
  // SECOP a nivel Quindío (más amplio)
  secop_quindio: 'https://www.datos.gov.co/resource/jbjy-vk9h.json', // SECOP II Quindío
}

// Palabras clave para filtrar contratos relevantes al barrio
const KEYWORDS_BARRIO = [
  'san jose',
  'san josé', 
  'el bosque',
  'estadio centenario',
  'avenida 19',
  'carrera 19',
  'calle 20',
  'calle 21',
  'calle 22',
]

// Tipos de contratos de interés comunitario
const TIPOS_CONTRATO_INTERES = [
  'obra',
  'interventoría',
  'mantenimiento',
  'construcción',
  'pavimentación',
  'alumbrado',
  'acueducto',
  'alcantarillado',
  'parques',
  'espacio público',
  'vías',
  'infraestructura',
  'educación',
  'salud',
  'deporte',
  'cultura',
  'seguridad',
]

interface ContratoSecop {
  id_contrato?: string
  numero_contrato?: string
  nombre_del_procedimiento?: string
  descripcion_del_procedimiento?: string
  objeto_del_contrato?: string
  valor_del_contrato?: string | number
  valor_total_adjudicacion?: string | number
  nombre_entidad?: string
  estado_contrato?: string
  fecha_de_publicacion?: string
  fecha_de_firma?: string
  nombre_proveedor?: string
  nit_proveedor?: string
  modalidad_de_contratacion?: string
  tipo_de_contrato?: string
  urlproceso?: {url?: string}
  [key: string]: unknown
}

/**
 * Fetch con manejo de errores
 */
async function fetchSecop(url: string, params: Record<string, string> = {}): Promise<ContratoSecop[]> {
  const fullUrl = new URL(url)
  
  // Parámetros por defecto
  fullUrl.searchParams.set('$limit', params.limit || '50000')
  
  // Agregar parámetros adicionales
  for (const [key, value] of Object.entries(params)) {
    if (key !== 'limit') {
      fullUrl.searchParams.set(key, value)
    }
  }
  
  console.log(`  → Fetching: ${fullUrl.toString().substring(0, 100)}...`)
  
  try {
    const response = await fetch(fullUrl.toString(), {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      console.error(`  ❌ HTTP ${response.status}`)
      return []
    }
    
    return await response.json() as ContratoSecop[]
  } catch (error) {
    console.error(`  ❌ Error: ${error}`)
    return []
  }
}

/**
 * Filtra contratos que pueden ser relevantes para el barrio
 */
function filterContratosRelevantes(contratos: ContratoSecop[]): ContratoSecop[] {
  return contratos.filter(contrato => {
    const texto = [
      contrato.nombre_del_procedimiento,
      contrato.descripcion_del_procedimiento,
      contrato.objeto_del_contrato,
    ].join(' ').toLowerCase()
    
    // Verificar si menciona el barrio directamente
    const mencionaBarrio = KEYWORDS_BARRIO.some(kw => texto.includes(kw))
    
    // O si es un contrato de tipo relevante para la comunidad
    const tipoRelevante = TIPOS_CONTRATO_INTERES.some(tipo => texto.includes(tipo))
    
    return mencionaBarrio || tipoRelevante
  })
}

/**
 * Clasifica contratos por categoría
 */
function clasificarContratos(contratos: ContratoSecop[]): Record<string, ContratoSecop[]> {
  const clasificados: Record<string, ContratoSecop[]> = {
    infraestructura: [],
    educacion: [],
    salud: [],
    deportes: [],
    servicios_publicos: [],
    seguridad: [],
    otros: [],
  }
  
  for (const contrato of contratos) {
    const texto = [
      contrato.nombre_del_procedimiento,
      contrato.objeto_del_contrato,
    ].join(' ').toLowerCase()
    
    if (texto.includes('vía') || texto.includes('via') || texto.includes('paviment') || texto.includes('puente')) {
      clasificados.infraestructura.push(contrato)
    } else if (texto.includes('colegio') || texto.includes('escuela') || texto.includes('educac')) {
      clasificados.educacion.push(contrato)
    } else if (texto.includes('hospital') || texto.includes('salud') || texto.includes('medic')) {
      clasificados.salud.push(contrato)
    } else if (texto.includes('deporte') || texto.includes('cancha') || texto.includes('parque') || texto.includes('estadio')) {
      clasificados.deportes.push(contrato)
    } else if (texto.includes('acueducto') || texto.includes('alcantarillado') || texto.includes('alumbrado') || texto.includes('gas')) {
      clasificados.servicios_publicos.push(contrato)
    } else if (texto.includes('seguridad') || texto.includes('cámara') || texto.includes('vigilancia')) {
      clasificados.seguridad.push(contrato)
    } else {
      clasificados.otros.push(contrato)
    }
  }
  
  return clasificados
}

/**
 * Extrae estadísticas de contratación
 */
function extraerEstadisticas(contratos: ContratoSecop[]): Record<string, unknown> {
  const valores = contratos
    .map(c => {
      const val = c.valor_del_contrato || c.valor_total_adjudicacion
      return typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : val
    })
    .filter(v => v && !isNaN(v as number)) as number[]
  
  const entidades = [...new Set(contratos.map(c => c.nombre_entidad).filter(Boolean))]
  const proveedores = [...new Set(contratos.map(c => c.nombre_proveedor).filter(Boolean))]
  
  return {
    total_contratos: contratos.length,
    valor_total: valores.reduce((a, b) => a + b, 0),
    valor_promedio: valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0,
    valor_maximo: Math.max(...valores, 0),
    valor_minimo: Math.min(...valores.filter(v => v > 0), 0),
    entidades_contratantes: entidades.length,
    proveedores_unicos: proveedores.length,
    top_entidades: entidades.slice(0, 10),
    top_proveedores: proveedores.slice(0, 10),
  }
}

/**
 * Guarda datos en archivo JSON
 */
function saveToJson(data: unknown, filename: string): void {
  const outputDir = path.join(process.cwd(), 'data', 'raw', 'datos_publicos', 'secop')
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const filepath = path.join(outputDir, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`  💾 Guardado: ${filename} (${Array.isArray(data) ? data.length + ' registros' : 'resumen'})`)
}

/**
 * Descarga y procesa contratos de SECOP
 */
async function main(): Promise<void> {
  console.log('🏛️  SCRAPER SECOP - CONTRATACIÓN PÚBLICA')
  console.log('========================================')
  console.log('Objetivo: Identificar contratos relevantes para el barrio')
  console.log(`Fecha: ${new Date().toISOString()}\n`)
  
  try {
    // 1. Procesos de contratación Armenia
    console.log('\n📋 1. Procesos de contratación - Armenia')
    const procesos = await fetchSecop(SECOP_APIS.procesos_armenia, {
      '$order': 'fecha_de_publicacion DESC',
    })
    saveToJson(procesos, 'secop_procesos_armenia_completo.json')
    
    // Filtrar relevantes
    const procesosRelevantes = filterContratosRelevantes(procesos)
    saveToJson(procesosRelevantes, 'secop_procesos_relevantes_barrio.json')
    console.log(`  🎯 Contratos relevantes: ${procesosRelevantes.length} de ${procesos.length}`)
    
    // 2. Contratación municipal histórica
    console.log('\n📋 2. Contratación municipal histórica')
    const contratacion = await fetchSecop(SECOP_APIS.contratacion_armenia)
    saveToJson(contratacion, 'contratacion_municipal_completa.json')
    
    const contratacionRelevante = filterContratosRelevantes(contratacion)
    saveToJson(contratacionRelevante, 'contratacion_relevante_barrio.json')
    console.log(`  🎯 Contratos relevantes: ${contratacionRelevante.length} de ${contratacion.length}`)
    
    // 3. Proveedores registrados
    console.log('\n📋 3. Proveedores registrados en Armenia')
    const proveedores = await fetchSecop(SECOP_APIS.proveedores_armenia)
    saveToJson(proveedores, 'proveedores_armenia.json')
    
    // 4. Clasificar y generar estadísticas
    console.log('\n📊 4. Generando análisis...')
    const todosContratos = [...procesosRelevantes, ...contratacionRelevante]
    const clasificados = clasificarContratos(todosContratos)
    const estadisticas = extraerEstadisticas(todosContratos)
    
    // Guardar clasificación
    for (const [categoria, items] of Object.entries(clasificados)) {
      if (items.length > 0) {
        saveToJson(items, `contratos_${categoria}.json`)
      }
    }
    
    // Guardar resumen
    const resumen = {
      fecha_extraccion: new Date().toISOString(),
      estadisticas,
      clasificacion: Object.fromEntries(
        Object.entries(clasificados).map(([k, v]) => [k, v.length])
      ),
      contratos_por_barrio: {
        mencionan_san_jose: todosContratos.filter(c => 
          JSON.stringify(c).toLowerCase().includes('san jose') ||
          JSON.stringify(c).toLowerCase().includes('san josé')
        ).length,
        mencionan_el_bosque: todosContratos.filter(c =>
          JSON.stringify(c).toLowerCase().includes('el bosque')
        ).length,
      }
    }
    saveToJson(resumen, '_resumen_secop.json')
    
    console.log('\n✅ EXTRACCIÓN SECOP COMPLETADA')
    console.log('===============================')
    console.log(`Total contratos analizados: ${procesos.length + contratacion.length}`)
    console.log(`Contratos relevantes identificados: ${todosContratos.length}`)
    console.log('Archivos guardados en: data/raw/datos_publicos/secop/')
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()
