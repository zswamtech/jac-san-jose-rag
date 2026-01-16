-- ============================================
-- MIGRACIÓN 004: Tabla de Trámites JAC
-- JAC Barrio San José y El Bosque - Armenia, Quindío
-- ============================================

CREATE TABLE IF NOT EXISTS tramites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(100),             -- 'certificado', 'solicitud', 'queja', 'afiliacion'
  requisitos JSONB,                   -- Array de requisitos
  documentos_requeridos JSONB,        -- Array de documentos
  pasos JSONB,                        -- Array de pasos
  tiempo_respuesta VARCHAR(100),
  costo DECIMAL(10, 2) DEFAULT 0,
  donde_realizar VARCHAR(255),
  horario_atencion VARCHAR(100),
  contacto_responsable VARCHAR(255),
  telefono_contacto VARCHAR(50),
  email_contacto VARCHAR(255),
  formulario_url VARCHAR(500),
  activo BOOLEAN DEFAULT true,
  orden_display INTEGER DEFAULT 0,     -- Para ordenar en la UI
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tramites_categoria ON tramites (categoria);
CREATE INDEX idx_tramites_activo ON tramites (activo);
CREATE INDEX idx_tramites_orden ON tramites (orden_display);

-- Trigger para updated_at
CREATE TRIGGER update_tramites_updated_at
BEFORE UPDATE ON tramites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;

-- Política: Trámites activos son públicos
CREATE POLICY "Trámites activos son públicos"
ON tramites
FOR SELECT
TO public
USING (activo = true);

-- Política: Administración para service role
CREATE POLICY "Service role administra trámites"
ON tramites
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
