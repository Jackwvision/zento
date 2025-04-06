const domain = process.env.SHOPIFY_STORE_URL
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

export async function getShopifyProducts() {
  console.log('ENV domain =', process.env.SHOPIFY_STORE_URL)
  const res = await fetch(`https://${domain}/admin/api/2023-10/products.json`, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': accessToken!,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Shopify API Error: ${res.status}`)
  }

  const data = await res.json()
  return data.products
}
