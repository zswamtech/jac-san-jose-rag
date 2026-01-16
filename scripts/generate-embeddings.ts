/**
 * Script de Generación de Embeddings
 * JAC Barrio San José y El Bosque - Armenia, Quindío
 *
 * Ejecutar: npm run generate-embeddings
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'
import { config } from 'dotenv'

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' })

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiApiKey = process.env.OPENAI_API_KEY!

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('Error: Faltan variables de entorno')
  console.error('Requeridas: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiApiKey })

const DATA_DIR = path.join(process.cwd(), 'data', 'raw')

// Tipos
interface EmbeddingRecord {
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  source: string
  category: string
  subcategory?: string
}

// Función para obtener embedding
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Limitar longitud
  })
  return response.data[0].embedding
}

// Función para limpiar texto
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
}

// Procesar negocios
async function processNegocios() {
  console.log('\n📦 Procesando negocios del barrio...')
  const filePath = path.join(DATA_DIR, 'inventario_barrio', 'negocios.json')

  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ Archivo negocios.json no encontrado')
    return 0
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const negocios = JSON.parse(content)
  let count = 0

  for (const negocio of negocios) {
    const textToEmbed = `
      Negocio: ${negocio.nombre}.
      Tipo: ${negocio.tipo}.
      Categoría: ${negocio.categoria || 'comercio'}.
      Descripción: ${negocio.descripcion || ''}.
      Dirección: ${negocio.direccion}.
      Teléfono: ${negocio.telefono || 'No disponible'}.
      Horario: ${negocio.horario || 'Consultar'}.
      Días: ${negocio.dias || 'Consultar'}.
      ${negocio.productos ? `Productos/Servicios: ${negocio.productos.join(', ')}.` : ''}
      ${negocio.historia ? `Historia: ${negocio.historia}` : ''}
    `

    try {
      const embedding = await getEmbedding(cleanText(textToEmbed))

      const record: EmbeddingRecord = {
        content: cleanText(textToEmbed),
        embedding,
        metadata: {
          nombre: negocio.nombre,
          tipo: negocio.tipo,
          direccion: negocio.direccion,
          telefono: negocio.telefono,
          horario: negocio.horario,
        },
        source: 'inventario_barrio',
        category: 'negocio',
        subcategory: negocio.tipo,
      }

      const { error } = await supabase.from('document_embeddings').insert(record)

      if (error) {
        console.error(`  ❌ Error insertando ${negocio.nombre}:`, error.message)
      } else {
        count++
        console.log(`  ✅ ${negocio.nombre}`)
      }
    } catch (err) {
      console.error(`  ❌ Error procesando ${negocio.nombre}:`, err)
    }
  }

  return count
}

// Procesar colegios
async function processColegios() {
  console.log('\n🎓 Procesando colegios...')
  const filePath = path.join(DATA_DIR, 'inventario_barrio', 'colegios.json')

  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ Archivo colegios.json no encontrado')
    return 0
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const colegios = JSON.parse(content)
  let count = 0

  for (const colegio of colegios) {
    const textToEmbed = `
      Institución educativa: ${colegio.nombre}.
      Tipo: ${colegio.tipo === 'colegio_publico' ? 'Colegio Público' : 'Colegio Privado'}.
      Nivel: ${colegio.nivel || 'Preescolar, Primaria y Secundaria'}.
      Descripción: ${colegio.descripcion || ''}.
      Dirección: ${colegio.direccion}.
      Jornadas: ${colegio.jornadas?.join(', ') || 'Consultar'}.
      ${colegio.servicios?.length ? `Servicios: ${colegio.servicios.join(', ')}.` : ''}
      ${colegio.historia ? `Historia: ${colegio.historia}` : ''}
    `

    try {
      const embedding = await getEmbedding(cleanText(textToEmbed))

      const record: EmbeddingRecord = {
        content: cleanText(textToEmbed),
        embedding,
        metadata: {
          nombre: colegio.nombre,
          tipo: colegio.tipo,
          direccion: colegio.direccion,
        },
        source: 'inventario_barrio',
        category: 'colegio',
        subcategory: colegio.tipo,
      }

      const { error } = await supabase.from('document_embeddings').insert(record)

      if (error) {
        console.error(`  ❌ Error insertando ${colegio.nombre}:`, error.message)
      } else {
        count++
        console.log(`  ✅ ${colegio.nombre}`)
      }
    } catch (err) {
      console.error(`  ❌ Error procesando ${colegio.nombre}:`, err)
    }
  }

  return count
}

// Procesar infraestructura
async function processInfraestructura() {
  console.log('\n🏛️ Procesando infraestructura...')
  const filePath = path.join(DATA_DIR, 'inventario_barrio', 'infraestructura.json')

  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ Archivo infraestructura.json no encontrado')
    return 0
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const items = JSON.parse(content)
  let count = 0

  for (const item of items) {
    const textToEmbed = `
      Lugar: ${item.nombre}.
      Tipo: ${item.tipo}.
      Categoría: ${item.categoria}.
      Descripción: ${item.descripcion || ''}.
      Dirección: ${item.direccion}.
      Estado: ${item.estado || 'Activo'}.
      ${item.historia ? `Historia: ${item.historia}` : ''}
      ${item.importancia_historica ? `Importancia histórica: ${item.importancia_historica}` : ''}
    `

    try {
      const embedding = await getEmbedding(cleanText(textToEmbed))

      const record: EmbeddingRecord = {
        content: cleanText(textToEmbed),
        embedding,
        metadata: {
          nombre: item.nombre,
          tipo: item.tipo,
          direccion: item.direccion,
          historia: item.historia,
        },
        source: 'inventario_barrio',
        category: 'infraestructura',
        subcategory: item.tipo,
      }

      const { error } = await supabase.from('document_embeddings').insert(record)

      if (error) {
        console.error(`  ❌ Error insertando ${item.nombre}:`, error.message)
      } else {
        count++
        console.log(`  ✅ ${item.nombre}`)
      }
    } catch (err) {
      console.error(`  ❌ Error procesando ${item.nombre}:`, err)
    }
  }

  return count
}

// Procesar trámites JAC
async function processTramites() {
  console.log('\n📋 Procesando trámites JAC...')
  const filePath = path.join(DATA_DIR, 'knowledge_base', 'tramites_jac.json')

  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ Archivo tramites_jac.json no encontrado')
    return 0
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const tramites = JSON.parse(content)
  let count = 0

  for (const tramite of tramites) {
    const textToEmbed = `
      Trámite: ${tramite.title}.
      Categoría: ${tramite.category}.
      Descripción: ${tramite.content}.
      Requisitos: ${tramite.requisitos?.join('. ') || 'Consultar en la JAC'}.
      Documentos requeridos: ${tramite.documentos_requeridos?.join(', ') || 'Consultar'}.
      Pasos: ${tramite.pasos?.join(' ') || 'Consultar en la oficina'}.
      Costo: ${tramite.costo === 0 ? 'Gratuito' : `$${tramite.costo}`}.
      Tiempo de respuesta: ${tramite.tiempo_respuesta || 'Variable'}.
      Dónde realizar: ${tramite.donde || 'Oficina de la JAC'}.
      Horario: ${tramite.horario || 'Lunes a Viernes, 8AM-12PM'}.
    `

    try {
      const embedding = await getEmbedding(cleanText(textToEmbed))

      const record: EmbeddingRecord = {
        content: cleanText(textToEmbed),
        embedding,
        metadata: {
          titulo: tramite.title,
          requisitos: tramite.requisitos,
          pasos: tramite.pasos,
          costo: tramite.costo,
          tiempo_respuesta: tramite.tiempo_respuesta,
        },
        source: 'knowledge_base',
        category: 'tramite',
        subcategory: tramite.category,
      }

      const { error } = await supabase.from('document_embeddings').insert(record)

      if (error) {
        console.error(`  ❌ Error insertando ${tramite.title}:`, error.message)
      } else {
        count++
        console.log(`  ✅ ${tramite.title}`)
      }
    } catch (err) {
      console.error(`  ❌ Error procesando ${tramite.title}:`, err)
    }
  }

  return count
}

// Procesar historia del barrio
async function processHistoria() {
  console.log('\n📜 Procesando historia del barrio...')
  const filePath = path.join(DATA_DIR, 'knowledge_base', 'historia_barrio.json')

  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ Archivo historia_barrio.json no encontrado')
    return 0
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const items = JSON.parse(content)
  let count = 0

  for (const item of items) {
    const textToEmbed = `
      ${item.title}.
      ${item.content}
    `

    try {
      const embedding = await getEmbedding(cleanText(textToEmbed))

      const record: EmbeddingRecord = {
        content: cleanText(textToEmbed),
        embedding,
        metadata: {
          titulo: item.title,
        },
        source: 'knowledge_base',
        category: 'historia',
        subcategory: item.category,
      }

      const { error } = await supabase.from('document_embeddings').insert(record)

      if (error) {
        console.error(`  ❌ Error insertando ${item.title}:`, error.message)
      } else {
        count++
        console.log(`  ✅ ${item.title}`)
      }
    } catch (err) {
      console.error(`  ❌ Error procesando ${item.title}:`, err)
    }
  }

  return count
}

// Procesar industria
async function processIndustria() {
  console.log('\n🏭 Procesando industria...')
  const filePath = path.join(DATA_DIR, 'inventario_barrio', 'industria.json')

  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ Archivo industria.json no encontrado')
    return 0
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const items = JSON.parse(content)
  let count = 0

  for (const item of items) {
    const textToEmbed = `
      Industria: ${item.nombre}.
      Tipo: ${item.tipo}.
      Sector: ${item.sector}.
      Descripción: ${item.descripcion || ''}.
      Dirección: ${item.direccion}.
      Productos: ${item.productos?.join(', ') || ''}.
      ${item.historia ? `Historia: ${item.historia}` : ''}
    `

    try {
      const embedding = await getEmbedding(cleanText(textToEmbed))

      const record: EmbeddingRecord = {
        content: cleanText(textToEmbed),
        embedding,
        metadata: {
          nombre: item.nombre,
          tipo: item.tipo,
          sector: item.sector,
        },
        source: 'inventario_barrio',
        category: 'industria',
        subcategory: item.sector,
      }

      const { error } = await supabase.from('document_embeddings').insert(record)

      if (error) {
        console.error(`  ❌ Error insertando ${item.nombre}:`, error.message)
      } else {
        count++
        console.log(`  ✅ ${item.nombre}`)
      }
    } catch (err) {
      console.error(`  ❌ Error procesando ${item.nombre}:`, err)
    }
  }

  return count
}

// Función principal
async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  GENERACIÓN DE EMBEDDINGS - JAC SAN JOSÉ Y EL BOSQUE')
  console.log('═══════════════════════════════════════════════════════════')

  // Limpiar tabla existente (opcional)
  console.log('\n🗑️ Limpiando embeddings existentes...')
  const { error: deleteError } = await supabase.from('document_embeddings').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('  ⚠️ Error limpiando:', deleteError.message)
  } else {
    console.log('  ✅ Tabla limpiada')
  }

  // Procesar todas las fuentes
  const results = {
    negocios: await processNegocios(),
    colegios: await processColegios(),
    infraestructura: await processInfraestructura(),
    industria: await processIndustria(),
    tramites: await processTramites(),
    historia: await processHistoria(),
  }

  // Resumen
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  RESUMEN DE INGESTA')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  📦 Negocios:       ${results.negocios}`)
  console.log(`  🎓 Colegios:       ${results.colegios}`)
  console.log(`  🏛️ Infraestructura: ${results.infraestructura}`)
  console.log(`  🏭 Industria:      ${results.industria}`)
  console.log(`  📋 Trámites:       ${results.tramites}`)
  console.log(`  📜 Historia:       ${results.historia}`)
  console.log('───────────────────────────────────────────────────────────')
  const total = Object.values(results).reduce((a, b) => a + b, 0)
  console.log(`  📊 TOTAL:          ${total} documentos`)
  console.log('═══════════════════════════════════════════════════════════')
  console.log('\n✅ Proceso completado!')
}

main().catch(console.error)
