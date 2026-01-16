-- ============================================
-- MIGRACIÓN 001: Configuración de pgvector y tabla de embeddings
-- JAC Barrio San José y El Bosque - Armenia, Quindío
-- ============================================

-- Habilitar extensión pgvector para búsqueda semántica
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla principal de embeddings para RAG
CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536),  -- OpenAI text-embedding-3-small
  metadata JSONB DEFAULT '{}'::jsonb,
  source TEXT NOT NULL,    -- 'inventario', 'datos_publicos', 'tramites', 'eventos', 'historia'
  category TEXT,           -- 'negocio', 'colegio', 'tramite', 'evento', 'infraestructura'
  subcategory TEXT,        -- tipo específico
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice vectorial para búsqueda semántica eficiente
CREATE INDEX IF NOT EXISTS idx_embeddings_vector
ON document_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índices auxiliares para filtrado
CREATE INDEX IF NOT EXISTS idx_embeddings_source ON document_embeddings (source);
CREATE INDEX IF NOT EXISTS idx_embeddings_category ON document_embeddings (category);
CREATE INDEX IF NOT EXISTS idx_embeddings_metadata ON document_embeddings USING gin (metadata);

-- Función de búsqueda semántica general
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  source text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    document_embeddings.source,
    document_embeddings.category,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Función de búsqueda por categoría específica
CREATE OR REPLACE FUNCTION match_by_category (
  query_embedding vector(1536),
  filter_category text,
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  source text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    document_embeddings.source,
    document_embeddings.category,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE
    document_embeddings.category = filter_category
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Función de búsqueda por fuente (source)
CREATE OR REPLACE FUNCTION match_by_source (
  query_embedding vector(1536),
  filter_source text,
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  source text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    document_embeddings.source,
    document_embeddings.category,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE
    document_embeddings.source = filter_source
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RLS (Row Level Security)
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- Política: Lectura pública de embeddings
CREATE POLICY "Embeddings son públicos para lectura"
ON document_embeddings
FOR SELECT
TO public
USING (true);

-- Política: Solo service role puede insertar/actualizar
CREATE POLICY "Solo service role puede modificar embeddings"
ON document_embeddings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
