import { NextResponse } from 'next/server'
import { db } from '../../../../../lib/firebase'
import { getDoc, doc } from 'firebase/firestore'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop')

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 })
  }

  const shopRef = doc(db, 'shops', shop)
  const snap = await getDoc(shopRef)

  if (!snap.exists()) {
    return NextResponse.json({ error: 'Shop not found in Firestore' }, { status: 404 })
  }

  const { accessToken } = snap.data()
  if (!accessToken) {
    return NextResponse.json({ error: 'Access token missing' }, { status: 401 })
  }

  const res = await fetch(`https://${shop}/admin/api/2024-04/products.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('🔴 Shopify API Error:', errorText)
    return NextResponse.json({ error: 'Failed to fetch products', details: errorText }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data.products)
}
