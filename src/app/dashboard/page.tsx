'use client'

import { useEffect, useState } from 'react'
import { generateAIResponse } from '../../../lib/openai'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { saveProduct } from '../../../lib/firestore'
import { getShopifyProducts } from '../../../lib/shopify'

type Product = {
  id: string
  title: string
  description: string
  price: string
  source: string
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})
  const [originals, setOriginals] = useState<Record<string, Partial<Product>>>({})


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      const firebaseSnapshot = await getDocs(collection(db, 'products'))
      const firebaseProducts: Product[] = []
      firebaseSnapshot.forEach((doc) => {
        const data = doc.data()
        firebaseProducts.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          price: data.price,
          source: 'firebase',
        })
      })
      // Fetch from Shopify
      const shopifyRes = await fetch('/api/shopify/products')
      const shopifyRaw = await shopifyRes.json()

      const shopifyProducts: Product[] = shopifyRaw.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.body_html,
        price: p.variants?.[0]?.price ?? '0.00',
        source: 'shopify',
      }))

      // Merge both
      const combined = [...shopifyProducts, ...firebaseProducts]
      setProducts(combined)
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const handleImproveTitle = async (product: Product) => {
    const prompt = `Improve this product title: "${product.title}". Make it more keyword-rich and compelling.`
    const result = await generateAIResponse(prompt)
    setSuggestions((prev) => ({ ...prev, [product.id]: result || '' }))
  }

  const handleImproveDescription = async (product: Product) => {
    const prompt = `Improve this product description: "${product.description}". Make it persuasive and concise.`
    const result = await generateAIResponse(prompt)
    setSuggestions((prev) => ({ ...prev, [product.id + '_desc']: result || '' }))
  }

  const handleOptimizePrice = async (product: Product) => {
    const prompt = `Suggest an ideal price for this product:\n"${product.title}"\nCurrent Price: ${product.price}`
    const result = await generateAIResponse(prompt)
    setSuggestions((prev) => ({ ...prev, [product.id + '_price']: result || '' }))
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🛍️ Your Products</h1>

      {loading && (
        <p className="text-sm text-gray-500 mb-4">Loading products from Firebase...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-xl p-4 shadow">
            {/* <h2 className="text-lg font-semibold">{product.title}</h2>
            <p className="text-sm text-gray-600">{product.description}</p>
            <p className="text-sm font-medium mt-1">{product.price}</p> */}

            <h2 className="text-lg font-bold">
              {product.title}
              <span className="ml-2 text-xs text-gray-400">
                ({product.source === 'shopify' ? '🛍️ Shopify' : '🔥 Firebase'})
              </span>
            </h2>
            <p>{product.description}</p>
            <p className="mt-1 font-medium">${product.price}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => handleImproveTitle(product)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Improve Title
              </button>
              <button
                onClick={() => handleImproveDescription(product)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Improve Description
              </button>
              <button
                onClick={() => handleOptimizePrice(product)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Optimize Price
              </button>
            </div>

            {suggestions[product.id] && (
              <div className="mt-4 bg-blue-50 p-3 rounded border text-sm">
                <strong className="block text-blue-800">AI Suggested Title:</strong>
                <p className="text-blue-700 mt-1">{suggestions[product.id]}</p>
                <button
                  onClick={() => {
                    if (!originals[product.id]?.title) {
                      setOriginals((prev) => ({
                        ...prev,
                        [product.id]: {
                          ...(prev[product.id] || {}),
                          title: product.title,
                        },
                      }))
                    }
                    product.title = suggestions[product.id]
                    setSuggestions((prev) => ({ ...prev, [product.id]: '' }))
                    saveProduct(product)
                  }}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                >
                  ✅ Apply Title
                </button>
              </div>
            )}

            {suggestions[product.id + '_desc'] && (
              <div className="mt-4 bg-green-50 p-3 rounded border text-sm">
                <strong className="block text-green-800">AI Suggested Description:</strong>
                <p className="text-green-700 mt-1">{suggestions[product.id + '_desc']}</p>
                <button
                  onClick={() => {
                    if (!originals[product.id]?.description) {
                      setOriginals((prev) => ({
                        ...prev,
                        [product.id]: {
                          ...(prev[product.id] || {}),
                          description: product.description,
                        },
                      }))
                    }
                    product.description = suggestions[product.id + '_desc']
                    setSuggestions((prev) => ({ ...prev, [product.id + '_desc']: '' }))
                    saveProduct(product)
                  }}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                >
                  ✅ Apply Description
                </button>
              </div>
            )}

            {suggestions[product.id + '_price'] && (
              <div className="mt-4 bg-yellow-50 p-3 rounded border text-sm">
                <strong className="block text-yellow-800">AI Suggested Price:</strong>
                <p className="text-yellow-700 mt-1">{suggestions[product.id + '_price']}</p>
                <button
                  onClick={() => {
                    if (!originals[product.id]?.price) {
                      setOriginals((prev) => ({
                        ...prev,
                        [product.id]: {
                          ...(prev[product.id] || {}),
                          price: product.price,
                        },
                      }))
                    }
                    product.price = suggestions[product.id + '_price']
                    setSuggestions((prev) => ({ ...prev, [product.id + '_price']: '' }))
                    saveProduct(product)
                  }}
                  className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  ✅ Apply Price
                </button>
              </div>
            )}

            {originals[product.id] && (
              <button
                onClick={() => {
                  if (originals[product.id]?.title) product.title = originals[product.id].title!
                  if (originals[product.id]?.description)
                    product.description = originals[product.id].description!
                  if (originals[product.id]?.price) product.price = originals[product.id].price!
                  setOriginals((prev) => {
                    const updated = { ...prev }
                    delete updated[product.id]
                    return updated
                  })
                  saveProduct(product)
                }}
                className="mt-4 bg-gray-700 text-white px-3 py-1 rounded"
              >
                ↩️ Undo Changes
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
