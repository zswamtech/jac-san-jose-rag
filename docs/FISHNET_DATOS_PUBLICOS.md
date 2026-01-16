# Fishnet JAC San José - Fuentes de Datos Públicos

> **Objetivo**: Análisis espacial de biodiversidad, monitoreo de hábitat y estudios ecológicos para la JAC del Barrio San José y El Bosque, Armenia, Quindío.

---

## 1. ESTADO ACTUAL DE DATOS

### 1.1 Negocios (310 registros)
- **Tiene coordenadas**: ❌ NO
- **Tiene direcciones**: ✅ SÍ (formato: "CL 20 24-65 SAN JOSE")
- **Acción requerida**: Geocodificación

### 1.2 Límites geográficos del barrio
- **Estado**: ❌ No disponible
- **Acción requerida**: Obtener polígono GeoJSON

---

## 2. FUENTES DE DATOS PÚBLICOS COLOMBIA

### 2.1 DATOS GEOGRÁFICOS Y LÍMITES

| Fuente | URL | Datos disponibles | Acceso |
|--------|-----|-------------------|--------|
| **IGAC** | https://geoportal.igac.gov.co | Cartografía base, límites municipales, manzanas | API REST / Descarga |
| **IDECA (Bogotá modelo)** | https://www.ideca.gov.co | Ejemplo de geoportal municipal | Referencia |
| **Alcaldía Armenia** | https://www.armenia.gov.co | Ordenamiento territorial (POT) | PDF/Solicitud |
| **Catastro Quindío** | https://www.quindio.gov.co | Predios, manzanas, estratos | Solicitud formal |
| **OpenStreetMap** | https://www.openstreetmap.org | Calles, edificios, POIs | API Overpass |

#### Scraping/API para límites:

```typescript
// OpenStreetMap Overpass API - Obtener límites del barrio
const OVERPASS_API = 'https://overpass-api.de/api/interpreter'

const query = `
[out:json][timeout:25];
area["name"="Armenia"]["admin_level"="8"]->.city;
(
  // Buscar el barrio por nombre
  relation["name"~"San José|El Bosque"]["place"="neighbourhood"](area.city);
  way["name"~"San José|El Bosque"]["place"="neighbourhood"](area.city);
);
out body;
>;
out skel qt;
`
```

---

### 2.2 DATOS AMBIENTALES Y ECOLÓGICOS

| Fuente | URL | Datos | API/Scraping |
|--------|-----|-------|--------------|
| **SiB Colombia** | https://biodiversidad.co | Registros de fauna/flora, especies | API REST ✅ |
| **GBIF** | https://www.gbif.org | Biodiversidad global (incluye Colombia) | API REST ✅ |
| **IDEAM** | http://www.ideam.gov.co | Clima, hidrología, calidad aire | Descarga/Solicitud |
| **CRQ** | https://www.crq.gov.co | Datos ambientales Quindío | Portal/Solicitud |
| **SIAC** | http://www.siac.gov.co | Sistema de Información Ambiental | Portal |
| **RUNAP** | https://runap.parquesnacionales.gov.co | Áreas protegidas | API REST ✅ |

#### API SiB Colombia - Registros de biodiversidad:

```typescript
// SiB Colombia API - Registros por coordenadas
const SIB_API = 'https://api.biodiversidad.co'

// Buscar registros en un área (bounding box de Armenia)
// Coordenadas aproximadas: 4.52° - 4.56° N, 75.68° - 75.72° W
const armeniaBox = {
  minLat: 4.52,
  maxLat: 4.56,
  minLon: -75.72,
  maxLon: -75.68
}

// Endpoint para ocurrencias
`${SIB_API}/api/v1.5/occurrence/search?decimalLatitude=${armeniaBox.minLat},${armeniaBox.maxLat}&decimalLongitude=${armeniaBox.minLon},${armeniaBox.maxLon}&limit=1000`
```

#### API GBIF - Biodiversidad global:

```typescript
// GBIF API - Más completa para biodiversidad
const GBIF_API = 'https://api.gbif.org/v1'

// Buscar ocurrencias en Armenia, Quindío
// gadmGid es el código GADM del municipio
`${GBIF_API}/occurrence/search?gadmGid=COL.26.1_1&limit=300`

// O por coordenadas
`${GBIF_API}/occurrence/search?decimalLatitude=4.54&decimalLongitude=-75.70&radius=5km&limit=300`
```

---

### 2.3 DATOS URBANOS Y PLANEACIÓN

| Fuente | URL | Datos | Acceso |
|--------|-----|-------|--------|
| **datos.gov.co** | https://datos.gov.co | Múltiples datasets | API Socrata ✅ |
| **DANE** | https://www.dane.gov.co | Censos, demografía | Descarga |
| **SISBEN** | Portal municipal | Estratificación | Solicitud |
| **EPA Armenia** | Empresas Públicas | Redes servicios | Solicitud |
| **Geoquindío** | Portal departamental | SIG departamental | Portal |

#### Datasets adicionales en datos.gov.co:

```typescript
// Nuevos datasets para agregar al scraper
const DATASETS_GEOGRAFICOS = {
  // Áreas protegidas
  areas_protegidas: {
    id: 'n5qp-hk5v',
    name: 'Áreas Protegidas de Colombia',
  },
  // Coberturas de la tierra
  coberturas_tierra: {
    id: 'j4vf-dkc5',
    name: 'Cobertura de la Tierra IDEAM',
  },
  // Estaciones meteorológicas
  estaciones_ideam: {
    id: 'sbwg-7ju4',
    name: 'Estaciones Meteorológicas IDEAM',
  },
  // Fauna silvestre
  fauna_decomisada: {
    id: '42e5-u25e',
    name: 'Fauna Silvestre Decomisada',
  },
}
```

---

### 2.4 GEOCODIFICACIÓN (Convertir direcciones a coordenadas)

| Servicio | Límites gratuitos | Precisión | Recomendado |
|----------|-------------------|-----------|-------------|
| **Nominatim (OSM)** | Ilimitado (rate limit) | Media | ✅ Para empezar |
| **Google Geocoding** | 200/día gratis | Alta | Con API key |
| **Mapbox** | 100,000/mes gratis | Alta | Con cuenta |
| **HERE** | 250,000/mes gratis | Alta | Con cuenta |
| **Photon** | Ilimitado | Media | Alternativa OSM |

#### Geocodificación con Nominatim:

```typescript
// Geocodificar direcciones de negocios
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'

async function geocodeAddress(direccion: string): Promise<{lat: number, lon: number} | null> {
  const query = `${direccion}, Armenia, Quindío, Colombia`
  const url = `${NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=1`

  // Respetar rate limit: 1 request/segundo
  await sleep(1000)

  const response = await fetch(url, {
    headers: { 'User-Agent': 'JAC-SanJose-Project/1.0' }
  })

  const data = await response.json()
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  }
  return null
}
```

---

## 3. ESTRATEGIA DE OBTENCIÓN DE DATOS

### Fase 1A: Datos inmediatos (Scraping/APIs)

| Prioridad | Dato | Fuente | Método |
|-----------|------|--------|--------|
| 🔴 Alta | Límites barrio | OpenStreetMap | Overpass API |
| 🔴 Alta | Geocodificar 310 negocios | Nominatim | API batch |
| 🟡 Media | Registros biodiversidad | SiB/GBIF | API REST |
| 🟡 Media | Áreas protegidas | RUNAP | API REST |
| 🟢 Baja | Coberturas tierra | IDEAM | Descarga |

### Fase 1B: Datos por solicitud formal

| Dato | Entidad | Mecanismo |
|------|---------|-----------|
| POT Armenia | Planeación Municipal | Derecho de petición / Portal |
| Manzanas catastrales | Catastro Quindío | Solicitud formal |
| Estratificación | SISBEN Armenia | Solicitud formal |
| Árboles urbanos | CRQ / Alcaldía | Derecho de petición |
| Fauna urbana reportada | CRQ | Derecho de petición |

### Fase 1C: Datos por investigación (Gemini/Web)

| Dato | Método |
|------|--------|
| Extensión Parque El Bosque | Investigación web + Gemini |
| Especies reportadas en el bosque | SiB Colombia + literatura |
| Historia ambiental del sector | Archivos locales |
| Corredores ecológicos | CRQ + investigación |

---

## 4. PROMPT PARA GEMINI - Datos Geográficos

```
Necesito información geográfica específica del Barrio San José y El Bosque en Armenia, Quindío, Colombia para un proyecto de análisis espacial (Fishnet).

Por favor ayúdame a encontrar:

1. COORDENADAS APROXIMADAS DEL BARRIO
   - Punto central (latitud, longitud)
   - Bounding box aproximado (esquinas NE, SW)
   - Límites con otros barrios vecinos

2. PARQUE EL BOSQUE
   - Extensión en hectáreas
   - Coordenadas del perímetro
   - ¿Está catalogado como área protegida?
   - Entidad que lo administra

3. OTROS ESPACIOS VERDES
   - Parques menores
   - Zonas verdes públicas
   - Corredores ecológicos

4. INFRAESTRUCTURA RELEVANTE
   - Estadio/Parque de la Cultura Deportiva - ubicación exacta
   - Plaza de Toros El Bosque - coordenadas
   - Iglesia San José Obrero - ubicación

5. FUENTES DE DATOS GEOESPACIALES
   - ¿Existe un geoportal de Armenia?
   - ¿Dónde puedo descargar el POT vigente?
   - ¿La CRQ tiene datos públicos del sector?

6. BIODIVERSIDAD REPORTADA
   - ¿Hay estudios de fauna/flora del Bosque Municipal?
   - Especies emblemáticas del sector
   - Aves urbanas reportadas

Contexto: Esto es para crear un Fishnet (cuadrícula de análisis espacial) para monitoreo ambiental y estudios de biodiversidad en el barrio.
```

---

## 5. ESTRUCTURA DE DATOS PARA FISHNET

### 5.1 GeoJSON del Polígono del Barrio (a obtener)

```json
{
  "type": "Feature",
  "properties": {
    "nombre": "Barrio San José y El Bosque",
    "comuna": "Comuna 6",
    "ciudad": "Armenia",
    "departamento": "Quindío"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-75.71, 4.53],  // SW corner (aproximado)
        [-75.69, 4.53],  // SE corner
        [-75.69, 4.55],  // NE corner
        [-75.71, 4.55],  // NW corner
        [-75.71, 4.53]   // Cerrar polígono
      ]
    ]
  }
}
```

### 5.2 Estructura de celda Fishnet

```typescript
interface FishnetCell {
  id: string                    // "cell_001"
  geometry: GeoJSON.Polygon     // Polígono de la celda
  centroid: [number, number]    // Centro de la celda
  properties: {
    // Conteos
    negocios_count: number
    especies_count: number
    arboles_count: number

    // Métricas ecológicas
    cobertura_verde_pct: number
    indice_biodiversidad: number

    // Infraestructura
    tiene_parque: boolean
    distancia_bosque_m: number

    // Social
    estrato_predominante: number
    densidad_poblacional: number
  }
}
```

---

## 6. PRÓXIMOS PASOS TÉCNICOS

### Inmediato (esta sesión):
1. [ ] Crear scraper para OpenStreetMap (límites barrio)
2. [ ] Crear scraper para geocodificación de negocios
3. [ ] Crear scraper para SiB Colombia (biodiversidad)

### Corto plazo:
4. [ ] Ejecutar geocodificación de 310 negocios
5. [ ] Obtener registros de biodiversidad del área
6. [ ] Crear archivo GeoJSON base del barrio

### Mediano plazo:
7. [ ] Solicitar datos a CRQ y Planeación Municipal
8. [ ] Generar Fishnet con Turf.js
9. [ ] Crear visualización en mapa

---

## 7. RECURSOS Y DOCUMENTACIÓN

- [Socrata API Docs](https://dev.socrata.com/docs/queries/)
- [GBIF API](https://www.gbif.org/developer/occurrence)
- [SiB Colombia](https://biodiversidad.co/compartir/api)
- [Overpass API (OSM)](https://wiki.openstreetmap.org/wiki/Overpass_API)
- [Turf.js (análisis espacial)](https://turfjs.org/)
- [Nominatim Geocoding](https://nominatim.org/release-docs/latest/api/Search/)

---

*Documento creado: Enero 2026*
*Proyecto: RAG JAC San José y El Bosque*
