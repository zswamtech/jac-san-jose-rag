-- ============================================
-- MIGRACIÓN 002: Tabla de Negocios del Barrio
-- JAC Barrio San José y El Bosque - Armenia, Quindío
-- ============================================

CREATE TABLE IF NOT EXISTS negocios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,        -- 'panaderia', 'ferreteria', 'restaurante', etc.
  categoria VARCHAR(100),             -- 'comercio', 'servicios', 'industria', 'gastronomia'
  descripcion TEXT,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  sitio_web VARCHAR(500),
  horario_apertura TIME,
  horario_cierre TIME,
  dias_operacion VARCHAR(100),        -- 'L-V', 'L-S', 'L-D', etc.
  ubicacion_lat DECIMAL(10, 8),       -- Latitud GPS
  ubicacion_lng DECIMAL(11, 8),       -- Longitud GPS
  imagen_url VARCHAR(500),
  logo_url VARCHAR(500),
  propietario VARCHAR(255),
  afiliado_jac BOOLEAN DEFAULT false,
  verificado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,  -- Datos adicionales (productos, servicios, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda eficiente
CREATE INDEX idx_negocios_tipo ON negocios (tipo);
CREATE INDEX idx_negocios_categoria ON negocios (categoria);
CREATE INDEX idx_negocios_activo ON negocios (activo);
CREATE INDEX idx_negocios_afiliado ON negocios (afiliado_jac);
CREATE INDEX idx_negocios_nombre ON negocios USING gin (to_tsvector('spanish', nombre));

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_negocios_updated_at
BEFORE UPDATE ON negocios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;

-- Política: Lectura pública
CREATE POLICY "Negocios activos son públicos"
ON negocios
FOR SELECT
TO public
USING (activo = true);

-- Política: Administración completa para service role
CREATE POLICY "Service role administra negocios"
ON negocios
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
