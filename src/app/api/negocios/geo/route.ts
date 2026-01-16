import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const lat = parseFloat(searchParams.get('lat') || '4.5360')
  const lon = parseFloat(searchParams.get('lon') || '-75.6775')
  const radio = parseInt(searchParams.get('radio') || '500')
  const limite = parseInt(searchParams.get('limite') || '20')
  const categoria = searchParams.get('categoria')
  
  try {
    // Intentar usar función RPC si existe
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('buscar_negocios_cercanos', {
        lat,
        lon,
        radio_metros: radio,
        limite: limite
      })
    
    if (!rpcError && rpcData) {
      // Filtrar por categoría si se especifica
      let resultados = rpcData
      if (categoria) {
        resultados = rpcData.filter((n: any) => 
          n.categoria?.toLowerCase().includes(categoria.toLowerCase())
        )
      }
      
      return NextResponse.json({
        success: true,
        data: resultados,
        metadata: {
          centro: { lat, lon },
          radio_metros: radio,
          total: resultados.length,
          fuente: 'postgis'
        }
      })
    }
    
    // Fallback: buscar sin función RPC
    const { data: negocios, error } = await supabase
      .from('negocios')
      .select('*')
      .limit(limite)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      data: negocios || [],
      metadata: {
        centro: { lat, lon },
        radio_metros: radio,
        total: negocios?.length || 0,
        fuente: 'fallback',
        nota: 'Búsqueda espacial no disponible, usando fallback'
      }
    })
    
  } catch (error: any) {
    console.error('Error en búsqueda espacial:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error en búsqueda espacial',
      metadata: {
        centro: { lat, lon },
        radio_metros: radio
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tipo = 'cercanos',
      lat,
      lon,
      radio = 500,
      limite = 20,
      bbox,
      cellId
    } = body
    
    let resultado
    
    switch (tipo) {
      case 'cercanos':
        // Buscar negocios cercanos a un punto
        resultado = await supabase.rpc('buscar_negocios_cercanos', {
          lat,
          lon,
          radio_metros: radio,
          limite
        })
        break
        
      case 'celda':
        // Buscar negocios en una celda del Fishnet
        resultado = await supabase.rpc('negocios_en_celda', {
          cell_id_param: cellId
        })
        break
        
      case 'estadisticas':
        // Estadísticas de un área
        if (bbox) {
          resultado = await supabase.rpc('estadisticas_area', {
            lat_min: bbox.south,
            lon_min: bbox.west,
            lat_max: bbox.north,
            lon_max: bbox.east
          })
        }
        break
        
      default:
        return NextResponse.json({
          success: false,
          error: `Tipo de búsqueda no soportado: ${tipo}`
        }, { status: 400 })
    }
    
    if (resultado?.error) {
      throw resultado.error
    }
    
    return NextResponse.json({
      success: true,
      data: resultado?.data,
      tipo,
      metadata: {
        lat,
        lon,
        radio,
        limite
      }
    })
    
  } catch (error: any) {
    console.error('Error en búsqueda espacial POST:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error en búsqueda espacial'
    }, { status: 500 })
  }
}
