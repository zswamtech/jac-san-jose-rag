/**
 * Script Maestro de Scraping de Datos Públicos
 * JAC Barrio San José y El Bosque - Armenia, Quindío
 * 
 * Ejecuta todos los scrapers en orden y genera un resumen unificado.
 * 
 * Ejecutar: npx tsx scripts/scrapers/run-all.ts
 * 
 * O ejecutar scrapers individuales:
 *   npx tsx scripts/scrapers/datos-abiertos.ts
 *   npx tsx scripts/scrapers/secop-contratos.ts
 *   npx tsx scripts/scrapers/propiedades-tradicion.ts
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface ScraperResult {
  name: string
  status: 'success' | 'error'
  duration: number
  error?: string
  files_created?: number
}

const SCRAPERS = [
  {
    name: 'Datos Abiertos Colombia',
    script: 'scripts/scrapers/datos-abiertos.ts',
    description: 'Comercios, propiedades, entidades sin lucro',
  },
  {
    name: 'SECOP - Contratación Pública',
    script: 'scripts/scrapers/secop-contratos.ts', 
    description: 'Contratos de obra pública del municipio',
  },
  {
    name: 'Propiedades y Tradición',
    script: 'scripts/scrapers/propiedades-tradicion.ts',
    description: 'Propiedad horizontal, guía de certificados',
  },
]

function runScraper(script: string): ScraperResult {
  const start = Date.now()
  const name = path.basename(script, '.ts')
  
  try {
    execSync(`npx tsx ${script}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    
    return {
      name,
      status: 'success',
      duration: Date.now() - start,
    }
  } catch (error) {
    return {
      name,
      status: 'error',
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function countFilesInDir(dir: string): number {
  if (!fs.existsSync(dir)) return 0
  
  let count = 0
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    if (item.isDirectory()) {
      count += countFilesInDir(path.join(dir, item.name))
    } else if (item.name.endsWith('.json')) {
      count++
    }
  }
  
  return count
}

function generateFinalReport(results: ScraperResult[]): void {
  const outputDir = path.join(process.cwd(), 'data', 'raw')
  
  // Contar archivos generados
  const datosPublicosFiles = countFilesInDir(path.join(outputDir, 'datos_publicos'))
  const propiedadesFiles = countFilesInDir(path.join(outputDir, 'propiedades'))
  
  const report = {
    fecha_ejecucion: new Date().toISOString(),
    resultados: results,
    resumen: {
      scrapers_ejecutados: results.length,
      exitosos: results.filter(r => r.status === 'success').length,
      fallidos: results.filter(r => r.status === 'error').length,
      tiempo_total_ms: results.reduce((acc, r) => acc + r.duration, 0),
      archivos_datos_publicos: datosPublicosFiles,
      archivos_propiedades: propiedadesFiles,
      total_archivos: datosPublicosFiles + propiedadesFiles,
    },
    ubicacion_archivos: {
      datos_publicos: 'data/raw/datos_publicos/',
      propiedades: 'data/raw/propiedades/',
      secop: 'data/raw/datos_publicos/secop/',
    },
    proximos_pasos: [
      'Ejecutar scripts/generate-embeddings.ts para indexar datos en Supabase',
      'Revisar archivos JSON y limpiar datos irrelevantes',
      'Complementar con información recopilada manualmente',
      'Para certificados de tradición, ver data/raw/propiedades/GUIA_CERTIFICADOS_TRADICION.md',
    ],
  }
  
  const reportPath = path.join(outputDir, '_REPORTE_SCRAPING.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 REPORTE FINAL DE SCRAPING')
  console.log('='.repeat(60))
  console.log(`Fecha: ${new Date().toLocaleString('es-CO')}`)
  console.log(`Scrapers ejecutados: ${results.length}`)
  console.log(`  ✅ Exitosos: ${report.resumen.exitosos}`)
  console.log(`  ❌ Fallidos: ${report.resumen.fallidos}`)
  console.log(`Tiempo total: ${(report.resumen.tiempo_total_ms / 1000).toFixed(1)}s`)
  console.log(`Archivos generados: ${report.resumen.total_archivos}`)
  console.log('')
  console.log(`📁 Reporte guardado en: ${reportPath}`)
}

async function main(): Promise<void> {
  console.log('🚀 EJECUCIÓN MASIVA DE SCRAPERS')
  console.log('================================')
  console.log('JAC Barrio San José y El Bosque - Armenia, Quindío')
  console.log(`Fecha: ${new Date().toLocaleString('es-CO')}\n`)
  
  const results: ScraperResult[] = []
  
  for (const scraper of SCRAPERS) {
    console.log('\n' + '─'.repeat(60))
    console.log(`🔄 Ejecutando: ${scraper.name}`)
    console.log(`   ${scraper.description}`)
    console.log('─'.repeat(60))
    
    const result = runScraper(scraper.script)
    results.push(result)
    
    if (result.status === 'error') {
      console.log(`\n⚠️  Error en ${scraper.name}: ${result.error}`)
    }
    
    // Pequeña pausa entre scrapers para no saturar APIs
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  generateFinalReport(results)
}

main().catch(console.error)
