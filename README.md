# 🏘️ RAG Comunitario - JAC San José y El Bosque

Sistema de información inteligente para la **Junta de Acción Comunal (JAC)** del Barrio San José y El Bosque en **Armenia, Quindío, Colombia**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 Visión del Proyecto

Crear el **primer RAG comunitario de Colombia** para Juntas de Acción Comunal, sirviendo como modelo replicable para otras comunidades del país.

### ¿Qué hace este sistema?

- 🤖 **Chatbot inteligente** que responde preguntas sobre el barrio
- 📒 **Directorio de negocios** con 310+ establecimientos registrados
- 📅 **Calendario de eventos** comunitarios
- 📋 **Guía de trámites** de la JAC
- 📜 **Historia del barrio** con lugares emblemáticos

---

## 🏛️ Sobre el Barrio

El **Barrio San José y El Bosque** es uno de los más emblemáticos de Armenia:

| Característica | Detalle |
|----------------|---------|
| 🏟️ **Estadio Centenario** | El primer estadio de Armenia, donde Deportes Quindío ganó su primera estrella |
| 🌲 **El Bosque** | Reserva natural que da nombre al barrio |
| 🏛️ **Antiguo Batallón** | Hoy convertido en conjunto residencial |
| 🐂 **Plaza de Toros** | Dentro del bosque (inactiva) |
| 🏫 **Educación** | 1 colegio público grande + 3 privados |
| 🛒 **Comercio** | 310 negocios registrados |

---

## 🚀 Tecnologías

| Componente | Tecnología |
|------------|------------|
| **Frontend** | Next.js 16 (App Router) |
| **Estilos** | Tailwind CSS 3.4 |
| **Base de Datos** | Supabase (PostgreSQL + pgvector) |
| **Embeddings** | OpenAI `text-embedding-3-small` |
| **LLM** | OpenAI `gpt-4o-mini` |
| **Animaciones** | Framer Motion |

---

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- API Key de [OpenAI](https://platform.openai.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/zswamtech/jac-san-jose-rag.git
cd jac-san-jose-rag
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` basado en `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Configura las siguientes variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# OpenAI
OPENAI_API_KEY=sk-proj-...
```

### 4. Configurar Supabase

Ejecuta las migraciones en el SQL Editor de Supabase:

```sql
-- 1. Habilitar pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ejecutar los archivos en supabase/migrations/ en orden:
-- 001_setup_pgvector.sql
-- 002_create_negocios.sql
-- 003_create_eventos.sql
-- 004_create_tramites.sql
-- 005_create_noticias.sql
```

### 5. Generar embeddings

```bash
# Datos base (historia, trámites, colegios)
npm run generate-embeddings

# Datos scraped (310 negocios, 73 propiedades)
npm run index:negocios
```

### 6. Iniciar el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 📊 Datos Disponibles

El sistema incluye datos públicos reales obtenidos de fuentes oficiales:

| Dataset | Registros | Fuente |
|---------|-----------|--------|
| Negocios del barrio | 310 | datos.gov.co |
| Propiedades horizontales | 73 | datos.gov.co |
| Establecimientos Armenia | 20,038 | Cámara de Comercio |
| Entidades sin lucro | 1,099 | datos.gov.co |
| Procesos SECOP | 106 | SECOP II |

### Scrapers incluidos

```bash
npm run scrape:all            # Ejecutar todos
npm run scrape:datos-abiertos # Datos abiertos Colombia
npm run scrape:secop          # Contratación pública
npm run scrape:propiedades    # Propiedades
npm run scrape:integrate      # Integrar al knowledge base
```

---

## 🗂️ Estructura del Proyecto

```
jac-san-jose-rag/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Página principal
│   │   ├── api/chat/route.ts     # API RAG
│   │   ├── directorio/           # Directorio de negocios
│   │   ├── eventos/              # Calendario de eventos
│   │   ├── tramites/             # Trámites JAC
│   │   └── historia/             # Historia del barrio
│   ├── components/
│   │   ├── chat/JACChat.tsx      # Componente de chat
│   │   ├── layout/               # Header, Footer
│   │   └── ui/                   # Componentes reutilizables
│   └── lib/
│       ├── supabase.ts           # Cliente + búsqueda vectorial
│       └── openai.ts             # Embeddings + Chat
├── data/raw/
│   ├── inventario_barrio/        # Negocios, colegios, etc.
│   ├── knowledge_base/           # Historia, trámites
│   └── datos_publicos/           # Datos scraped
├── scripts/
│   ├── generate-embeddings.ts    # Ingesta de datos
│   └── scrapers/                 # Scrapers de datos públicos
└── supabase/migrations/          # Esquema de base de datos
```

---

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run generate-embeddings` | Indexa datos base |
| `npm run index:negocios` | Indexa datos scraped |
| `npm run scrape:all` | Ejecuta todos los scrapers |

---

## 🤝 Contribuir

Este proyecto está diseñado para ser replicable por otras JACs de Colombia. Si deseas adaptarlo para tu comunidad:

1. Fork el repositorio
2. Modifica los datos en `data/raw/`
3. Actualiza el `SYSTEM_PROMPT` en `src/lib/anthropic.ts`
4. Genera nuevos embeddings
5. ¡Despliega tu propia versión!

---

## 📄 Licencia

MIT © 2026 - Desarrollado con ❤️ para la comunidad del Barrio San José y El Bosque

---

## 👥 Créditos

- **Desarrollo**: Andrés Soto
- **Concepto**: JAC Barrio San José y El Bosque
- **Datos**: [datos.gov.co](https://datos.gov.co), SECOP II, Cámara de Comercio de Armenia

---

<p align="center">
  <strong>🇨🇴 Hecho en Colombia para las comunidades colombianas</strong>
</p>
