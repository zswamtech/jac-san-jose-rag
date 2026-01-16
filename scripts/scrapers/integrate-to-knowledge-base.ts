/**
 * Integrador de Datos Scraped al Knowledge Base
 * JAC Barrio San José y El Bosque - Armenia, Quindío
 * 
 * Este script toma los datos scraped y los transforma al formato
 * necesario para el RAG (knowledge_base e inventario_barrio).
 * 
 * Ejecutar: npx tsx scripts/scrapers/integrate-to-knowledge-base.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const RAW_DATA_DIR = path.join(process.cwd(), 'data', 'raw', 'datos_publicos')
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'data', 'raw', 'knowledge_base')
const INVENTARIO_DIR = path.join(process.cwd(), 'data', 'raw', 'inventario_barrio')

interface NegocioFormat {
  id: string
  nombre: string
  tipo: string
  categoria: string
  direccion: string
  telefono?: string
  descripcion: string
  horario?: string
  barrio: string
  fuente: string
}

interface ContratoFormat {
  id: string
  titulo: string
  descripcion: string
  valor: number
  entidad: string
  fecha: string
  estado: string
  relevancia_barrio: string
}

/**
 * Lee archivo JSON de forma segura
 */
function readJsonSafe<T>(filepath: string): T | null {
  try {
    if (!fs.existsSync(filepath)) return null
    const content = fs.readFileSync(filepath, 'utf-8')
    return JSON.parse(content) as T
  } catch {
    console.warn(`  ⚠️  No se pudo leer: ${filepath}`)
    return null
  }
}

/**
 * Guarda archivo JSON
 */
function saveJson(data: unknown, filepath: string): void {
  const dir = path.dirname(filepath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`  💾 ${filepath}`)
}

/**
 * Procesa establecimientos comerciales y los añade al inventario
 */
function processEstablecimientos(): NegocioFormat[] {
  console.log('\n📦 Procesando establecimientos comerciales...')
  
  const filepath = path.join(RAW_DATA_DIR, 'establecimientos_barrio_san_jose.json')
  const data = readJsonSafe<Record<string, unknown>[]>(filepath)
  
  if (!data || data.length === 0) {
    // Intentar con el archivo completo
    const fullPath = path.join(RAW_DATA_DIR, 'establecimientos_comercio_armenia.json')
    const fullData = readJsonSafe<Record<string, unknown>[]>(fullPath)
    
    if (!fullData) {
      console.log('  ⚠️  No hay datos de establecimientos')
      return []
    }
    
    console.log(`  📊 ${fullData.length} establecimientos en Armenia (sin filtrar por barrio)`)
    return []
  }
  
  console.log(`  📊 ${data.length} establecimientos en el barrio`)
  
  return data.map((item, index) => ({
    id: `est_${index + 1}`,
    nombre: String(item.razon_social || item.nombre_establecimiento || 'Sin nombre'),
    tipo: String(item.actividad || item.actividad_economica || 'Comercio'),
    categoria: 'Comercio',
    direccion: String(item.dir_comercial || item.direccion || 'Armenia, Quindío'),
    telefono: item.tel_com_1 ? String(item.tel_com_1) : undefined,
    email: item.email_comercial ? String(item.email_comercial) : undefined,
    descripcion: `Establecimiento comercial registrado en Cámara de Comercio de Armenia`,
    barrio: 'San José / El Bosque',
    fuente: 'Cámara de Comercio Armenia - datos.gov.co',
  }))
}

/**
 * Procesa entidades sin ánimo de lucro (incluye JACs)
 */
function processEntidadesSinLucro(): Record<string, unknown>[] {
  console.log('\n🏛️  Procesando entidades sin ánimo de lucro...')
  
  const jacsPath = path.join(RAW_DATA_DIR, 'juntas_accion_comunal_armenia.json')
  const jacs = readJsonSafe<Record<string, unknown>[]>(jacsPath)
  
  if (jacs && jacs.length > 0) {
    console.log(`  📊 ${jacs.length} JACs encontradas en Armenia`)
    return jacs
  }
  
  return []
}

/**
 * Procesa contratos de SECOP relevantes para el barrio
 */
function processContratos(): ContratoFormat[] {
  console.log('\n📋 Procesando contratos SECOP...')
  
  const secopDir = path.join(RAW_DATA_DIR, 'secop')
  const relevantesPath = path.join(secopDir, 'secop_procesos_relevantes_barrio.json')
  const data = readJsonSafe<Record<string, unknown>[]>(relevantesPath)
  
  if (!data || data.length === 0) {
    console.log('  ⚠️  No hay contratos relevantes')
    return []
  }
  
  console.log(`  📊 ${data.length} contratos relevantes`)
  
  return data.slice(0, 50).map((item, index) => {
    const valor = item.valor_del_contrato || item.valor_total_adjudicacion
    const valorNum = typeof valor === 'string' 
      ? parseFloat(valor.replace(/[^0-9.-]/g, '')) 
      : (valor as number) || 0
    
    return {
      id: `contrato_${index + 1}`,
      titulo: String(item.nombre_del_procedimiento || 'Sin título'),
      descripcion: String(item.objeto_del_contrato || item.descripcion_del_procedimiento || ''),
      valor: valorNum,
      entidad: String(item.nombre_entidad || 'Alcaldía de Armenia'),
      fecha: String(item.fecha_de_publicacion || item.fecha_de_firma || ''),
      estado: String(item.estado_contrato || item.estado_del_procedimiento || 'En proceso'),
      relevancia_barrio: determinarRelevanciaBarrio(item),
    }
  })
}

/**
 * Determina cómo el contrato podría afectar al barrio
 */
function determinarRelevanciaBarrio(contrato: Record<string, unknown>): string {
  const texto = JSON.stringify(contrato).toLowerCase()
  
  if (texto.includes('san jose') || texto.includes('san josé')) {
    return 'Menciona directamente el barrio San José'
  }
  if (texto.includes('el bosque') || texto.includes('bosque')) {
    return 'Menciona el barrio El Bosque'
  }
  if (texto.includes('estadio')) {
    return 'Relacionado con el Estadio Centenario'
  }
  if (texto.includes('via') || texto.includes('vía') || texto.includes('paviment')) {
    return 'Obra de infraestructura vial'
  }
  if (texto.includes('colegio') || texto.includes('educac')) {
    return 'Proyecto educativo'
  }
  if (texto.includes('parque') || texto.includes('deporte')) {
    return 'Espacio recreativo o deportivo'
  }
  
  return 'Proyecto municipal general'
}

/**
 * Procesa propiedad horizontal
 */
function processPropiedadHorizontal(): Record<string, unknown>[] {
  console.log('\n🏢 Procesando propiedad horizontal...')
  
  const propiedadesDir = path.join(process.cwd(), 'data', 'raw', 'propiedades')
  const barrioPath = path.join(propiedadesDir, 'propiedad_horizontal_barrio.json')
  const data = readJsonSafe<Record<string, unknown>[]>(barrioPath)
  
  if (data && data.length > 0) {
    console.log(`  📊 ${data.length} propiedades horizontales en el barrio`)
    return data
  }
  
  return []
}

/**
 * Genera artículos para el knowledge base
 */
function generateKnowledgeBaseArticles(
  negocios: NegocioFormat[],
  contratos: ContratoFormat[],
  jacs: Record<string, unknown>[],
  propiedades: Record<string, unknown>[]
): Record<string, unknown>[] {
  const articles: Record<string, unknown>[] = []
  const now = new Date().toISOString()
  
  // Artículo sobre comercio local
  if (negocios.length > 0) {
    articles.push({
      id: 'art_comercio_datos_publicos',
      titulo: 'Comercio Local del Barrio - Datos Oficiales',
      contenido: `El barrio San José y El Bosque cuenta con ${negocios.length} establecimientos comerciales registrados oficialmente en la Cámara de Comercio de Armenia. Estos datos provienen de fuentes públicas (datos.gov.co) y representan el comercio formal del sector.`,
      categoria: 'economia',
      fecha_actualizacion: now,
      fuente: 'Cámara de Comercio Armenia - datos.gov.co',
    })
  }
  
  // Artículo sobre inversión pública
  if (contratos.length > 0) {
    const valorTotal = contratos.reduce((acc, c) => acc + c.valor, 0)
    articles.push({
      id: 'art_inversion_publica',
      titulo: 'Inversión Pública en el Sector',
      contenido: `Se han identificado ${contratos.length} contratos de obra pública relevantes para el barrio San José y El Bosque, con una inversión estimada de $${valorTotal.toLocaleString('es-CO')} COP. Estos contratos incluyen obras de infraestructura, educación, y servicios públicos que benefician directa o indirectamente al barrio.`,
      categoria: 'administracion',
      fecha_actualizacion: now,
      fuente: 'SECOP II - Colombia Compra Eficiente',
    })
  }
  
  // Artículo sobre JACs de Armenia
  if (jacs.length > 0) {
    articles.push({
      id: 'art_jacs_armenia',
      titulo: 'Juntas de Acción Comunal en Armenia',
      contenido: `En Armenia, Quindío, existen ${jacs.length} Juntas de Acción Comunal registradas oficialmente. Las JACs son organizaciones cívicas que representan a los habitantes de un barrio o vereda ante las autoridades y entidades públicas. La JAC del Barrio San José y El Bosque es una de las más activas de la ciudad.`,
      categoria: 'organizacion_comunal',
      fecha_actualizacion: now,
      fuente: 'Cámara de Comercio Armenia - Registro ESAL',
    })
  }
  
  // Artículo sobre conjuntos residenciales
  if (propiedades.length > 0) {
    articles.push({
      id: 'art_conjuntos_residenciales',
      titulo: 'Conjuntos y Edificios del Barrio',
      contenido: `El barrio cuenta con ${propiedades.length} propiedades horizontales registradas, incluyendo conjuntos residenciales y edificios. Esta información proviene del registro oficial de propiedad horizontal del municipio de Armenia.`,
      categoria: 'vivienda',
      fecha_actualizacion: now,
      fuente: 'Alcaldía de Armenia - datos.gov.co',
    })
  }
  
  return articles
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  console.log('🔄 INTEGRADOR DE DATOS AL KNOWLEDGE BASE')
  console.log('=========================================')
  console.log(`Fecha: ${new Date().toLocaleString('es-CO')}\n`)
  
  // 1. Procesar datos scraped
  const negocios = processEstablecimientos()
  const jacs = processEntidadesSinLucro()
  const contratos = processContratos()
  const propiedades = processPropiedadHorizontal()
  
  // 2. Guardar en inventario_barrio
  console.log('\n💾 Guardando en inventario del barrio...')
  
  if (negocios.length > 0) {
    // Cargar negocios existentes y combinar
    const existingPath = path.join(INVENTARIO_DIR, 'negocios.json')
    const existing = readJsonSafe<{ negocios: NegocioFormat[] }>(existingPath)
    
    const combined = {
      negocios: [
        ...(existing?.negocios || []),
        ...negocios.filter(n => 
          !(existing?.negocios || []).some(e => e.nombre === n.nombre)
        ),
      ],
      fuentes: [
        'Recopilación manual del barrio',
        'Cámara de Comercio Armenia - datos.gov.co',
      ],
      ultima_actualizacion: new Date().toISOString(),
    }
    
    saveJson(combined, path.join(INVENTARIO_DIR, 'negocios_completo.json'))
  }
  
  if (contratos.length > 0) {
    saveJson({
      contratos,
      resumen: {
        total: contratos.length,
        valor_total: contratos.reduce((a, c) => a + c.valor, 0),
      },
      ultima_actualizacion: new Date().toISOString(),
    }, path.join(INVENTARIO_DIR, 'contratos_publicos.json'))
  }
  
  // 3. Generar artículos para knowledge_base
  console.log('\n📚 Generando artículos para knowledge base...')
  const articles = generateKnowledgeBaseArticles(negocios, contratos, jacs, propiedades)
  
  if (articles.length > 0) {
    // Cargar artículos existentes y combinar
    const existingPath = path.join(KNOWLEDGE_BASE_DIR, 'historia_barrio.json')
    const existing = readJsonSafe<{ articulos: Record<string, unknown>[] }>(existingPath)
    
    const combined = {
      articulos: [
        ...(existing?.articulos || []),
        ...articles.filter(a =>
          !(existing?.articulos || []).some(e => e.id === a.id)
        ),
      ],
      fuentes: [
        'Historia oral del barrio',
        'datos.gov.co',
        'SECOP II',
        'Cámara de Comercio Armenia',
      ],
      ultima_actualizacion: new Date().toISOString(),
    }
    
    saveJson(combined, path.join(KNOWLEDGE_BASE_DIR, 'datos_publicos_barrio.json'))
  }
  
  // 4. Resumen final
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN DE INTEGRACIÓN')
  console.log('='.repeat(50))
  console.log(`Negocios procesados: ${negocios.length}`)
  console.log(`JACs encontradas: ${jacs.length}`)
  console.log(`Contratos relevantes: ${contratos.length}`)
  console.log(`Propiedades horizontales: ${propiedades.length}`)
  console.log(`Artículos generados: ${articles.length}`)
  console.log('')
  console.log('✅ Integración completada')
  console.log('')
  console.log('🔜 Próximo paso: npm run generate-embeddings')
}

main().catch(console.error)
