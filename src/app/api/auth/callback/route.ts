import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')

  if (!shop || !code) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  })

  const data = await res.json()

  await setDoc(doc(db, 'shops', shop), {
    shop,
    accessToken: data.access_token,
    connectedAt: Date.now(),
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`)
}
