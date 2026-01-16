/**
 * Filtrar establecimientos del Barrio San José y El Bosque
 * Ejecutar: npx tsx scripts/scrapers/filter-barrio.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data', 'raw', 'datos_publicos')

interface Establecimiento {
  matricula: string
  razon_social: string
  dir_comercial: string
  tel_com_1?: string
  email_comercial?: string
  actividad?: string
  fec_matricula?: string
  [key: string]: unknown
}

// Palabras clave para identificar el barrio
const BARRIO_KEYWORDS = [
  'san jose',
  'san josé',
  'el bosque',
  'b/ san jose',
  'brr san jose',
  'barrio san jose',
  'b/ bosque',
  'b/ el bosque',
  'brr el bosque',
  'barrio el bosque',
  // Direcciones específicas del barrio
  'avenida 19',
  'av 19',
  'estadio',
]

// Calles conocidas del barrio (requiere verificación adicional)
const CALLES_BARRIO = [
  'calle 20',
  'calle 21', 
  'calle 22',
  'calle 23',
  'carrera 19',
  'carrera 20',
  'carrera 21',
]

function matchesBarrio(establecimiento: Establecimiento): { matches: boolean; reason: string } {
  const direccion = (establecimiento.dir_comercial || '').toLowerCase()
  const razonSocial = (establecimiento.razon_social || '').toLowerCase()
  const texto = `${direccion} ${razonSocial}`
  
  // Buscar mención directa del barrio
  for (const keyword of BARRIO_KEYWORDS) {
    if (texto.includes(keyword)) {
      return { matches: true, reason: `Mención: "${keyword}"` }
    }
  }
  
  return { matches: false, reason: '' }
}

async function main() {
  console.log('🔍 FILTRO DE ESTABLECIMIENTOS DEL BARRIO')
  console.log('=========================================\n')
  
  const filePath = path.join(DATA_DIR, 'establecimientos_comercio_armenia.json')
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Establecimiento[]
  
  console.log(`📊 Total establecimientos en Armenia: ${data.length}`)
  
  // Filtrar por barrio
  const delBarrio: Array<Establecimiento & { match_reason: string }> = []
  
  for (const est of data) {
    const match = matchesBarrio(est)
    if (match.matches) {
      delBarrio.push({ ...est, match_reason: match.reason })
    }
  }
  
  console.log(`🏘️  Establecimientos del barrio: ${delBarrio.length}`)
  
  // Agrupar por tipo de actividad
  const porActividad: Record<string, number> = {}
  for (const est of delBarrio) {
    const actividad = est.actividad || 'Sin clasificar'
    porActividad[actividad] = (porActividad[actividad] || 0) + 1
  }
  
  console.log('\n📈 Por tipo de actividad:')
  const sorted = Object.entries(porActividad).sort((a, b) => b[1] - a[1]).slice(0, 15)
  for (const [actividad, count] of sorted) {
    console.log(`   ${count.toString().padStart(3)} - ${actividad.substring(0, 60)}`)
  }
  
  // Guardar filtrados
  const outputPath = path.join(DATA_DIR, 'establecimientos_barrio_san_jose.json')
  fs.writeFileSync(outputPath, JSON.stringify(delBarrio, null, 2), 'utf-8')
  console.log(`\n💾 Guardado: ${outputPath}`)
  
  // Crear resumen legible
  const resumen = delBarrio.map(e => ({
    nombre: e.razon_social,
    direccion: e.dir_comercial,
    telefono: e.tel_com_1 || 'N/A',
    actividad: e.actividad || 'N/A',
    email: e.email_comercial || 'N/A',
  }))
  
  const resumenPath = path.join(DATA_DIR, 'establecimientos_barrio_resumen.json')
  fs.writeFileSync(resumenPath, JSON.stringify(resumen, null, 2), 'utf-8')
  console.log(`💾 Resumen: ${resumenPath}`)
  
  // Top 20 negocios para mostrar
  console.log('\n🏪 Muestra de negocios del barrio:')
  for (const est of delBarrio.slice(0, 15)) {
    console.log(`   • ${est.razon_social}`)
    console.log(`     📍 ${est.dir_comercial}`)
  }
}

main().catch(console.error)
