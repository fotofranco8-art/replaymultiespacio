import { streamText } from 'ai'
import { createXai } from '@ai-sdk/xai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { agentTools } from '@/features/ai/tools/agent-tools'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/features/auth/services/auth.actions'

interface SimpleMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: SimpleMessage[] }

  const supabase = await createClient()
  const profile = await getProfile()
  const centerId = profile?.center_id

  const lastUser = messages.at(-1)
  if (lastUser?.role === 'user' && centerId) {
    await supabase.from('ai_messages').insert({
      center_id: centerId,
      role: 'user',
      content: lastUser.content,
    })
  }

  const systemPrompt = `Sos el asistente interno de Replay OS, sistema de gestión del centro fitness.
Admin: ${profile?.full_name ?? 'Admin'} | Fecha: ${new Date().toLocaleDateString('es-AR')}
Respondé SIEMPRE en español. Sé conciso y preciso.
IMPORTANTE: Antes de ejecutar cualquier acción de escritura (pagos, cancelaciones, invitaciones, etc.),
mostrá un resumen claro y pedí confirmación explícita del admin.`

  const config = {
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    tools: agentTools,
    maxSteps: 8,
  }

  const saveText = async (text: string) => {
    if (text && centerId) {
      await supabase.from('ai_messages').insert({
        center_id: centerId,
        role: 'assistant',
        content: text,
      })
    }
  }

  // Try Gemini first (stable), fallback to xAI
  try {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })
    const result = streamText({ model: google('gemini-2.0-flash'), ...config })
    void result.text.then(saveText)
    return result.toTextStreamResponse()
  } catch {
    try {
      const xai = createXai({ apiKey: process.env.XAI_API_KEY! })
      const result = streamText({ model: xai('grok-3-mini-beta'), ...config })
      void result.text.then(saveText)
      return result.toTextStreamResponse()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error del servidor de IA'
      return new Response(msg, { status: 500 })
    }
  }
}
