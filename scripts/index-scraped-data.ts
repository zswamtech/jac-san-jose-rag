/**
 * Indexar Negocios Scraped al RAG
 * JAC Barrio San José y El Bosque - Armenia, Quindío
 * 
 * Indexa los 310 negocios obtenidos de datos.gov.co
 * 
 * Ejecutar: npm run index:negocios
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Cargar variables de entorno
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiApiKey = process.env.OPENAI_API_KEY!

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const openai = new OpenAI({ apiKey: openaiApiKey })

interface NegocioScraped {
  id: string
  nombre: string
  tipo: string
  categoria: string
  direccion: string
  telefono?: string
  email?: string
  descripcion: string
  barrio: string
  fuente: string
}

// Rate limiting
const BATCH_SIZE = 10
const DELAY_BETWEEN_BATCHES = 1000 // 1 segundo

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return response.data[0].embedding
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
}

function formatNegocioForEmbedding(negocio: NegocioScraped): string {
  const parts = [
    `Negocio: ${negocio.nombre}`,
    `Tipo de actividad: ${negocio.tipo}`,
    `Ubicación: ${negocio.direccion}`,
    `Barrio: ${negocio.barrio}`,
  ]
  
  if (negocio.telefono) {
    parts.push(`Teléfono: ${negocio.telefono}`)
  }
  if (negocio.email) {
    parts.push(`Email: ${negocio.email}`)
  }
  
  parts.push(`Este es un establecimiento comercial registrado oficialmente en Armenia, Quindío, Colombia.`)
  
  return cleanText(parts.join('. '))
}

async function indexNegocios(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  INDEXACIÓN DE NEGOCIOS SCRAPED')
  console.log('  JAC Barrio San José y El Bosque')
  console.log('═══════════════════════════════════════════════════════════\n')
  
  // Leer negocios scraped
  const filePath = path.join(process.cwd(), 'data', 'raw', 'inventario_barrio', 'negocios_completo.json')
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Archivo negocios_completo.json no encontrado')
    console.error('   Ejecuta primero: npm run scrape:integrate')
    process.exit(1)
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const negocios: NegocioScraped[] = data.negocios || []
  
  console.log(`📦 Negocios a indexar: ${negocios.length}`)
  console.log(`⏱️  Tiempo estimado: ~${Math.ceil(negocios.length / BATCH_SIZE * 2)} minutos\n`)
  
  let indexed = 0
  let errors = 0
  
  // Procesar en batches
  for (let i = 0; i < negocios.length; i += BATCH_SIZE) {
    const batch = negocios.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(negocios.length / BATCH_SIZE)
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} negocios)`)
    
    for (const negocio of batch) {
      try {
        const textToEmbed = formatNegocioForEmbedding(negocio)
        const embedding = await getEmbedding(textToEmbed)
        
        const { error } = await supabase.from('document_embeddings').insert({
          content: textToEmbed,
          embedding,
          source: 'datos_publicos',
          category: 'negocio',
          subcategory: negocio.tipo,
          metadata: {
            id: negocio.id,
            nombre: negocio.nombre,
            tipo: negocio.tipo,
            direccion: negocio.direccion,
            telefono: negocio.telefono,
            email: negocio.email,
            barrio: negocio.barrio,
            fuente: negocio.fuente,
          },
        })
        
        if (error) {
          console.error(`  ❌ ${negocio.nombre}: ${error.message}`)
          errors++
        } else {
          console.log(`  ✅ ${negocio.nombre.substring(0, 50)}...`)
          indexed++
        }
        
      } catch (err) {
        console.error(`  ❌ ${negocio.nombre}: ${err}`)
        errors++
      }
    }
    
    // Progreso
    const progress = Math.round(((i + batch.length) / negocios.length) * 100)
    console.log(`   📊 Progreso: ${progress}% (${indexed} indexados, ${errors} errores)`)
    
    // Rate limiting
    if (i + BATCH_SIZE < negocios.length) {
      await sleep(DELAY_BETWEEN_BATCHES)
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  RESUMEN DE INDEXACIÓN')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  ✅ Indexados: ${indexed}`)
  console.log(`  ❌ Errores:   ${errors}`)
  console.log(`  📊 Total:     ${negocios.length}`)
  console.log('═══════════════════════════════════════════════════════════\n')
  
  if (errors === 0) {
    console.log('🎉 ¡Indexación completada exitosamente!')
  } else {
    console.log('⚠️  Indexación completada con algunos errores')
  }
}

// También indexar propiedades horizontales
async function indexPropiedades(): Promise<void> {
  console.log('\n🏢 Indexando propiedades horizontales del barrio...')
  
  const filePath = path.join(process.cwd(), 'data', 'raw', 'propiedades', 'propiedad_horizontal_barrio.json')
  
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️  Archivo propiedad_horizontal_barrio.json no encontrado')
    return
  }
  
  const propiedades = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Array<{
    no_exp: string
    propiedad_horizontal: string
    direcci_n: string
  }>
  
  console.log(`  📦 Propiedades a indexar: ${propiedades.length}`)
  
  let indexed = 0
  
  for (const prop of propiedades) {
    try {
      const textToEmbed = cleanText(`
        Propiedad Horizontal: ${prop.propiedad_horizontal}.
        Dirección: ${prop.direcci_n}.
        Número de expediente: ${prop.no_exp}.
        Este es un conjunto residencial o edificio registrado oficialmente en Armenia, Quindío.
        Barrio San José y El Bosque.
      `)
      
      const embedding = await getEmbedding(textToEmbed)
      
      const { error } = await supabase.from('document_embeddings').insert({
        content: textToEmbed,
        embedding,
        source: 'datos_publicos',
        category: 'propiedad_horizontal',
        metadata: {
          nombre: prop.propiedad_horizontal,
          direccion: prop.direcci_n,
          expediente: prop.no_exp,
        },
      })
      
      if (!error) {
        indexed++
      }
      
    } catch (err) {
      // Continuar silenciosamente
    }
    
    // Rate limiting suave
    if (indexed % 10 === 0) {
      await sleep(500)
    }
  }
  
  console.log(`  ✅ Propiedades indexadas: ${indexed}`)
}

async function main(): Promise<void> {
  try {
    await indexNegocios()
    await indexPropiedades()
    
    // Verificar total de embeddings
    const { count } = await supabase
      .from('document_embeddings')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n📊 Total de embeddings en la base de datos: ${count}`)
    
  } catch (error) {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  }
}

main()
