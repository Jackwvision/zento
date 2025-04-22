// /app/api/auth/route.ts
import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop')
  if (!shop) return new Response('Missing shop param', { status: 400 })

  const client_id = process.env.SHOPIFY_API_KEY
  const redirect_uri = `https://zento-ai.com/api/auth/callback`
  const scopes = 'read_products,write_products'
  const state = Math.random().toString(36).substring(2) // store this in DB if needed

  const redirectUrl =
    `https://${shop}/admin/oauth/authorize?client_id=${client_id}` +
    `&scope=${scopes}&redirect_uri=${redirect_uri}&state=${state}`

  return redirect(redirectUrl)
}
