# 🗺️ Guía de Visualización GeoJSON

## Archivos Disponibles

```
data/raw/geo/
├── barrio_san_jose_bosque_refined.geojson  # Polígonos y POIs verificados
├── fishnet_barrio.geojson                   # Malla 1,584 celdas (50x50m)
├── fishnet_analysis.json                    # Estadísticas del análisis
└── negocios_geocoded.geojson                # 310 negocios geocodificados
```

---

## 🌐 Opción 1: Visor Web (Más Fácil)

Abre directamente en el navegador:

```bash
open public/geo-viewer.html
```

O accede vía servidor de desarrollo:
```bash
npm run dev
# Luego visita: http://localhost:3000/geo-viewer.html
```

### Controles del Visor:
- **📍 Barrios**: Polígonos de San José, El Bosque y Parque de la Vida
- **🏛️ POIs**: 6 puntos de interés verificados
- **🏪 Negocios**: 310 negocios (azul=interpolados, amarillo=centroide)
- **🔲 Fishnet**: Malla de análisis 50x50m
- **🛣️ Vías**: Ejes viales principales

---

## 🖥️ Opción 2: QGIS (Profesional)

### Instalación
```bash
# macOS
brew install --cask qgis

# O descarga desde: https://qgis.org/download/
```

### Cargar los archivos

1. Abrir QGIS
2. `Capa` → `Añadir capa` → `Añadir capa vectorial`
3. Seleccionar cada archivo `.geojson`:
   - `barrio_san_jose_bosque_refined.geojson`
   - `fishnet_barrio.geojson`
   - `negocios_geocoded.geojson`

### Estilo recomendado

Para el **Fishnet**:
- Relleno: Sin relleno
- Borde: Gris 50%, 0.5px

Para **Negocios** (por precisión):
1. Click derecho en la capa → Propiedades → Simbología
2. Seleccionar "Categorizado"
3. Columna: `precision`
4. Clasificar
5. Colores:
   - `interpolada`: Azul (#2196F3)
   - `centroide_barrio`: Amarillo (#FFC107)

### Superposición con POT Armenia

1. Descargar capas de: [SIG Armenia Hub](https://armenia.maps.arcgis.com)
2. O conectar WMS: `Capa` → `Añadir capa WMS/WMTS`
3. Buscar servicios de Planeación Municipal

---

## 🌍 Opción 3: Google Earth Pro

### Instalación
```bash
# macOS
brew install --cask google-earth-pro

# O descarga: https://www.google.com/earth/versions/#earth-pro
```

### Convertir GeoJSON a KML

Ejecuta este script para generar archivos KML:

```bash
npm run geo:to-kml
```

O usa QGIS:
1. Cargar el GeoJSON
2. Click derecho → `Exportar` → `Guardar como`
3. Formato: `KML`

### Cargar en Google Earth

1. `Archivo` → `Abrir`
2. Seleccionar el archivo `.kml`
3. Navegar a Armenia, Quindío

---

## 📊 Opción 4: Kepler.gl (Análisis Avanzado)

1. Visita: https://kepler.gl/demo
2. Arrastra los archivos `.geojson`
3. Kepler creará visualizaciones automáticas

### Análisis sugeridos:
- Mapa de calor de negocios
- Filtrar por precisión de geocodificación
- Superposición de fishnet con negocios

---

## 🔍 Validación de Coordenadas

### POIs Verificados (Gemini)

| Lugar | Lat | Lon | Verificar en |
|-------|-----|-----|--------------|
| Estadio San José | 4.53172 | -75.67935 | [Google Maps](https://maps.google.com/?q=4.53172,-75.67935) |
| Plaza de Toros | 4.54025 | -75.67550 | [Google Maps](https://maps.google.com/?q=4.54025,-75.67550) |
| Parroquia San José | 4.53050 | -75.68005 | [Google Maps](https://maps.google.com/?q=4.53050,-75.68005) |
| FUNDANZA | 4.53580 | -75.67650 | [Google Maps](https://maps.google.com/?q=4.53580,-75.67650) |
| Colegio Rufino J. Cuervo | 4.53750 | -75.67700 | [Google Maps](https://maps.google.com/?q=4.53750,-75.67700) |

### Bounding Box del Área de Estudio

```
Norte: 4.5480
Sur: 4.5260
Este: -75.6700
Oeste: -75.6850
```

---

## 🛠️ Comandos Útiles

```bash
# Regenerar fishnet
npm run geo:fishnet

# Regenerar geocodificación
npm run geo:geocode

# Ejecutar ambos
npm run geo:all

# Abrir visor web
open public/geo-viewer.html
```

---

## 📝 Notas Técnicas

- **CRS**: WGS84 (EPSG:4326)
- **Formato**: GeoJSON estándar RFC 7946
- **Tamaño Fishnet**: 50m x 50m (1,584 celdas)
- **Área cubierta**: ~396 hectáreas
- **Precisión geocodificación**: 59% interpolada, 41% centroide

---

*Actualizado: 16 de enero de 2026*
