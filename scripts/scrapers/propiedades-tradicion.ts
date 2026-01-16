/**
 * Scraper de Certificados de Tradición y Libertad
 * JAC Barrio San José y El Bosque - Armenia, Quindío
 * 
 * NOTA IMPORTANTE: Los certificados de tradición requieren:
 * 1. Número de matrícula inmobiliaria específico
 * 2. Pago de tarifa (~$20,000 COP por certificado)
 * 3. No hay API pública disponible
 * 
 * ESTRATEGIAS ALTERNATIVAS:
 * - Usar datos de propiedad horizontal de datos.gov.co
 * - Solicitud formal de información a la Oficina de Registro
 * - Convenio con la alcaldía (el padre del usuario tiene acceso)
 * 
 * Este script prepara la estructura y documenta las fuentes.
 * 
 * Ejecutar: npx tsx scripts/scrapers/propiedades-tradicion.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Información de la Oficina de Registro de Instrumentos Públicos
const ORIP_ARMENIA = {
  nombre: 'Oficina de Registro de Instrumentos Públicos de Armenia',
  direccion: 'Calle 21 # 14-32, Armenia, Quindío',
  telefono: '(606) 744-4444',
  web: 'https://www.supernotariado.gov.co/',
  
  // Servicios en línea (requieren registro)
  servicios_en_linea: {
    consulta_indices: 'https://radicacion.supernotariado.gov.co/app/certificado.web/pages/consulta/consultaIndice.jsf',
    certificado_libertad: 'https://certificados.supernotariado.gov.co/',
  },
  
  // Tarifas 2026
  tarifas: {
    certificado_tradicion: 18300, // COP
    certificado_tradicion_electronico: 16470, // COP - 10% descuento
  }
}

// Círculo registral del Quindío
const CIRCULO_REGISTRAL = {
  codigo: '630',
  departamento: 'Quindío',
  oficina: 'Armenia',
  municipios_jurisdiccion: [
    'Armenia',
    'Buenavista',
    'Calarcá',
    'Circasia',
    'Córdoba',
    'Filandia',
    'Génova',
    'La Tebaida',
    'Montenegro',
    'Pijao',
    'Quimbaya',
    'Salento',
  ]
}

// Formato de matrícula inmobiliaria Quindío: 630-XXXXXX
// Donde 630 es el código del círculo registral

interface PropiedadInfo {
  matricula_inmobiliaria?: string
  direccion?: string
  barrio?: string
  tipo_predio?: string
  area?: number
  propietario?: string
  fecha_registro?: string
  anotaciones?: string[]
}

/**
 * Estructura para almacenar propiedades del barrio
 * (Se poblará manualmente o mediante integración con alcaldía)
 */
const propiedadesBarrioTemplate: PropiedadInfo[] = [
  // Ejemplo de estructura
  {
    matricula_inmobiliaria: '630-XXXXXX', // Reemplazar con datos reales
    direccion: 'Calle XX # XX-XX',
    barrio: 'San José',
    tipo_predio: 'Residencial',
  }
]

/**
 * Genera guía para obtener certificados de tradición
 */
function generateGuide(): string {
  return `
# GUÍA PARA OBTENER CERTIFICADOS DE TRADICIÓN Y LIBERTAD
## Barrio San José y El Bosque - Armenia, Quindío

### 📋 Información Básica
- **Oficina**: ${ORIP_ARMENIA.nombre}
- **Dirección**: ${ORIP_ARMENIA.direccion}
- **Teléfono**: ${ORIP_ARMENIA.telefono}
- **Círculo Registral**: ${CIRCULO_REGISTRAL.codigo} (Armenia)

### 💰 Tarifas 2026
- Certificado físico: $${ORIP_ARMENIA.tarifas.certificado_tradicion.toLocaleString()} COP
- Certificado electrónico: $${ORIP_ARMENIA.tarifas.certificado_tradicion_electronico.toLocaleString()} COP

### 🌐 Proceso en Línea
1. Ingresar a: ${ORIP_ARMENIA.servicios_en_linea.certificado_libertad}
2. Registrarse con cédula y datos personales
3. Buscar por matrícula inmobiliaria (630-XXXXXX)
4. Pagar con PSE o tarjeta de crédito
5. Descargar certificado en PDF

### 📝 Requisitos para Consulta Masiva
Para obtener información de TODAS las propiedades del barrio:

**Opción A: Solicitud Formal (Derecho de Petición)**
- Dirigir solicitud al Superintendente de Notariado y Registro
- Especificar que es para fines comunitarios (JAC)
- Tiempo de respuesta: 15 días hábiles

**Opción B: Convenio con Alcaldía**
- El padre del usuario (empleado de la alcaldía) puede gestionar
- Catastro municipal tiene información de predios
- Secretaría de Planeación tiene uso del suelo

**Opción C: Datos Abiertos (Parcial)**
- Propiedad Horizontal: https://www.datos.gov.co/d/yt69-qmjq
- Solo incluye conjuntos y edificios, no predios individuales

### 📊 Datos Disponibles en Certificado
- Matrícula inmobiliaria
- Ubicación del predio
- Cabida y linderos
- Propietario(s) actual(es)
- Historial de transacciones
- Gravámenes (hipotecas)
- Limitaciones (embargos, demandas)
- Afectaciones a vivienda familiar

### 🔍 Estrategia Recomendada para la JAC

1. **Corto plazo**: 
   - Usar datos de propiedad horizontal de datos.gov.co
   - Recopilar direcciones del barrio manualmente
   
2. **Mediano plazo**:
   - Solicitar lista de predios a Catastro Municipal
   - El padre puede facilitar acceso por su cargo
   
3. **Largo plazo**:
   - Establecer convenio formal JAC - ORIP
   - Automatizar consultas con permisos oficiales

### 📁 Estructura de Datos Propuesta

Para cada propiedad recopilar:
- Matrícula inmobiliaria
- Dirección completa
- Tipo de predio (residencial, comercial, etc.)
- Área en metros cuadrados
- Nombre del propietario (opcional por privacidad)
- Estado del predio (libre, hipotecado, etc.)

---
*Documento generado automáticamente - ${new Date().toLocaleDateString('es-CO')}*
*JAC Barrio San José y El Bosque - Armenia, Quindío*
`
}

/**
 * Procesa datos de propiedad horizontal de datos.gov.co
 * y los prepara para complementar info de tradición
 */
async function fetchPropiedadHorizontal(): Promise<unknown[]> {
  const url = 'https://www.datos.gov.co/resource/yt69-qmjq.json?$limit=5000'
  
  console.log('📊 Descargando datos de Propiedad Horizontal...')
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()
    console.log(`  ✅ ${(data as unknown[]).length} registros obtenidos`)
    return data as unknown[]
  } catch (error) {
    console.error(`  ❌ Error: ${error}`)
    return []
  }
}

/**
 * Filtra propiedades que podrían estar en el barrio
 */
function filterByLocation(propiedades: Record<string, unknown>[]): Record<string, unknown>[] {
  const keywords = ['san jose', 'san josé', 'el bosque', 'estadio', 'calle 20', 'calle 21', 'calle 22', 'carrera 19', 'carrera 20']
  
  return propiedades.filter(p => {
    const texto = JSON.stringify(p).toLowerCase()
    return keywords.some(kw => texto.includes(kw))
  })
}

/**
 * Guarda datos y documentación
 */
function saveOutput(data: unknown, filename: string): void {
  const outputDir = path.join(process.cwd(), 'data', 'raw', 'propiedades')
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const filepath = path.join(outputDir, filename)
  
  if (typeof data === 'string') {
    fs.writeFileSync(filepath, data, 'utf-8')
  } else {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8')
  }
  
  console.log(`  💾 Guardado: ${filepath}`)
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  console.log('🏠 MÓDULO DE PROPIEDADES - CERTIFICADOS DE TRADICIÓN')
  console.log('====================================================')
  console.log(`Fecha: ${new Date().toISOString()}\n`)
  
  // 1. Generar guía de obtención de certificados
  console.log('\n📝 1. Generando guía de certificados...')
  const guia = generateGuide()
  saveOutput(guia, 'GUIA_CERTIFICADOS_TRADICION.md')
  
  // 2. Guardar información de referencia
  console.log('\n📋 2. Guardando información de referencia...')
  saveOutput({
    orip: ORIP_ARMENIA,
    circulo_registral: CIRCULO_REGISTRAL,
    formato_matricula: '630-XXXXXX',
    notas: [
      'El código 630 corresponde a Armenia',
      'Las matrículas son números secuenciales de 6 dígitos',
      'Se requiere pago para obtener certificados completos',
    ]
  }, 'info_registro_quindio.json')
  
  // 3. Descargar datos de propiedad horizontal
  console.log('\n📊 3. Descargando propiedad horizontal...')
  const propiedadHorizontal = await fetchPropiedadHorizontal() as Record<string, unknown>[]
  
  if (propiedadHorizontal.length > 0) {
    saveOutput(propiedadHorizontal, 'propiedad_horizontal_armenia.json')
    
    // Filtrar por ubicación del barrio
    const propiedadesBarrio = filterByLocation(propiedadHorizontal)
    if (propiedadesBarrio.length > 0) {
      saveOutput(propiedadesBarrio, 'propiedad_horizontal_barrio.json')
      console.log(`  🏘️  Propiedades en el barrio: ${propiedadesBarrio.length}`)
    }
    
    // Mostrar campos disponibles
    if (propiedadHorizontal[0]) {
      console.log(`  📋 Campos: ${Object.keys(propiedadHorizontal[0]).join(', ')}`)
    }
  }
  
  // 4. Crear plantilla para datos manuales
  console.log('\n📝 4. Creando plantilla para datos manuales...')
  saveOutput({
    instrucciones: 'Completar con datos reales del barrio',
    fecha_creacion: new Date().toISOString(),
    propiedades: propiedadesBarrioTemplate,
  }, 'propiedades_barrio_plantilla.json')
  
  console.log('\n✅ MÓDULO COMPLETADO')
  console.log('====================')
  console.log('Archivos guardados en: data/raw/propiedades/')
  console.log('')
  console.log('⚠️  NOTA: Los certificados de tradición completos requieren:')
  console.log('   - Número de matrícula inmobiliaria específico')
  console.log('   - Pago de ~$18,300 COP por certificado')
  console.log('   - Consultar la guía generada para opciones de acceso masivo')
}

main()
