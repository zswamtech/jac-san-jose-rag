/**
 * Geocodificación mejorada para negocios del barrio
 * Usa los datos verificados de Gemini + interpolación manual
 * 
 * Estrategias:
 * 1. Parseo de direcciones colombianas
 * 2. Interpolación basada en ejes viales conocidos
 * 3. Asignación a celdas del Fishnet
 */

import * as turf from '@turf/turf';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Directorios
const GEO_DIR = path.join(process.cwd(), 'data/raw/geo');
const NEGOCIOS_DIR = path.join(process.cwd(), 'data/raw/inventario_barrio');

// Puntos de referencia verificados (Gemini)
const PUNTOS_REFERENCIA: Record<string, { lat: number; lon: number; direccion?: string }> = {
  'estadio_san_jose': { lat: 4.53172, lon: -75.67935 },
  'plaza_toros': { lat: 4.54025, lon: -75.67550 },
  'parroquia_san_jose': { lat: 4.53050, lon: -75.68005 },
  'fundanza': { lat: 4.53580, lon: -75.67650, direccion: 'Calle 19 # 27-40' },
  'colegio_rufino': { lat: 4.53750, lon: -75.67700 },
  'parque_vida_centro': { lat: 4.5462, lon: -75.6705 },
};

// Ejes viales con coordenadas conocidas
const EJES_VIALES = {
  // Calles (Este-Oeste) - Latitud aumenta hacia el norte
  'calle_19': { lat: 4.5358, lon_start: -75.6850, lon_end: -75.6700 },
  'calle_21': { lat: 4.5450, lon_start: -75.6800, lon_end: -75.6700 },
  'calle_26': { lat: 4.5350, lon_start: -75.6850, lon_end: -75.6700 },
  'calle_30': { lat: 4.5260, lon_start: -75.6850, lon_end: -75.6700 },
  
  // Carreras (Norte-Sur) - Longitud disminuye hacia el oeste
  'carrera_19': { lon: -75.6700, lat_start: 4.5260, lat_end: 4.5480 },
  'carrera_23': { lon: -75.6800, lat_start: 4.5260, lat_end: 4.5450 },
  'carrera_27': { lon: -75.6765, lat_start: 4.5300, lat_end: 4.5400 },
};

// Patrones de direcciones colombianas (más permisivos)
const PATRONES_DIRECCION = [
  // CL 20 24-65 o CL 20 NO 24-65
  /^(CL|CALLE)\s*(\d+[A-Z]?)\s*(?:NO\.?\s*)?(\d+[A-Z]?)[-\s]?(\d+)?/i,
  // CR 23 NRO. 20-20
  /^(CR|CRA|CARRERA|KR|KRA)\s*\.?\s*(\d+[A-Z]?)\s*(?:NRO\.?|NO\.?|#)?\s*(\d+[A-Z]?)[-\s]?(\d+)?/i,
  // CARRERA 14 NRO. 14N-80
  /^(CARRERA|CALLE)\s*(\d+[A-Z]?)\s*(?:NRO\.?|NO\.?)?\s*(\d+[A-Z]?)[-\s]?(\d+)?/i,
  // CL 20 CON CR 25
  /^(CL|CALLE)\s*(\d+[A-Z]?)\s*(?:CON|X|Y)\s*(CR|CRA|CARRERA)\s*\.?\s*(\d+[A-Z]?)/i,
  // CR 23 CON CL 20
  /^(CR|CRA|CARRERA)\s*\.?\s*(\d+[A-Z]?)\s*(?:CON|X|Y)\s*(CL|CALLE)\s*(\d+[A-Z]?)/i,
];

interface DireccionParseada {
  via_principal: 'calle' | 'carrera';
  numero_principal: number;
  via_secundaria?: 'calle' | 'carrera';
  numero_secundario?: number;
  numero_placa?: number;
  raw: string;
}

/**
 * Parsea una dirección colombiana con múltiples patrones
 */
function parsearDireccion(direccion: string): DireccionParseada | null {
  if (!direccion) return null;
  
  const clean = direccion.trim().toUpperCase();
  
  for (const pattern of PATRONES_DIRECCION) {
    const match = clean.match(pattern);
    if (match) {
      const tipoVia = match[1];
      const esCalle = ['CL', 'CALLE'].includes(tipoVia);
      
      // Extraer números
      const numPrincipal = parseInt(match[2].replace(/[A-Z]/g, ''));
      const numSecundario = match[3] ? parseInt(match[3].replace(/[A-Z]/g, '')) : undefined;
      const numPlaca = match[4] ? parseInt(match[4]) : undefined;
      
      // Determinar tipo de vía secundaria si existe
      let viaSec: 'calle' | 'carrera' | undefined;
      if (match[3] && ['CL', 'CALLE', 'CR', 'CRA', 'CARRERA', 'KR', 'KRA'].includes(match[3])) {
        viaSec = ['CL', 'CALLE'].includes(match[3]) ? 'calle' : 'carrera';
      }
      
      return {
        via_principal: esCalle ? 'calle' : 'carrera',
        numero_principal: numPrincipal,
        via_secundaria: viaSec,
        numero_secundario: numSecundario,
        numero_placa: numPlaca,
        raw: clean
      };
    }
  }
  
  // Intento de último recurso: buscar números en la dirección
  const numeros = clean.match(/\d+/g);
  if (numeros && numeros.length >= 2) {
    const tieneCarrera = clean.includes('CR') || clean.includes('KR') || clean.includes('CARRERA');
    const tieneCalle = clean.includes('CL') || clean.includes('CALLE');
    
    return {
      via_principal: tieneCarrera ? 'carrera' : (tieneCalle ? 'calle' : 'calle'),
      numero_principal: parseInt(numeros[0]),
      numero_secundario: parseInt(numeros[1]),
      numero_placa: numeros[2] ? parseInt(numeros[2]) : undefined,
      raw: clean
    };
  }
  
  return null;
}

interface NegocioGeocoded {
  id: string;
  nombre: string;
  direccion_original: string;
  direccion_parseada?: DireccionParseada;
  coordenadas: {
    lat: number;
    lon: number;
    precision: 'exacta' | 'interpolada' | 'aproximada' | 'centroide_barrio';
    metodo: string;
  };
  telefono?: string;
  categoria?: string;
}

/**
 * Interpola coordenadas basándose en la dirección parseada
 */
function interpolarCoordenadas(
  direccionParseada: DireccionParseada | null
): { lat: number; lon: number; precision: 'interpolada' | 'aproximada' } | null {
  if (!direccionParseada) return null;
  
  const { via_principal, numero_principal, numero_secundario } = direccionParseada;
  
  // Validar que los números estén en rango del barrio
  if (numero_principal < 15 || numero_principal > 35) return null;
  
  if (via_principal === 'calle') {
    // Calles van de 19 (norte) a 30 (sur)
    // Latitud: 4.5450 (calle 19) a 4.5260 (calle 30)
    const t = Math.min(1, Math.max(0, (numero_principal - 19) / (30 - 19)));
    const lat = 4.5450 - t * (4.5450 - 4.5260);
    
    // Longitud basada en carrera (19 a 27)
    let lon = -75.6750; // default
    if (numero_secundario && numero_secundario >= 19 && numero_secundario <= 27) {
      const tLon = (numero_secundario - 19) / (27 - 19);
      lon = -75.6700 - tLon * (-75.6800 - (-75.6700));
    }
    
    return { lat, lon, precision: numero_secundario ? 'interpolada' : 'aproximada' };
  }
  
  if (via_principal === 'carrera') {
    // Carreras van de 19 (este) a 27 (oeste)
    // Longitud: -75.6700 (cra 19) a -75.6800 (cra 27)
    const t = Math.min(1, Math.max(0, (numero_principal - 19) / (27 - 19)));
    const lon = -75.6700 - t * 0.0100;
    
    // Latitud basada en calle (19 a 30)
    let lat = 4.5350; // default
    if (numero_secundario && numero_secundario >= 19 && numero_secundario <= 30) {
      const tLat = (numero_secundario - 19) / (30 - 19);
      lat = 4.5450 - tLat * (4.5450 - 4.5260);
    }
    
    return { lat, lon, precision: numero_secundario ? 'interpolada' : 'aproximada' };
  }
  
  return null;
}

/**
 * Geocodifica un negocio
 */
function geocodificarNegocio(negocio: any): NegocioGeocoded {
  const direccion = negocio.direccion || negocio.direccion_comercial || '';
  const direccionParseada = parsearDireccion(direccion);
  
  // Intentar interpolación
  const coordInterpoladas = interpolarCoordenadas(direccionParseada);
  
  if (coordInterpoladas) {
    return {
      id: negocio.id || `neg_${Math.random().toString(36).substr(2, 9)}`,
      nombre: negocio.nombre || negocio.razon_social || 'Sin nombre',
      direccion_original: direccion,
      direccion_parseada: direccionParseada || undefined,
      coordenadas: {
        lat: coordInterpoladas.lat,
        lon: coordInterpoladas.lon,
        precision: coordInterpoladas.precision,
        metodo: 'interpolacion_ejes_viales'
      },
      telefono: negocio.telefono,
      categoria: negocio.categoria || negocio.actividad_economica
    };
  }
  
  // Fallback: centroide del barrio con pequeña variación aleatoria
  const jitterLat = (Math.random() - 0.5) * 0.01; // ~500m variación
  const jitterLon = (Math.random() - 0.5) * 0.008;
  
  return {
    id: negocio.id || `neg_${Math.random().toString(36).substr(2, 9)}`,
    nombre: negocio.nombre || negocio.razon_social || 'Sin nombre',
    direccion_original: direccion,
    direccion_parseada: direccionParseada || undefined,
    coordenadas: {
      lat: 4.5360 + jitterLat,
      lon: -75.6775 + jitterLon,
      precision: 'centroide_barrio',
      metodo: 'fallback_centroide_jitter'
    },
    telefono: negocio.telefono,
    categoria: negocio.categoria || negocio.actividad_economica
  };
}

async function main() {
  console.log('\n📍 GEOCODIFICACIÓN MEJORADA - Negocios del Barrio\n');
  console.log('='.repeat(60));

  // Cargar negocios
  const negociosFile = path.join(NEGOCIOS_DIR, 'negocios_completo.json');
  
  if (!fs.existsSync(negociosFile)) {
    console.error('❌ No se encontró negocios_completo.json');
    process.exit(1);
  }

  const negociosData = JSON.parse(fs.readFileSync(negociosFile, 'utf-8'));
  const negocios = negociosData.negocios || negociosData;
  
  console.log(`📂 Cargados ${negocios.length} negocios`);
  console.log(`📍 Puntos de referencia verificados: ${Object.keys(PUNTOS_REFERENCIA).length}`);

  // Geocodificar
  console.log('\n🔄 Geocodificando negocios...');
  
  const resultados: NegocioGeocoded[] = [];
  const stats = {
    interpolados: 0,
    aproximados: 0,
    centroide: 0,
    total: 0
  };

  for (const negocio of negocios) {
    const geocoded = geocodificarNegocio(negocio);
    resultados.push(geocoded);
    
    stats.total++;
    if (geocoded.coordenadas.precision === 'interpolada') stats.interpolados++;
    else if (geocoded.coordenadas.precision === 'aproximada') stats.aproximados++;
    else stats.centroide++;
  }

  // Crear GeoJSON de negocios geocodificados
  const negociosGeoJSON = {
    type: 'FeatureCollection',
    name: 'Negocios Geocodificados - Barrio San José y El Bosque',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features: resultados.map(n => ({
      type: 'Feature',
      properties: {
        id: n.id,
        nombre: n.nombre,
        direccion: n.direccion_original,
        telefono: n.telefono,
        categoria: n.categoria,
        precision: n.coordenadas.precision,
        metodo_geocoding: n.coordenadas.metodo
      },
      geometry: {
        type: 'Point',
        coordinates: [n.coordenadas.lon, n.coordenadas.lat]
      }
    })),
    metadata: {
      fecha_geocoding: new Date().toISOString(),
      total_negocios: stats.total,
      precision_interpolada: stats.interpolados,
      precision_aproximada: stats.aproximados,
      precision_centroide: stats.centroide,
      metodo: 'Interpolación por ejes viales + puntos de referencia Gemini'
    }
  };

  // Guardar resultados
  const outputFile = path.join(GEO_DIR, 'negocios_geocoded.geojson');
  fs.writeFileSync(outputFile, JSON.stringify(negociosGeoJSON, null, 2));

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE GEOCODIFICACIÓN');
  console.log('='.repeat(60));
  console.log(`   📍 Total negocios: ${stats.total}`);
  console.log(`   ✅ Interpolación precisa: ${stats.interpolados} (${Math.round(stats.interpolados/stats.total*100)}%)`);
  console.log(`   🔶 Aproximación: ${stats.aproximados} (${Math.round(stats.aproximados/stats.total*100)}%)`);
  console.log(`   ⚠️  Centroide barrio: ${stats.centroide} (${Math.round(stats.centroide/stats.total*100)}%)`);
  console.log(`\n💾 Guardado: ${outputFile}`);

  // Mostrar ejemplos
  console.log('\n📝 Ejemplos de geocodificación:');
  resultados.slice(0, 5).forEach(n => {
    console.log(`   - ${n.nombre.substring(0, 30)}...`);
    console.log(`     Dir: ${n.direccion_original || 'N/A'}`);
    console.log(`     Coords: [${n.coordenadas.lat.toFixed(5)}, ${n.coordenadas.lon.toFixed(5)}] (${n.coordenadas.precision})`);
  });

  console.log('\n✅ Geocodificación completada!\n');
}

main().catch(console.error);
