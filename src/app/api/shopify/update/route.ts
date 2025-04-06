import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { id, field, value } = await req.json()

  if (!id || !field || !value) {
    return NextResponse.json({ error: 'Missing id, field, or value' }, { status: 400 })
  }

  const shopifyDomain = process.env.SHOPIFY_STORE_URL
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

  try {
    const res = await fetch(`https://${shopifyDomain}/admin/api/2023-10/products/${id}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken!,
      },
      body: JSON.stringify({
        product: {
          id,
          [field]: value,
        },
      }),
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Shopify update failed', err)
    return NextResponse.json({ error: 'Shopify update failed' }, { status: 500 })
  }
}
