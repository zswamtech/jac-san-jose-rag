-- ============================================
-- MIGRACIÓN 003: Tabla de Eventos Comunitarios
-- JAC Barrio San José y El Bosque - Armenia, Quindío
-- ============================================

-- Tipos de eventos
CREATE TYPE evento_tipo AS ENUM (
  'misa',
  'reunion_jac',
  'cultural',
  'deportivo',
  'social',
  'fallecimiento',
  'cierre_via',
  'colegio',
  'capacitacion',
  'salud',
  'otro'
);

-- Estados de eventos
CREATE TYPE evento_estado AS ENUM (
  'programado',
  'en_curso',
  'finalizado',
  'cancelado',
  'pospuesto'
);

CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo evento_tipo NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  hora_inicio TIME,
  hora_fin TIME,
  lugar VARCHAR(255),
  direccion VARCHAR(255),
  organizador VARCHAR(255),
  contacto_telefono VARCHAR(50),
  contacto_email VARCHAR(255),
  estado evento_estado DEFAULT 'programado',
  recurrente BOOLEAN DEFAULT false,
  patron_recurrencia VARCHAR(100),    -- 'diario', 'semanal', 'mensual', 'anual'
  imagen_url VARCHAR(500),
  destacado BOOLEAN DEFAULT false,
  requiere_inscripcion BOOLEAN DEFAULT false,
  cupo_maximo INTEGER,
  inscritos_actuales INTEGER DEFAULT 0,
  costo DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Índices
CREATE INDEX idx_eventos_fecha ON eventos (fecha_inicio);
CREATE INDEX idx_eventos_tipo ON eventos (tipo);
CREATE INDEX idx_eventos_estado ON eventos (estado);
CREATE INDEX idx_eventos_destacado ON eventos (destacado);

-- Trigger para updated_at
CREATE TRIGGER update_eventos_updated_at
BEFORE UPDATE ON eventos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Política: Eventos activos son públicos
CREATE POLICY "Eventos son públicos"
ON eventos
FOR SELECT
TO public
USING (estado != 'cancelado');

-- Política: Administración para service role
CREATE POLICY "Service role administra eventos"
ON eventos
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Vista: Próximos eventos
CREATE OR REPLACE VIEW proximos_eventos AS
SELECT *
FROM eventos
WHERE fecha_inicio >= NOW()
  AND estado = 'programado'
ORDER BY fecha_inicio ASC
LIMIT 10;
