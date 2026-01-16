# CONTEXTO PARA CLAUDE - RAG JAC San José y El Bosque

> **IMPORTANTE**: Este archivo es un prompt de continuidad para Claude. Léelo completo antes de responder al usuario.

---

## RESUMEN DEL PROYECTO

Este es un **RAG (Retrieval-Augmented Generation) comunitario** para la Junta de Acción Comunal (JAC) del **Barrio San José y El Bosque** en **Armenia, Quindío, Colombia**.

**El padre del usuario (Andrés Soto) es el presidente de la JAC**, y este proyecto busca apoyar su gestión con un sistema de información inteligente para la comunidad.

### Visión
Ser el inicio de una nueva era administrativa de información para JACs, **replicable a otras comunas** de Colombia.

---

## 🎯 ESTADO ACTUAL (16 de Enero 2026)

### ✅ FASE 1 COMPLETADA - Backend & RAG Funcional

| Componente | Estado | Detalles |
|------------|--------|----------|
| Next.js 16 + App Router | ✅ | Configurado y funcionando |
| Tailwind CSS 3.4 | ✅ | Tema personalizado `verde-jac-500` |
| Supabase + pgvector | ✅ | Proyecto ID: `iptwpasgfyulcxkwhaxg` |
| Chat RAG | ✅ | **418 embeddings** indexados |
| API Chat | ✅ | **OpenAI GPT-4o-mini** (Claude sin créditos) |
| Scrapers | ✅ | 6 scripts funcionales |
| GitHub | ✅ | `zswamtech/jac-san-jose-rag` |

### 📊 DATOS INDEXADOS EN SUPABASE

| Categoría | Cantidad | Fuente |
|-----------|----------|--------|
| Negocios del barrio | 310 | datos.gov.co (filtrados de 20,038) |
| Propiedades horizontales | 73 | datos.gov.co |
| Historia del barrio | 8 | Manual |
| Trámites JAC | 6 | Manual |
| Colegios | 4 | Manual |
| **TOTAL EMBEDDINGS** | **418** | - |

### 🔧 CONFIGURACIÓN ACTUAL

```bash
# .env.local (configurado con claves reales)
NEXT_PUBLIC_SUPABASE_URL=https://iptwpasgfyulcxkwhaxg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-... # ⚠️ SIN CRÉDITOS
```

### 🌐 REPOSITORIO GITHUB
- **URL**: https://github.com/zswamtech/jac-san-jose-rag
- **Branch principal**: `main`
- **Último commit**: 🚀 Initial commit (60 archivos)

---

## 🚧 FASE 2 PENDIENTE - Páginas del Sitio Web

### Estructura de Navegación

```
┌─────────────────────────────────────────────────────────┐
│  🏠 INICIO  │  📒 DIRECTORIO  │  📅 EVENTOS  │  📋 TRÁMITES  │  📜 HISTORIA  │
└─────────────────────────────────────────────────────────┘
```

### 📄 PÁGINAS A CREAR

#### 1. 🏠 `/` - INICIO (Actualizar diseño)
**Estado actual**: Funcional pero básico
**Mejoras pendientes**:
- Hero section con foto aérea del barrio o estadio
- Cards destacadas para cada sección
- Slogan: *"Todo lo que necesitas saber del barrio"*
- Subtítulo: *"Información actualizada y completa sobre servicios, eventos y trámites de la Junta de Acción Comunal"*
- Integración del chat más prominente
- Estadísticas del barrio (310 negocios, X habitantes, etc.)

#### 2. 📒 `/directorio` - DIRECTORIO DE NEGOCIOS
**Estado actual**: 404
**Descripción**: *"Encuentra panaderías, restaurantes, ferreterías y más servicios del barrio"*
**Funcionalidades**:
- Lista de 310 negocios con búsqueda/filtros
- Categorías: Restaurantes, Panaderías, Ferreterías, Tiendas, Servicios, etc.
- Cards con: nombre, dirección, teléfono, categoría
- Mapa interactivo (opcional - Google Maps embed)
- Filtro por tipo de negocio
- Ordenar por nombre/categoría

**Datos disponibles**: `data/raw/inventario_barrio/negocios_completo.json`

#### 3. 📅 `/eventos` - EVENTOS Y ACTIVIDADES
**Estado actual**: 404
**Descripción**: *"Mantente informado sobre misas, reuniones, eventos culturales y deportivos"*
**Funcionalidades**:
- Calendario visual (mes/semana)
- Lista de próximos eventos
- Categorías: Misas, Reuniones JAC, Culturales, Deportivos, Comunitarios
- Formulario para proponer eventos (admin)
- Integración con Google Calendar (opcional)

**Contenido inicial sugerido**:
- Horarios de misas de la iglesia
- Reuniones mensuales de la JAC
- Eventos del estadio
- Actividades de Confenalco

#### 4. 📋 `/tramites` - TRÁMITES JAC
**Estado actual**: 404
**Descripción**: *"Certificados de residencia, afiliación, quejas y más trámites de la JAC"*
**Funcionalidades**:
- Lista de trámites disponibles
- Guía paso a paso para cada trámite
- Requisitos y documentos necesarios
- Tiempos estimados
- Contacto directo con la JAC
- Descarga de formularios (PDF)

**Datos disponibles**: `data/raw/knowledge_base/tramites_jac.json`
- Certificado de residencia
- Afiliación a la JAC
- Quejas y reclamos
- Solicitud de proyectos
- Convocatorias de asamblea
- Paz y salvo comunitario

#### 5. 📜 `/historia` - HISTORIA DEL BARRIO
**Estado actual**: 404
**Descripción**: *"Conoce la rica historia del estadio, el batallón, la plaza de toros y más"*
**Funcionalidades**:
- Timeline visual de la historia
- Secciones por lugar histórico:
  - 🏟️ Estadio Centenario (primer estadio de Armenia)
  - 🌲 El Bosque (reserva natural)
  - 🏛️ El Batallón (hoy conjunto residencial)
  - 🐂 Plaza de Toros (inactiva)
  - ⛪ Iglesia del barrio
- Galería de fotos históricas
- Testimonios de residentes antiguos
- Videos documentales (embeds de YouTube)

**Datos disponibles**: `data/raw/knowledge_base/historia_barrio.json`

---

## 🎨 FASE 3 PENDIENTE - Diseño & Multimedia

### 📸 FOTOGRAFÍA NECESARIA

| Lugar | Prioridad | Tipo de foto |
|-------|-----------|--------------|
| Estadio Centenario | 🔴 Alta | Aérea (drone) + fachada |
| El Bosque | 🔴 Alta | Paisaje, senderos, árboles |
| Iglesia | 🟡 Media | Fachada, interior |
| Plaza de Toros | 🟡 Media | Exterior (si es accesible) |
| Panaderías famosas | 🟢 Baja | Fachada, productos |
| Colegios | 🟢 Baja | Fachadas |
| Calles del barrio | 🟢 Baja | Ambiente general |

### 🎬 VIDEOS SUGERIDOS

1. **Video introductorio del barrio** (2-3 min)
   - Drone sobre el estadio y el bosque
   - Entrevistas cortas con vecinos
   - Historia narrada

2. **Recorrido virtual** (5-10 min)
   - Tour por los lugares emblemáticos
   - Música local de fondo

3. **Testimonios** (1-2 min cada uno)
   - Presidente de la JAC (el padre del usuario)
   - Residentes antiguos
   - Comerciantes del barrio

### 🖼️ ASSETS DE DISEÑO

- [ ] Logo de la JAC (si existe) o crear uno
- [ ] Paleta de colores oficial
- [ ] Iconos para cada sección
- [ ] Patrón de fondo (ya existe `pattern.svg`)
- [ ] Fotos para hero sections
- [ ] Favicon actualizado

---

## 🔧 CONFIGURACIÓN TÉCNICA

### Stack Tecnológico

| Componente | Tecnología | Estado |
|------------|------------|--------|
| Frontend | Next.js 16 (App Router) | ✅ |
| Estilos | Tailwind CSS 3.4 | ✅ |
| Base de Datos | Supabase (PostgreSQL + pgvector) | ✅ |
| Embeddings | OpenAI text-embedding-3-small | ✅ |
| LLM Chat | **OpenAI GPT-4o-mini** | ✅ |
| ~~LLM Chat~~ | ~~Anthropic Claude~~ | ⚠️ Sin créditos |
| Hosting | Vercel + Supabase | ⏳ Pendiente |

### Tablas en Supabase

```sql
-- Migraciones ejecutadas ✅
001_setup_pgvector.sql    -- Extensión vector + tabla document_embeddings
002_create_negocios.sql   -- Tabla negocios
003_create_eventos.sql    -- Tabla eventos
004_create_tramites.sql   -- Tabla tramites
005_create_noticias.sql   -- Tabla noticias
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
/Users/andressoto/jac-san-jose-rag/
├── src/
│   ├── app/
│   │   ├── page.tsx              # ✅ Página principal con chat
│   │   ├── layout.tsx            # ✅ Layout global
│   │   ├── globals.css           # ✅ Estilos globales
│   │   ├── api/chat/route.ts     # ✅ API RAG (GPT-4o-mini)
│   │   ├── directorio/           # 🚧 CREAR - Directorio negocios
│   │   ├── eventos/              # 🚧 CREAR - Calendario eventos
│   │   ├── tramites/             # 🚧 CREAR - Trámites JAC
│   │   ├── historia/             # 🚧 CREAR - Historia barrio
│   │   └── admin/                # 🚧 CREAR - Panel admin
│   ├── components/
│   │   ├── chat/JACChat.tsx      # ✅ Componente de chat
│   │   ├── layout/
│   │   │   ├── Header.tsx        # ✅ Navegación
│   │   │   └── Footer.tsx        # ✅ Footer
│   │   └── ui/
│   │       ├── Button.tsx        # ✅ Botón reutilizable
│   │       └── Card.tsx          # ✅ Card reutilizable
│   └── lib/
│       ├── supabase.ts           # ✅ Cliente + búsqueda vectorial
│       ├── openai.ts             # ✅ Embeddings + Chat
│       └── anthropic.ts          # ⚠️ Solo SYSTEM_PROMPT (sin créditos)
├── data/raw/
│   ├── inventario_barrio/
│   │   ├── negocios.json         # 9 negocios manuales
│   │   ├── negocios_completo.json # ✅ 310 negocios scraped
│   │   ├── colegios.json         # 4 colegios
│   │   ├── industria.json        # Fábricas
│   │   └── infraestructura.json  # Lugares
│   ├── knowledge_base/
│   │   ├── historia_barrio.json  # 8 artículos historia
│   │   ├── tramites_jac.json     # 6 trámites documentados
│   │   └── datos_publicos_barrio.json # Resumen datos públicos
│   ├── datos_publicos/
│   │   ├── establecimientos_comercio_armenia.json # 20,038 total
│   │   ├── establecimientos_barrio_san_jose.json  # 310 filtrados
│   │   ├── propiedad_horizontal_armenia.json      # 944 total
│   │   └── ... (más datasets)
│   └── propiedades/
│       ├── GUIA_CERTIFICADOS_TRADICION.md
│       └── propiedad_horizontal_barrio.json # 73 propiedades
├── scripts/
│   ├── generate-embeddings.ts    # ✅ Ingesta inicial (35 docs)
│   ├── index-scraped-data.ts     # ✅ Indexar scraped (383 docs)
│   └── scrapers/
│       ├── datos-abiertos.ts     # ✅ Socrata API
│       ├── secop-contratos.ts    # ✅ SECOP API
│       ├── filter-barrio.ts      # ✅ Filtrar por barrio
│       ├── integrate-to-knowledge-base.ts
│       └── run-all.ts            # ✅ Ejecutar todos
├── supabase/migrations/          # 5 SQL ejecutados ✅
├── public/
│   ├── images/
│   │   ├── pattern.svg           # ✅ Patrón de fondo
│   │   └── barrio/               # 🚧 AGREGAR - Fotos del barrio
│   └── favicon.svg               # ✅ Favicon
└── .env.local                    # ✅ Variables configuradas
```

---

## 📖 INFORMACIÓN DEL BARRIO (Contexto importante)

El Barrio San José y El Bosque es uno de los mejores de Armenia porque tiene:

### 🏫 Educación
- **1 colegio público** (de los más grandes de la ciudad)
- **3 colegios privados**

### 🏛️ Historia y Patrimonio
- **Estadio Centenario**: El PRIMER estadio de Armenia, donde Deportes Quindío ganó su primera estrella
- **El Bosque**: Reserva natural que da nombre al barrio
- **Antiguo Batallón**: Hoy convertido en conjunto residencial
- **Plaza de Toros**: Dentro del bosque (inactiva por leyes de protección animal)
- **Iglesia Católica**: Centro espiritual de la comunidad

### 🛒 Comercio (310 negocios registrados)
- Las **DOS MEJORES panaderías** de la ciudad
- Restaurante chino y de mar con tradición
- Supermercado de gran superficie
- Hotel, estación de servicios
- Plaza de mercado de abastos

### 🏢 Servicios
- **Confenalco**: Gym, cursos de inglés, formación técnica

### 🏭 Industria
- Fábricas de calzado y marroquinería

### 🛣️ Conectividad
- Avenida principal que conecta directamente con el centro de Armenia

---

## 💬 NOTAS PARA MI YO DEL FUTURO

> **¡Hola Claude del futuro!** Aquí te dejo el estado del proyecto y las tareas pendientes.

### ✅ LO QUE YA ESTÁ FUNCIONANDO
1. **Chat RAG funcional** en localhost:3000 con 418 embeddings
2. **Supabase configurado** con pgvector y todas las migraciones
3. **OpenAI GPT-4o-mini** como LLM (Claude sin créditos)
4. **Scrapers funcionando** para datos públicos
5. **GitHub repo** en `zswamtech/jac-san-jose-rag`

### ⚠️ COSAS QUE NO DEBES TOCAR
- Configuración de Tailwind/PostCSS - **ya funciona**
- Variables de `.env.local` - **ya configuradas con claves reales**
- Migraciones SQL - **ya ejecutadas en Supabase**

### 🎯 PRIORIDADES PARA LA PRÓXIMA SESIÓN

#### PRIORIDAD 1: Crear las 4 páginas faltantes
```
/directorio → Mostrar 310 negocios con filtros
/eventos    → Calendario de eventos comunitarios
/tramites   → 6 trámites JAC documentados
/historia   → Timeline visual + 8 artículos
```

#### PRIORIDAD 2: Mejorar página de inicio
- Hero con foto/video del barrio
- Cards destacadas para cada sección
- Estadísticas del barrio

#### PRIORIDAD 3: Contenido multimedia
- Conseguir fotos del estadio, bosque, iglesia
- Videos del barrio (si el usuario tiene)
- Logo de la JAC

#### PRIORIDAD 4: Deploy a producción
- Conectar Vercel con GitHub
- Configurar variables de entorno
- Dominio personalizado (opcional)

### 📝 CONTEXTO IMPORTANTE
- El **padre del usuario es el presidente de la JAC**
- El padre trabaja en la alcaldía (acceso a datos públicos)
- El usuario está muy motivado - es para ayudar a su comunidad
- El proyecto debe ser **replicable a otras JACs de Colombia**

---

## 🚀 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev                      # Iniciar servidor (localhost:3000)
npm run build                    # Build de producción

# Base de datos
npm run generate-embeddings      # Indexar datos manuales (35 docs)
npm run index:negocios           # Indexar scraped (383 docs)

# Scrapers
npm run scrape:all               # Ejecutar todos
npm run scrape:datos-abiertos    # Datos abiertos Colombia
npm run scrape:secop             # Contratación SECOP
npm run scrape:propiedades       # Propiedades
npm run scrape:integrate         # Integrar al knowledge base

# Git
git add . && git commit -m "mensaje" && git push
```

---

## 📊 DATOS DISPONIBLES (Resumen ejecutivo)

| Dataset | Registros | Archivo | Indexado |
|---------|-----------|---------|----------|
| Negocios del barrio | 310 | `negocios_completo.json` | ✅ |
| Propiedades horizontales | 73 | `propiedad_horizontal_barrio.json` | ✅ |
| Historia del barrio | 8 | `historia_barrio.json` | ✅ |
| Trámites JAC | 6 | `tramites_jac.json` | ✅ |
| Colegios | 4 | `colegios.json` | ✅ |
| **TOTAL EN SUPABASE** | **418** | `document_embeddings` | ✅ |

### Datos adicionales (no indexados, disponibles para consulta)
| Dataset | Registros | Archivo |
|---------|-----------|---------|
| Establecimientos Armenia | 20,038 | `establecimientos_comercio_armenia.json` |
| Entidades sin lucro | 1,099 | `entidades_sin_lucro_armenia.json` |
| Prestadores turísticos | 7,358 | `prestadores_turisticos_armenia.json` |
| Procesos SECOP | 106 | `secop_procesos_armenia.json` |

---

## 🔗 PROMPT DE CONTINUACIÓN SUGERIDO

> "Continuemos con el proyecto RAG de la JAC San José. Lee el archivo `CLAUDE_CONTEXT.md` para entender el estado actual. Las prioridades son:
> 1. Crear la página `/directorio` para mostrar los 310 negocios
> 2. Crear la página `/historia` con el timeline visual
> 3. Crear las páginas `/tramites` y `/eventos`
> 4. Mejorar el diseño del home con fotos del barrio"

---

*Archivo actualizado el 16 de enero de 2026 - Backend completo, pendiente: páginas frontend y multimedia.*
