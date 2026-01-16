'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

const quickActions = [
  { label: 'Panaderías', prompt: '¿Cuáles son las mejores panaderías del barrio?' },
  { label: 'Eventos', prompt: '¿Qué eventos hay próximamente en el barrio?' },
  { label: 'Trámites JAC', prompt: '¿Cómo obtengo un certificado de residencia?' },
  { label: 'Horario misas', prompt: '¿A qué hora son las misas de la iglesia?' },
  { label: 'Historia estadio', prompt: '¿Cuál es la historia del estadio del barrio?' },
  { label: 'Colegios', prompt: '¿Qué colegios hay en el barrio San José?' },
]

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: `**Bienvenido al Asistente de la JAC San José y El Bosque**

Soy tu asistente virtual comunitario. Estoy aquí para ayudarte con información sobre nuestro barrio en Armenia, Quindío.

**Puedo ayudarte con:**
- Directorio de negocios (panaderías, restaurantes, servicios)
- Eventos y actividades comunitarias
- Trámites de la JAC (certificados, afiliación, quejas)
- Historia del barrio (estadio, batallón, plaza de toros)
- Información de colegios y Confenalco

*¿En qué puedo ayudarte hoy?*`,
  timestamp: new Date(),
}

export default function JACChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo o contacta directamente a la JAC.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="bg-verde-jac-500 text-white px-4 py-3 flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-semibold">Asistente JAC</h2>
          <p className="text-xs text-verde-jac-100">San José y El Bosque</p>
        </div>
        <div className="ml-auto flex items-center space-x-1 text-verde-jac-100">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs">IA</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[85%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-verde-jac-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-verde-jac-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <div
                    className={`text-sm prose prose-sm max-w-none ${
                      message.role === 'user' ? 'prose-invert' : ''
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br />')
                        .replace(/- /g, '• '),
                    }}
                  />
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Fuentes: {message.sources.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-verde-jac-500" />
              <span className="text-sm text-gray-500">Pensando...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Preguntas frecuentes:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:border-verde-jac-500 hover:text-verde-jac-500 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-verde-jac-500 focus:border-transparent outline-none transition-all text-sm text-gray-900 bg-white placeholder-gray-400"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-verde-jac-500 text-white rounded-xl hover:bg-verde-jac-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
