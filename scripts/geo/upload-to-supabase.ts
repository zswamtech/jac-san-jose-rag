/**
 * Script para cargar datos geográficos a Supabase
 * JAC Barrio San José y El Bosque
 * 
 * Carga:
 * - Negocios geocodificados
 * - Fishnet con estadísticas
 * - POIs verificados
 * - Límites de barrios
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const GEO_DIR = path.join(__dirname, '../../data/raw/geo')

interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: string
    coordinates: number[] | number[][] | number[][][]
  }
  properties: Record<string, any>
}

interface GeoJSON {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

// Convertir coordenadas GeoJSON a WKT para PostGIS
function pointToWKT(coords: number[]): string {
  return `POINT(${coords[0]} ${coords[1]})`
}

function polygonToWKT(coords: number[][][]): string {
  const ring = coords[0].map(c => `${c[0]} ${c[1]}`).join(', ')
  return `POLYGON((${ring}))`
}

async function cargarNegocios() {
  console.log('\n📍 CARGANDO NEGOCIOS GEOCODIFICADOS...')
  
  const filePath = path.join(GEO_DIR, 'negocios_geocoded.geojson')
  if (!fs.existsSync(filePath)) {
    console.log('   ⚠️ Archivo no encontrado:', filePath)
    return 0
  }
  
  const data: GeoJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  console.log(`   📂 Cargados ${data.features.length} negocios del archivo`)
  
  // Cargar fishnet para asignar celdas
  const fishnetPath = path.join(GEO_DIR, 'fishnet_con_negocios.geojson')
  let fishnetData: GeoJSON | null = null
  if (fs.existsSync(fishnetPath)) {
    fishnetData = JSON.parse(fs.readFileSync(fishnetPath, 'utf-8'))
    console.log(`   📂 Fishnet cargado: ${fishnetData!.features.length} celdas`)
  }
  
  // Preparar datos para inserción
  const negocios = data.features.map(f => {
    const coords = f.geometry.coordinates as number[]
    
    // Buscar celda del fishnet que contiene este punto
    let fishnetCellId = null
    if (fishnetData) {
      // Simplificado: usar propiedad asignada si existe
      fishnetCellId = f.properties.fishnet_cell_id || null
    }
    
    return {
      negocio_id: f.properties.id,
      nombre: f.properties.nombre,
      direccion: f.properties.direccion,
      categoria: f.properties.categoria || null,
      subcategoria: f.properties.subcategoria || null,
      telefono: f.properties.telefono || null,
      ubicacion: pointToWKT(coords),
      precision: f.properties.precision || 'centroide',
      metodo_geocoding: f.properties.metodo_geocoding || 'desconocido',
      fishnet_cell_id: fishnetCellId,
      geocoded_at: new Date().toISOString(),
    }
  })
  
  // Insertar en lotes de 100
  const batchSize = 100
  let insertados = 0
  let errores = 0
  
  for (let i = 0; i < negocios.length; i += batchSize) {
    const batch = negocios.slice(i, i + batchSize)
    
    const { data: inserted, error } = await supabase
      .from('negocios_geo')
      .upsert(batch, { onConflict: 'negocio_id' })
      .select()
    
    if (error) {
      console.log(`   ❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error.message)
      errores += batch.length
    } else {
      insertados += inserted?.length || batch.length
    }
  }
  
  console.log(`   ✅ Insertados: ${insertados}`)
  if (errores > 0) console.log(`   ⚠️ Errores: ${errores}`)
  
  return insertados
}

async function cargarFishnet() {
  console.log('\n🔲 CARGANDO FISHNET...')
  
  const filePath = path.join(GEO_DIR, 'fishnet_con_negocios.geojson')
  if (!fs.existsSync(filePath)) {
    console.log('   ⚠️ Archivo no encontrado:', filePath)
    return 0
  }
  
  const data: GeoJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  
  // Solo celdas con negocios o celdas de bordes para visualización
  const celdasRelevantes = data.features.filter(f => 
    (f.properties.negocios && f.properties.negocios.length > 0) ||
    f.properties.row % 5 === 0 || f.properties.col % 5 === 0
  )
  
  console.log(`   📂 Celdas a cargar: ${celdasRelevantes.length} (de ${data.features.length})`)
  
  const celdas = celdasRelevantes.map(f => {
    const coords = f.geometry.coordinates as number[][][]
    const centroid = f.properties.centroid as number[]
    
    return {
      cell_id: f.properties.cellId,
      row_num: f.properties.row,
      col_num: f.properties.col,
      geometry: polygonToWKT(coords),
      centroide: pointToWKT(centroid),
      area_m2: f.properties.areaM2 || 2500,
      num_negocios: f.properties.negocios?.length || 0,
      zona: f.properties.zona || 'mixta',
    }
  })
  
  const batchSize = 100
  let insertados = 0
  
  for (let i = 0; i < celdas.length; i += batchSize) {
    const batch = celdas.slice(i, i + batchSize)
    
    const { data: inserted, error } = await supabase
      .from('fishnet_cells')
      .upsert(batch, { onConflict: 'cell_id' })
      .select()
    
    if (error) {
      console.log(`   ❌ Error:`, error.message)
    } else {
      insertados += inserted?.length || batch.length
    }
  }
  
  console.log(`   ✅ Celdas insertadas: ${insertados}`)
  return insertados
}

async function cargarPOIs() {
  console.log('\n🏟️ CARGANDO POIs...')
  
  const pois = [
    { poi_id: 'estadio', nombre: 'Estadio San José', tipo: 'deportivo', icono: '🏟️', lat: 4.53172, lon: -75.67935 },
    { poi_id: 'plaza_toros', nombre: 'Plaza de Toros El Bosque', tipo: 'patrimonio', icono: '🐂', lat: 4.54025, lon: -75.67550 },
    { poi_id: 'parroquia', nombre: 'Parroquia San José Obrero', tipo: 'religioso', icono: '⛪', lat: 4.53050, lon: -75.68005 },
    { poi_id: 'fundanza', nombre: 'FUNDANZA', tipo: 'cultural', icono: '🎭', lat: 4.53580, lon: -75.67650 },
    { poi_id: 'rufino', nombre: 'Colegio Rufino J. Cuervo', tipo: 'educacion', icono: '🏫', lat: 4.53750, lon: -75.67700 },
    { poi_id: 'parque_bosque', nombre: 'Parque El Bosque', tipo: 'recreacion', icono: '🌲', lat: 4.5395, lon: -75.6760 },
  ]
  
  const poisData = pois.map(p => ({
    poi_id: p.poi_id,
    nombre: p.nombre,
    tipo: p.tipo,
    icono: p.icono,
    ubicacion: `POINT(${p.lon} ${p.lat})`,
    verificado: true,
    fuente: 'gemini_verification',
  }))
  
  const { data: inserted, error } = await supabase
    .from('pois')
    .upsert(poisData, { onConflict: 'poi_id' })
    .select()
  
  if (error) {
    console.log('   ❌ Error:', error.message)
    return 0
  }
  
  console.log(`   ✅ POIs insertados: ${inserted?.length || pois.length}`)
  return inserted?.length || pois.length
}

async function cargarBarrios() {
  console.log('\n🏘️ CARGANDO BARRIOS...')
  
  const barrios = [
    {
      nombre: 'San José',
      comuna: 'Comuna 6',
      descripcion: 'Barrio tradicional del suroriente de Armenia',
      centroide: { lat: 4.5317, lon: -75.6793 },
      limite: [
        [-75.6850, 4.5260],
        [-75.6750, 4.5260],
        [-75.6750, 4.5350],
        [-75.6850, 4.5350],
        [-75.6850, 4.5260],
      ],
      area_hectareas: 100,
    },
    {
      nombre: 'El Bosque',
      comuna: 'Comuna 5',
      descripcion: 'Barrio residencial con zonas verdes y el Parque de la Vida',
      centroide: { lat: 4.5402, lon: -75.6755 },
      limite: [
        [-75.6800, 4.5350],
        [-75.6700, 4.5350],
        [-75.6700, 4.5450],
        [-75.6800, 4.5450],
        [-75.6800, 4.5350],
      ],
      area_hectareas: 100,
    },
  ]
  
  const barriosData = barrios.map(b => {
    const ring = b.limite.map(c => `${c[0]} ${c[1]}`).join(', ')
    return {
      nombre: b.nombre,
      comuna: b.comuna,
      descripcion: b.descripcion,
      limite: `POLYGON((${ring}))`,
      centroide: `POINT(${b.centroide.lon} ${b.centroide.lat})`,
      area_hectareas: b.area_hectareas,
    }
  })
  
  const { data: inserted, error } = await supabase
    .from('barrios')
    .upsert(barriosData, { onConflict: 'nombre' })
    .select()
  
  if (error) {
    console.log('   ❌ Error:', error.message)
    return 0
  }
  
  console.log(`   ✅ Barrios insertados: ${inserted?.length || barrios.length}`)
  return inserted?.length || barrios.length
}

async function verificarFunciones() {
  console.log('\n🔍 VERIFICANDO FUNCIONES ESPACIALES...')
  
  // Probar búsqueda de negocios cercanos al estadio
  const { data, error } = await supabase
    .rpc('buscar_negocios_cercanos', {
      lat: 4.53172,
      lon: -75.67935,
      radio_metros: 200,
      limite: 5
    })
  
  if (error) {
    console.log('   ⚠️ Función buscar_negocios_cercanos no disponible:', error.message)
    console.log('   💡 Ejecuta primero la migración 006_create_negocios_geo.sql')
    return false
  }
  
  console.log(`   ✅ Función buscar_negocios_cercanos: ${data?.length || 0} resultados`)
  return true
}

async function main() {
  console.log('=' .repeat(60))
  console.log('📤 CARGA DE DATOS GEOGRÁFICOS A SUPABASE')
  console.log('   JAC Barrio San José y El Bosque')
  console.log('=' .repeat(60))
  
  try {
    // Verificar conexión
    const { data, error } = await supabase.from('negocios_geo').select('count').limit(1)
    if (error && error.code === '42P01') {
      console.log('\n❌ Tabla negocios_geo no existe.')
      console.log('   Ejecuta primero la migración:')
      console.log('   supabase db push')
      console.log('   o ejecuta manualmente: supabase/migrations/006_create_negocios_geo.sql')
      return
    }
    
    // Cargar datos
    const negocios = await cargarNegocios()
    const fishnet = await cargarFishnet()
    const pois = await cargarPOIs()
    const barrios = await cargarBarrios()
    
    // Verificar funciones
    await verificarFunciones()
    
    console.log('\n' + '=' .repeat(60))
    console.log('📊 RESUMEN DE CARGA')
    console.log('=' .repeat(60))
    console.log(`   📍 Negocios:     ${negocios}`)
    console.log(`   🔲 Celdas:       ${fishnet}`)
    console.log(`   🏟️ POIs:         ${pois}`)
    console.log(`   🏘️ Barrios:      ${barrios}`)
    console.log('\n✅ Carga completada!')
    
  } catch (err) {
    console.error('\n❌ Error:', err)
  }
}

main()
