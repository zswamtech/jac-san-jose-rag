/**
 * Generador de Fishnet (Malla) para análisis espacial
 * Usa Turf.js para crear una grilla sobre el polígono del barrio
 * 
 * Genera:
 * 1. Fishnet de celdas cuadradas (50m x 50m por defecto)
 * 2. Análisis de intersección con POIs
 * 3. Estadísticas por celda
 */

import * as turf from '@turf/turf';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Configuración
const GEO_DIR = path.join(process.cwd(), 'data/raw/geo');
const INPUT_FILE = path.join(GEO_DIR, 'barrio_san_jose_bosque_refined.geojson');
const OUTPUT_FISHNET = path.join(GEO_DIR, 'fishnet_barrio.geojson');
const OUTPUT_ANALYSIS = path.join(GEO_DIR, 'fishnet_analysis.json');

// Tamaño de celda en kilómetros (50 metros = 0.05 km)
const CELL_SIZE_KM = 0.05;

interface FishnetStats {
  totalCells: number;
  cellSizeMeters: number;
  areaPerCellM2: number;
  totalAreaHa: number;
  cellsWithPOIs: number;
  poiDistribution: Record<string, number>;
}

async function main() {
  console.log('\n🗺️  GENERADOR DE FISHNET - Barrio San José y El Bosque\n');
  console.log('='.repeat(60));

  // 1. Cargar GeoJSON refinado
  console.log('\n📂 Cargando datos geoespaciales...');
  
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ Error: No se encontró el archivo GeoJSON refinado');
    console.log('   Ejecuta primero: npm run geo:refine');
    process.exit(1);
  }

  const geoData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`   ✅ Cargadas ${geoData.features.length} features`);

  // 2. Obtener el polígono de la zona de estudio combinada
  const zonaEstudio = geoData.features.find(
    (f: any) => f.properties.id === 'zona_estudio_completa'
  );

  if (!zonaEstudio) {
    console.error('❌ Error: No se encontró la zona de estudio combinada');
    process.exit(1);
  }

  console.log(`   📍 Zona de estudio: ${zonaEstudio.properties.nombre}`);

  // 3. Calcular bounding box
  const bbox = turf.bbox(zonaEstudio);
  console.log(`   📐 Bounding Box: [${bbox.map(n => n.toFixed(4)).join(', ')}]`);

  // 4. Generar Fishnet (grilla de celdas cuadradas)
  console.log(`\n🔲 Generando Fishnet (celdas de ${CELL_SIZE_KM * 1000}m x ${CELL_SIZE_KM * 1000}m)...`);
  
  const fishnet = turf.squareGrid(bbox, CELL_SIZE_KM, { units: 'kilometers' });
  console.log(`   ✅ Generadas ${fishnet.features.length} celdas iniciales`);

  // 5. Filtrar celdas que intersectan con la zona de estudio
  console.log('\n✂️  Recortando celdas a la zona de estudio...');
  
  const clippedCells: any[] = [];
  let cellId = 1;

  for (const cell of fishnet.features) {
    const intersection = turf.intersect(
      turf.featureCollection([cell, zonaEstudio])
    );
    
    if (intersection) {
      // Agregar propiedades a cada celda
      clippedCells.push({
        ...cell,
        properties: {
          cellId: `CELL_${String(cellId).padStart(4, '0')}`,
          row: Math.floor((cellId - 1) / Math.ceil(Math.sqrt(fishnet.features.length))),
          col: (cellId - 1) % Math.ceil(Math.sqrt(fishnet.features.length)),
          areaM2: Math.round(turf.area(cell)),
          centroid: turf.centroid(cell).geometry.coordinates,
          pois: [],
          poiCount: 0
        }
      });
      cellId++;
    }
  }

  console.log(`   ✅ ${clippedCells.length} celdas dentro de la zona de estudio`);

  // 6. Obtener POIs del GeoJSON
  const pois = geoData.features.filter(
    (f: any) => f.geometry.type === 'Point'
  );
  console.log(`\n📍 Analizando ${pois.length} POIs...`);

  // 7. Asignar POIs a celdas
  const poiDistribution: Record<string, number> = {};
  let cellsWithPOIs = 0;

  for (const cell of clippedCells) {
    const poisInCell: string[] = [];
    
    for (const poi of pois) {
      const point = turf.point(poi.geometry.coordinates);
      if (turf.booleanPointInPolygon(point, cell)) {
        poisInCell.push(poi.properties.nombre);
        const tipo = poi.properties.tipo || 'otro';
        poiDistribution[tipo] = (poiDistribution[tipo] || 0) + 1;
      }
    }
    
    cell.properties.pois = poisInCell;
    cell.properties.poiCount = poisInCell.length;
    if (poisInCell.length > 0) cellsWithPOIs++;
  }

  console.log(`   ✅ ${cellsWithPOIs} celdas contienen POIs`);

  // 8. Crear Feature Collection del Fishnet
  const fishnetGeoJSON = {
    type: 'FeatureCollection',
    name: 'Fishnet - Barrio San José y El Bosque',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features: clippedCells,
    metadata: {
      fecha_generacion: new Date().toISOString(),
      zona_estudio: 'Barrio San José y El Bosque - Armenia, Quindío',
      cell_size_m: CELL_SIZE_KM * 1000,
      total_cells: clippedCells.length,
      cells_with_pois: cellsWithPOIs,
      herramienta: 'Turf.js squareGrid',
      crs: 'WGS84 (EPSG:4326)'
    }
  };

  // 9. Calcular estadísticas
  const stats: FishnetStats = {
    totalCells: clippedCells.length,
    cellSizeMeters: CELL_SIZE_KM * 1000,
    areaPerCellM2: Math.round((CELL_SIZE_KM * 1000) ** 2),
    totalAreaHa: Math.round(clippedCells.length * (CELL_SIZE_KM * 1000) ** 2 / 10000 * 100) / 100,
    cellsWithPOIs,
    poiDistribution
  };

  // 10. Agregar análisis adicional por zona
  const analysisResults = {
    fishnet_stats: stats,
    zona_estudio: {
      nombre: zonaEstudio.properties.nombre,
      bbox: bbox,
      area_calculada_ha: Math.round(turf.area(zonaEstudio) / 10000 * 100) / 100
    },
    pois_analizados: pois.map((p: any) => ({
      id: p.properties.id,
      nombre: p.properties.nombre,
      tipo: p.properties.tipo,
      coordenadas: p.geometry.coordinates
    })),
    celdas_destacadas: clippedCells
      .filter(c => c.properties.poiCount > 0)
      .map(c => ({
        cellId: c.properties.cellId,
        centroid: c.properties.centroid,
        pois: c.properties.pois
      })),
    fecha_analisis: new Date().toISOString()
  };

  // 11. Guardar archivos
  console.log('\n💾 Guardando resultados...');
  
  fs.writeFileSync(OUTPUT_FISHNET, JSON.stringify(fishnetGeoJSON, null, 2));
  console.log(`   ✅ Fishnet: ${OUTPUT_FISHNET}`);
  
  fs.writeFileSync(OUTPUT_ANALYSIS, JSON.stringify(analysisResults, null, 2));
  console.log(`   ✅ Análisis: ${OUTPUT_ANALYSIS}`);

  // 12. Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DEL FISHNET');
  console.log('='.repeat(60));
  console.log(`   🔲 Total de celdas: ${stats.totalCells}`);
  console.log(`   📏 Tamaño de celda: ${stats.cellSizeMeters}m x ${stats.cellSizeMeters}m`);
  console.log(`   📐 Área por celda: ${stats.areaPerCellM2} m²`);
  console.log(`   🗺️  Área total cubierta: ${stats.totalAreaHa} ha`);
  console.log(`   📍 Celdas con POIs: ${stats.cellsWithPOIs}`);
  
  console.log('\n   📊 Distribución de POIs por tipo:');
  Object.entries(stats.poiDistribution).forEach(([tipo, count]) => {
    console.log(`      - ${tipo}: ${count}`);
  });

  console.log('\n✅ Fishnet generado exitosamente!');
  console.log('\n📌 Próximos pasos:');
  console.log('   1. Abrir fishnet_barrio.geojson en QGIS/ArcGIS');
  console.log('   2. Superponer con capas del POT');
  console.log('   3. Agregar datos de campo a cada celda');
  console.log('   4. Exportar para integración con el RAG\n');
}

main().catch(console.error);
