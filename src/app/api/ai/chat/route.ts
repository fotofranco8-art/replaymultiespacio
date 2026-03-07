import { streamText } from 'ai'
import { createXai } from '@ai-sdk/xai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { agentTools } from '@/features/ai/tools/agent-tools'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/features/auth/services/auth.actions'

const CENTER_ID = '00000000-0000-0000-0000-000000000001'

interface SimpleMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: SimpleMessage[] }

  const supabase = await createClient()
  const profile = await getProfile()

  const lastUser = messages.at(-1)
  if (lastUser?.role === 'user') {
    await supabase.from('ai_messages').insert({
      center_id: CENTER_ID,
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

  const tryStream = async (useGemini = false) => {
    if (useGemini) {
      const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })
      return streamText({ model: google('gemini-2.0-flash'), ...config })
    }
    const xai = createXai({ apiKey: process.env.XAI_API_KEY! })
    return streamText({ model: xai('grok-3-mini-beta'), ...config })
  }

  try {
    const result = await tryStream(false)
    result.text.then(async (text) => {
      if (text) {
        await supabase.from('ai_messages').insert({
          center_id: CENTER_ID,
          role: 'assistant',
          content: text,
        })
      }
    })
    return result.toTextStreamResponse()
  } catch {
    const result = await tryStream(true)
    result.text.then(async (text) => {
      if (text) {
        await supabase.from('ai_messages').insert({
          center_id: CENTER_ID,
          role: 'assistant',
          content: text,
        })
      }
    })
    return result.toTextStreamResponse()
  }
}
