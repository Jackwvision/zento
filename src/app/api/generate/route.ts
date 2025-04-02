import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.choices[0].message.content
    return NextResponse.json({ result: content })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json({ error: 'OpenAI request failed' }, { status: 500 })
  }
}
