const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`

export async function generateActionItems(context, existingItems = []) {
  const existingCtx = existingItems.length > 0
    ? `\n\nExisting action items (for context, do not duplicate):\n${existingItems.map((i) => `- ${i.title}`).join('\n')}`
    : ''

  const prompt = `You are a project management assistant. Generate specific, actionable task items.

Project context: ${context}${existingCtx}

Generate 6-8 specific, actionable tasks. Respond ONLY with a valid JSON array, no markdown, no explanation:
[
  {
    "title": "Concise action item title",
    "description": "One or two sentences describing exactly what needs to be done."
  }
]`

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')

  return JSON.parse(text)
}
