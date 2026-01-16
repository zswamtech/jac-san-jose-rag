# CONTEXTO PARA CLAUDE - RAG JAC San José y El Bosque

> **IMPORTANTE**: Este archivo es un prompt de continuidad para Claude. Léelo completo antes de responder al usuario.

---

## RESUMEN DEL PROYECTO

Este es un **RAG (Retrieval-Augmented Generation) comunitario** para la Junta de Acción Comunal (JAC) del **Barrio San José y El Bosque** en **Armenia, Quindío, Colombia**.

**El padre del usuario (Andrés Soto) es el presidente de la JAC**, y este proyecto busca apoyar su gestión con un sistema de información inteligente para la comunidad.

### Visión
Ser el inicio de una nueva era administrativa de información para JACs, **replicable a otras comunas** de Colombia.

---

## ESTADO ACTUAL (Enero 2026)

### ✅ COMPLETADO
1. **Estructura del proyecto Next.js 16** con App Router
2. **Configuración de Tailwind CSS 3.4**
3. **Componente de Chat RAG** (`src/components/chat/JACChat.tsx`)
4. **API de Chat** (`src/app/api/chat/route.ts`) con búsqueda semántica
5. **Cliente Supabase** (`src/lib/supabase.ts`) con funciones de búsqueda vectorial
6. **Migraciones SQL** para pgvector (5 tablas)
7. **Datos iniciales del barrio** en JSON:
   - 9 negocios (panaderías, restaurantes, Confenalco, etc.)
   - 4 colegios (1 público grande + 3 privados)
   - 6 lugares históricos (estadio, bosque, plaza de toros, batallón)
   - 6 trámites JAC documentados
   - 8 artículos de historia
8. **Script de generación de embeddings** (`scripts/generate-embeddings.ts`)
9. **Página principal** funcionando en localhost:3000
10. **Build exitoso** verificado
11. **🆕 SISTEMA DE SCRAPING DE DATOS PÚBLICOS**
    - **20,038** establecimientos comerciales de Armenia (Cámara de Comercio)
    - **310** negocios filtrados del Barrio San José y El Bosque
    - **944** propiedades horizontales de Armenia
    - **73** propiedades horizontales del barrio específicamente
    - **1,099** entidades sin ánimo de lucro
    - **7,358** prestadores turísticos
    - **106** procesos de contratación SECOP
    - Guía completa para obtener certificados de tradición

### ⏳ PENDIENTE (Próximos pasos prioritarios)

#### 1. 🔄 CONFIGURAR SUPABASE (EN PROCESO)
El usuario está creando el proyecto en supabase.com:
- **Nombre del proyecto**: `jac-san-jose-rag`
- **Región**: South America (São Paulo)
- **Org**: yiiqgjugzjofrgdtoean

**Pasos siguientes después de crear el proyecto:**
1. Habilitar extensión pgvector en SQL Editor
2. Ejecutar migraciones SQL en `supabase/migrations/`
3. Configurar `.env.local` con claves reales:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Ejecutar `npm run generate-embeddings`

#### 2. ✅ SCRAPING DE DATOS PÚBLICOS (COMPLETADO)
Se implementaron scrapers funcionales para:

**a) Datos Abiertos Colombia (datos.gov.co)** ✅
```bash
npm run scrape:datos-abiertos
```
- Establecimientos comerciales: 20,038 registros
- Entidades sin ánimo de lucro: 1,099 registros
- Prestadores turísticos: 7,358 registros
- Propiedad horizontal: 944 registros

**b) SECOP - Contratación Pública** ✅
```bash
npm run scrape:secop
```
- Procesos de contratación recientes
- Clasificación por categoría (infraestructura, educación, etc.)

**c) Certificados de Tradición y Libertad** ⚠️
```bash
npm run scrape:propiedades
```
- Genera guía en `data/raw/propiedades/GUIA_CERTIFICADOS_TRADICION.md`
- Requiere acceso especial (pago o convenio con alcaldía)
- El padre del usuario puede facilitar acceso

**d) Filtrado por Barrio** ✅
```bash
npx tsx scripts/scrapers/filter-barrio.ts
```
- 310 negocios del barrio identificados
- 73 propiedades horizontales del barrio

#### 3. ✅ INTEGRACIÓN DE DATOS AL KNOWLEDGE BASE (COMPLETADO)
```bash
npm run scrape:integrate
```
Datos integrados:
- **310 negocios** con direcciones, teléfonos y emails reales
- **73 propiedades horizontales** del barrio
- **3 artículos** generados automáticamente para el RAG
- Archivo: `data/raw/inventario_barrio/negocios_completo.json`

#### 4. CREAR PÁGINAS FALTANTES
- `/directorio` - Directorio de negocios (404 actualmente)
- `/eventos` - Calendario de eventos (404 actualmente)
- `/tramites` - Guías de trámites JAC
- `/historia` - Historia del barrio
- `/admin` - Panel de administración

#### 5. COMPLETAR INVENTARIO DEL BARRIO
- Recopilar nombres reales de negocios
- Teléfonos y direcciones exactas
- Fotos de los lugares
- Horarios de misas
- Información de los colegios

---

## INFORMACIÓN DEL BARRIO (Contexto importante)

El Barrio San José y El Bosque es uno de los mejores de Armenia porque tiene:

- **Educación**: 1 colegio público (de los más grandes de la ciudad) + 3 privados
- **Historia deportiva**: El PRIMER estadio de Armenia, donde Deportes Quindío ganó su primera estrella
- **Infraestructura**:
  - Antiguo batallón militar (hoy conjunto residencial)
  - Plaza de toros dentro del bosque (inactiva por leyes de protección animal)
  - El bosque natural que da nombre al barrio
  - Iglesia católica
- **Comercio**:
  - Las DOS MEJORES panaderías de la ciudad
  - Restaurante chino y de mar con tradición
  - Supermercado de gran superficie
  - Hotel, estación de servicios
  - Plaza de mercado de abastos
- **Servicios**: Confenalco (gym, cursos de inglés, formación técnica)
- **Industria**: Fábricas de calzado y marroquinería
- **Conectividad**: Avenida principal que conecta con el centro

---

## STACK TECNOLÓGICO

| Componente | Tecnología |
|------------|------------|
| Frontend | Next.js 16 (App Router) |
| Estilos | Tailwind CSS 3.4 |
| Base de Datos | Supabase (PostgreSQL + pgvector) |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | Anthropic Claude |
| Hosting | Vercel + Supabase |

---

## ARCHIVOS CLAVE

```
/Users/andressoto/jac-san-jose-rag/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Página principal con chat
│   │   └── api/chat/route.ts     # API RAG
│   ├── components/
│   │   └── chat/JACChat.tsx      # Componente de chat
│   └── lib/
│       ├── supabase.ts           # Cliente y funciones RAG
│       ├── openai.ts             # Embeddings
│       └── anthropic.ts          # System prompt
├── data/raw/
│   ├── inventario_barrio/        # negocios.json, colegios.json, etc.
│   ├── knowledge_base/           # tramites_jac.json, historia_barrio.json
│   ├── datos_publicos/           # 🆕 DATOS SCRAPED
│   │   ├── establecimientos_comercio_armenia.json (20,038)
│   │   ├── establecimientos_barrio_san_jose.json (310)
│   │   ├── entidades_sin_lucro_armenia.json (1,099)
│   │   ├── prestadores_turisticos_armenia.json (7,358)
│   │   └── propiedad_horizontal_armenia.json (944)
│   └── propiedades/              # 🆕 PROPIEDADES
│       ├── GUIA_CERTIFICADOS_TRADICION.md
│       ├── propiedad_horizontal_barrio.json (73)
│       └── info_registro_quindio.json
├── scripts/
│   ├── generate-embeddings.ts    # Ingesta de datos
│   └── scrapers/                 # 🆕 SCRAPERS
│       ├── datos-abiertos.ts     # Datos Colombia
│       ├── secop-contratos.ts    # Contratación pública
│       ├── propiedades-tradicion.ts # Certificados
│       ├── filter-barrio.ts      # Filtrar por barrio
│       ├── integrate-to-knowledge-base.ts
│       └── run-all.ts            # Ejecutar todos
├── supabase/migrations/          # 5 archivos SQL
└── .env.local                    # Variables de entorno (placeholders)
```

---

## PROYECTOS DE REFERENCIA DEL USUARIO

El usuario tiene experiencia con RAGs. Puedes consultar:

1. **andres-soto-web** (`/Users/andressoto/andres-soto-web`)
   - RAG profesional con Supabase + pgvector
   - Patrón de API chat muy similar

2. **tarot-osho-zen** (`/Users/andressoto/tarot-osho-zen`)
   - Python FastAPI + ChromaDB
   - Sistema de regalos/tokens

3. **BigLoI** (`/Users/andressoto/BigLoI`)
   - ETL para datos masivos (500k+)
   - Scrapers de SECOP e INVIMA
   - **MUY ÚTIL** para el scraping de datos públicos

---

## COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Generar embeddings (después de configurar Supabase)
npm run generate-embeddings

# 🆕 SCRAPERS DE DATOS PÚBLICOS
npm run scrape:all              # Ejecutar todos los scrapers
npm run scrape:datos-abiertos   # Datos abiertos Colombia
npm run scrape:secop            # Contratación pública SECOP
npm run scrape:propiedades      # Propiedades y certificados
npm run scrape:integrate        # Integrar al knowledge base
```

---

## NOTAS PARA MI YO DEL FUTURO

1. **El proyecto ya funciona** en localhost:3000, solo faltan las páginas internas
2. **No toques** la configuración de Tailwind/PostCSS, ya está funcionando
3. ✅ **Scraping inteligente implementado** - Ver `scripts/scrapers/`
4. ⚠️ Para **certificados de tradición**: Ver `data/raw/propiedades/GUIA_CERTIFICADOS_TRADICION.md`
5. El padre del usuario tiene acceso a información de la alcaldía como empleado público
6. El usuario está muy motivado con este proyecto - es para su comunidad y su padre
7. 🆕 **Datos reales disponibles**:
   - 310 negocios del barrio (filtrados de 20,038 de Armenia)
   - 73 propiedades horizontales del barrio
   - 1,099 entidades sin ánimo de lucro (incluye JACs)
   - 106 procesos de contratación SECOP recientes

---

## PROMPT DE CONTINUACIÓN SUGERIDO

> "Continuemos con el proyecto RAG de la JAC. Lee el archivo CLAUDE_CONTEXT.md para entender el estado actual. Las prioridades son: (1) terminar configuración de Supabase (ejecutar migraciones), (2) crear las páginas faltantes (/directorio, /historia, /tramites), (3) ejecutar generate-embeddings."

---

## DATOS SCRAPED DISPONIBLES (Resumen ejecutivo)

| Dataset | Registros | Archivo |
|---------|-----------|---------|
| Negocios del barrio | 310 | `data/raw/inventario_barrio/negocios_completo.json` |
| Propiedades horizontales barrio | 73 | `data/raw/propiedades/propiedad_horizontal_barrio.json` |
| Establecimientos Armenia (total) | 20,038 | `data/raw/datos_publicos/establecimientos_comercio_armenia.json` |
| Entidades sin lucro | 1,099 | `data/raw/datos_publicos/entidades_sin_lucro_armenia.json` |
| Prestadores turísticos | 7,358 | `data/raw/datos_publicos/prestadores_turisticos_armenia.json` |
| Procesos SECOP | 106 | `data/raw/datos_publicos/secop_procesos_armenia.json` |

---

*Archivo actualizado el 15 de enero de 2026 - Scraping completado, configurando Supabase.*
