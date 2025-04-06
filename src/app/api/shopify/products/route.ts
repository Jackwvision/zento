// src/app/api/shopify/products/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const domain = process.env.SHOPIFY_STORE_URL
  const token = process.env.SHOPIFY_ACCESS_TOKEN

  const res = await fetch(`https://${domain}/admin/api/2023-10/products.json`, {
    headers: {
      'X-Shopify-Access-Token': token!,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const error = await res.text()
    return new NextResponse(`Shopify Error: ${res.status} - ${error}`, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json(data.products)
}
