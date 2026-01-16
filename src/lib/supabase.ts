import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso en el navegador (operaciones públicas)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para uso en el servidor (con service role para operaciones admin)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Tipos para las tablas de la base de datos
export interface Negocio {
  id: string
  nombre: string
  tipo: string
  categoria: string
  descripcion: string | null
  direccion: string
  telefono: string | null
  whatsapp: string | null
  horario_apertura: string | null
  horario_cierre: string | null
  dias_operacion: string | null
  imagen_url: string | null
  propietario: string | null
  afiliado_jac: boolean
  activo: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Evento {
  id: string
  titulo: string
  descripcion: string | null
  tipo: 'misa' | 'reunion_jac' | 'cultural' | 'deportivo' | 'social' | 'fallecimiento' | 'cierre_via' | 'colegio' | 'otro'
  fecha_inicio: string
  fecha_fin: string | null
  hora_inicio: string | null
  hora_fin: string | null
  lugar: string | null
  direccion: string | null
  organizador: string | null
  contacto_telefono: string | null
  estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado'
  recurrente: boolean
  patron_recurrencia: string | null
  imagen_url: string | null
  destacado: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Tramite {
  id: string
  nombre: string
  descripcion: string
  categoria: string | null
  requisitos: string[] | null
  documentos_requeridos: string[] | null
  pasos: string[] | null
  tiempo_respuesta: string | null
  costo: number
  donde_realizar: string | null
  horario_atencion: string | null
  contacto_responsable: string | null
  formulario_url: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface DocumentEmbedding {
  id: string
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  source: string
  category: string | null
  subcategory: string | null
  created_at: string
  updated_at: string
}

// Función para búsqueda semántica
export async function searchDocuments(
  queryEmbedding: number[],
  options: {
    matchThreshold?: number
    matchCount?: number
    category?: string
  } = {}
) {
  const { matchThreshold = 0.25, matchCount = 10, category } = options

  const serverClient = createServerClient()

  if (category) {
    const { data, error } = await serverClient.rpc('match_by_category', {
      query_embedding: queryEmbedding,
      filter_category: category,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error) throw error
    return data
  }

  const { data, error } = await serverClient.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  })

  if (error) throw error
  return data
}
