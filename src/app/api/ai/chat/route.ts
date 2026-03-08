import { streamText, stepCountIs } from 'ai'
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

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return new Response(
      'La IA no está configurada. Contactá al administrador del sistema.',
      { status: 500 }
    )
  }

  const systemPrompt = `Sos el asistente interno de Replay OS, sistema de gestión del centro fitness.
Admin: ${profile?.full_name ?? 'Admin'} | Fecha: ${new Date().toLocaleDateString('es-AR')}
Respondé SIEMPRE en español. Sé conciso y preciso.
IMPORTANTE: Antes de ejecutar cualquier acción de escritura (pagos, cancelaciones, invitaciones, etc.),
mostrá un resumen claro y pedí confirmación explícita del admin.`

  const google = createGoogleGenerativeAI({ apiKey })
  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    tools: agentTools,
    stopWhen: stepCountIs(8),
  })

  void result.text.then(async (text) => {
    if (text && centerId) {
      await supabase.from('ai_messages').insert({
        center_id: centerId,
        role: 'assistant',
        content: text,
      })
    }
  })

  return result.toTextStreamResponse()
}
