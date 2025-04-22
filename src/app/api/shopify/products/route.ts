import { db } from '../../../../../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop')
  if (!shop) return new Response('Missing shop param', { status: 400 })

  const shopRef = doc(db, 'shops', shop)
  const shopSnap = await getDoc(shopRef)

  if (!shopSnap.exists()) {
    return new Response('Shop not authorized', { status: 403 })
  }

  const { access_token } = shopSnap.data()

  const res = await fetch(`https://${shop}/admin/api/2023-10/products.json`, {
    headers: {
      'X-Shopify-Access-Token': access_token,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()
  return Response.json(data)
}
