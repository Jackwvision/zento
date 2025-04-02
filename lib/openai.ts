export async function generateAIResponse(prompt: string): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'AI generation failed')
  }

  return data.result
}
