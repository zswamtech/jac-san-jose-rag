import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPT } from '@/lib/anthropic'
import { getEmbedding, openai } from '@/lib/openai'
import { searchDocuments } from '@/lib/supabase'

export const runtime = 'edge'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { message, history = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      )
    }

    // 1. Generar embedding del mensaje del usuario
    let ragContext = ''
    let ragSources: string[] = []

    try {
      const embedding = await getEmbedding(message)

      // 2. Buscar documentos relevantes
      const documents = await searchDocuments(embedding, {
        matchThreshold: 0.25,
        matchCount: 8,
      })

      if (documents && documents.length > 0) {
        ragContext = documents
          .map((doc: { source: string; category: string; content: string }) => {
            ragSources.push(doc.source)
            return `[Fuente: ${doc.source} | Categoría: ${doc.category}]\n${doc.content}`
          })
          .join('\n\n---\n\n')
      }
    } catch (ragError) {
      console.error('Error en RAG:', ragError)
      // Continuar sin RAG si hay error
    }

    // 3. Construir el contexto completo
    const contextWithRAG = ragContext
      ? `${SYSTEM_PROMPT}

## INFORMACIÓN DEL RAG (USA ESTO COMO FUENTE PRINCIPAL)
${ragContext}

## INSTRUCCIONES ADICIONALES
- Prioriza la información del RAG sobre tu conocimiento general
- Si la información del RAG no es suficiente, indícalo amablemente
- Siempre sugiere contactar a la JAC si necesitan más detalles`
      : SYSTEM_PROMPT

    // 4. Preparar mensajes para OpenAI GPT-4
    const gptMessages = [
      { role: 'system' as const, content: contextWithRAG },
      ...history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // 5. Llamar a OpenAI GPT-4
    let response: string

    try {
      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        messages: gptMessages,
      })

      response = gptResponse.choices[0]?.message?.content || 'No pude generar una respuesta.'
    } catch (gptError: unknown) {
      console.error('Error con OpenAI:', gptError)

      // Fallback: respuesta genérica
      response = `Disculpa, en este momento tengo dificultades técnicas para procesar tu consulta.

**Mientras tanto, puedes:**
- Llamar a la JAC: +57 300 123 4567
- Visitar la oficina: Lunes a Viernes, 8:00 AM - 12:00 PM
- Enviar un WhatsApp al mismo número

¡Disculpa las molestias!`
    }

    return NextResponse.json({
      response,
      sources: [...new Set(ragSources)],
    })
  } catch (error) {
    console.error('Error general en /api/chat:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
