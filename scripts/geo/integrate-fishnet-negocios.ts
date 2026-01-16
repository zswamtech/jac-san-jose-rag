/**
 * Integrar negocios geocodificados al Fishnet
 * Asigna cada negocio a una celda específica del fishnet
 */

import * as turf from '@turf/turf';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const GEO_DIR = path.join(process.cwd(), 'data/raw/geo');

async function main() {
  console.log('\n🔗 INTEGRACIÓN NEGOCIOS → FISHNET\n');
  console.log('='.repeat(60));

  // 1. Cargar datos
  console.log('\n📂 Cargando datos...');
  
  const fishnetPath = path.join(GEO_DIR, 'fishnet_barrio.geojson');
  const negociosPath = path.join(GEO_DIR, 'negocios_geocoded.geojson');
  
  const fishnet = JSON.parse(fs.readFileSync(fishnetPath, 'utf-8'));
  const negocios = JSON.parse(fs.readFileSync(negociosPath, 'utf-8'));
  
  console.log(`   ✅ Fishnet: ${fishnet.features.length} celdas`);
  console.log(`   ✅ Negocios: ${negocios.features.length} puntos`);

  // 2. Crear índice espacial para las celdas
  console.log('\n🔄 Asignando negocios a celdas...');
  
  // Mapa de celda -> negocios
  const cellNegocios: Map<string, any[]> = new Map();
  let asignados = 0;
  let noAsignados = 0;

  for (const negocio of negocios.features) {
    const point = turf.point(negocio.geometry.coordinates);
    let asignado = false;
    
    for (const cell of fishnet.features) {
      if (turf.booleanPointInPolygon(point, cell)) {
        const cellId = cell.properties.cellId;
        
        if (!cellNegocios.has(cellId)) {
          cellNegocios.set(cellId, []);
        }
        
        cellNegocios.get(cellId)!.push({
          id: negocio.properties.id,
          nombre: negocio.properties.nombre,
          direccion: negocio.properties.direccion,
          categoria: negocio.properties.categoria,
          precision: negocio.properties.precision,
          coordinates: negocio.geometry.coordinates
        });
        
        asignado = true;
        asignados++;
        break;
      }
    }
    
    if (!asignado) noAsignados++;
  }

  console.log(`   ✅ Negocios asignados: ${asignados}`);
  console.log(`   ⚠️  No asignados (fuera de zona): ${noAsignados}`);
  console.log(`   📊 Celdas con negocios: ${cellNegocios.size}`);

  // 3. Actualizar fishnet con negocios
  console.log('\n🔄 Actualizando Fishnet...');
  
  for (const cell of fishnet.features) {
    const cellId = cell.properties.cellId;
    const negociosEnCelda = cellNegocios.get(cellId) || [];
    
    cell.properties.negociosCount = negociosEnCelda.length;
    cell.properties.negocios = negociosEnCelda;
    cell.properties.hasNegocios = negociosEnCelda.length > 0;
    
    // Calcular densidad (negocios por hectárea)
    cell.properties.densidad = Math.round(negociosEnCelda.length / 0.25 * 100) / 100; // 2500m² = 0.25ha
  }

  // 4. Generar estadísticas por celda
  const stats = {
    totalNegocios: asignados,
    celdasConNegocios: cellNegocios.size,
    celdasVacias: fishnet.features.length - cellNegocios.size,
    densidadPromedio: Math.round((asignados / cellNegocios.size) * 100) / 100,
    maxNegociosPorCelda: Math.max(...Array.from(cellNegocios.values()).map(n => n.length)),
    distribucionPorPrecision: {
      interpolada: negocios.features.filter((n: any) => n.properties.precision === 'interpolada').length,
      centroide: negocios.features.filter((n: any) => n.properties.precision === 'centroide_barrio').length
    },
    top10Celdas: Array.from(cellNegocios.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .map(([cellId, negocios]) => ({
        cellId,
        count: negocios.length,
        ejemplos: negocios.slice(0, 3).map((n: any) => n.nombre)
      }))
  };

  // 5. Guardar fishnet actualizado
  fishnet.metadata = {
    ...fishnet.metadata,
    fecha_integracion: new Date().toISOString(),
    negocios_integrados: asignados,
    celdas_con_negocios: cellNegocios.size
  };

  const outputFishnet = path.join(GEO_DIR, 'fishnet_con_negocios.geojson');
  fs.writeFileSync(outputFishnet, JSON.stringify(fishnet, null, 2));
  console.log(`   ✅ Guardado: ${outputFishnet}`);

  // 6. Guardar estadísticas
  const outputStats = path.join(GEO_DIR, 'fishnet_negocios_stats.json');
  fs.writeFileSync(outputStats, JSON.stringify(stats, null, 2));
  console.log(`   ✅ Estadísticas: ${outputStats}`);

  // 7. Crear GeoJSON simplificado para el frontend
  const frontendData = {
    type: 'FeatureCollection',
    features: fishnet.features.filter((f: any) => f.properties.negociosCount > 0).map((f: any) => ({
      type: 'Feature',
      properties: {
        cellId: f.properties.cellId,
        negociosCount: f.properties.negociosCount,
        densidad: f.properties.densidad,
        negocios: f.properties.negocios
      },
      geometry: f.geometry
    }))
  };
  
  const outputFrontend = path.join(GEO_DIR, 'fishnet_negocios_frontend.geojson');
  fs.writeFileSync(outputFrontend, JSON.stringify(frontendData, null, 2));
  console.log(`   ✅ Frontend: ${outputFrontend}`);

  // 8. Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE INTEGRACIÓN');
  console.log('='.repeat(60));
  console.log(`   📍 Total negocios asignados: ${stats.totalNegocios}`);
  console.log(`   🔲 Celdas con negocios: ${stats.celdasConNegocios}`);
  console.log(`   ⬜ Celdas vacías: ${stats.celdasVacias}`);
  console.log(`   📈 Densidad promedio: ${stats.densidadPromedio} negocios/celda`);
  console.log(`   🏆 Max negocios en una celda: ${stats.maxNegociosPorCelda}`);
  
  console.log('\n   🔝 Top 5 celdas con más negocios:');
  stats.top10Celdas.slice(0, 5).forEach((c, i) => {
    console.log(`      ${i + 1}. ${c.cellId}: ${c.count} negocios`);
  });

  console.log('\n✅ Integración completada!\n');
}

main().catch(console.error);
