'use client'

import { useEffect, useState } from 'react'
import { generateAIResponse } from '../../../lib/openai'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { saveProduct } from '../../../lib/firestore'
import { getShopifyProducts } from '../../../lib/shopify'
import { setDoc, doc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'

type Product = {
  id: string
  title: string
  description: string
  price: string
  source?: 'firebase' | 'shopify'
  variants?: { id: string; price: string }[]
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})
  const [originals, setOriginals] = useState<Record<string, Partial<Product>>>({})
  const [pendingSuggestion, setPendingSuggestion] = useState<{
    productId: string
    field: 'title' | 'description' | 'price'
    value: string
  } | null>(null)
  const [undoStack, setUndoStack] = useState<
    { productId: string; field: 'title' | 'description' | 'price'; prevValue: string }[]
  >([])
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login') // or /auth or wherever your sign-in is
      } else {
        setAuthChecked(true)
      }
    })

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
        variants: p.variants,
        synced: true,
      }))

      // Merge both
      const combined = [...shopifyProducts, ...firebaseProducts]
      setProducts(combined)
      setLoading(false)
    }

    fetchProducts()
    return () => unsubscribe()
  }, [router])

  if (!authChecked) {
    return (
      <div className="p-8 text-gray-600">
        ⏳ Checking authentication...
      </div>
    )
  }

  const handleImproveTitle = async (product: Product) => {
    const prompt = `Improve this product title: "${product.title}". Make it more keyword-rich and compelling.`
    // const result = await generateAIResponse(prompt)
    // setSuggestions((prev) => ({ ...prev, [product.id]: result || '' }))

    const aiRes = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
    const { result } = await aiRes.json()

    // ✅ Save for confirmation dialog
    setPendingSuggestion({
      productId: product.id,
      field: 'title',
      value: result,
    })
  }

  const handleImproveDescription = async (product: Product) => {
    const prompt = `Improve this product description: "${product.description}". Make it more persuasive, clear, and compelling.`
    const aiRes = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
    const { result } = await aiRes.json()

    // ✅ Save for confirmation dialog
    setPendingSuggestion({
      productId: product.id,
      field: 'description',
      value: result,
    })
  }

  const handleOptimizePrice = async (product: Product) => {
    const prompt = `Suggest a better price for this product based on its description and title:\nTitle: "${product.title}"\nDescription: "${product.description}"\nCurrent Price: ${product.price}`
    const aiRes = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
    const { result } = await aiRes.json()

    // Extract numeric price (safe fallback)
    const match = result.match(/(\d+(\.\d{1,2})?)/)
    const suggestedPrice = match ? parseFloat(match[0]).toFixed(2) : '0.00'
    const variantId = product.variants?.[0]?.id

    if (!variantId) {
      alert('❌ Missing variant ID for price update')
      return
    }
    // ✅ Save for confirmation dialog
    setPendingSuggestion({
      productId: product.id,
      field: 'price',
      value: suggestedPrice,
    })

    // setProducts((prev) =>
    //   prev.map((p) =>
    //     p.id === product.id ? { ...p, price: suggestedPrice } : p
    //   )
    // )
  }

  const fetchShopifyProducts = async () => {
    setLoading(true)

    const res = await fetch('/api/shopify/products')
    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error('❌ Shopify response is not an array')
      return
    }

    const shopifyProducts = data.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.body_html,
      price: p.variants?.[0]?.price ?? '0.00',
      variants: p.variants,
      source: 'shopify',
      synced: true,
    }))

    setProducts(shopifyProducts)
    setLoading(false)

    // Optional Firebase sync backup
    if (Array.isArray(shopifyProducts)) {
      shopifyProducts.forEach((p) => {
        if (p?.id && p?.title) {
          setDoc(doc(db, 'products', p.id.toString()), {
            title: p.title,
            description: p.description,
            price: p.price,
          }, { merge: true })
        }
      })
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🛍️ Your Products</h1>
      <button
        onClick={fetchShopifyProducts}
        className="mb-6 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded shadow"
      >
        🔄 Sync Products from Shopify
      </button>
      {loading && <p className="text-gray-500 italic mb-4">⏳ Syncing with Shopify...</p>}

      {loading && (
        <p className="text-sm text-gray-500 mb-4">Loading products from Firebase...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={`${product.source}-${product.id}`} className="border rounded-xl p-4 shadow">
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

            {pendingSuggestion && (
              <div className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-xl shadow-xl z-50 max-w-sm border border-gray-300">
                <p className="mb-3">
                  <strong>💡 Suggested {pendingSuggestion.field}:</strong>
                  <br />
                  {pendingSuggestion.value}
                </p>
                <div className="flex gap-3">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={async () => {
                      const product = products.find(p => p.id === pendingSuggestion.productId)
                      if (!product) return

                      const isPrice = pendingSuggestion.field === 'price'
                      const value = isPrice
                        ? [
                          {
                            id: product.variants?.[0].id,
                            price: pendingSuggestion.value,
                          },
                        ]
                        : pendingSuggestion.value

                      const field = isPrice ? 'variants' : pendingSuggestion.field === 'description' ? 'body_html' : 'title'

                      await fetch('/api/shopify/update', {
                        method: 'POST',
                        body: JSON.stringify({
                          id: pendingSuggestion.productId,
                          field,
                          value,
                        }),
                      })

                      // Save current value for undo
                      setUndoStack(prev => [
                        ...prev,
                        {
                          productId: product.id,
                          field: pendingSuggestion.field,
                          prevValue: product[pendingSuggestion.field],
                        },
                      ])

                      setProducts((prev) =>
                        prev.map(p =>
                          p.id === pendingSuggestion.productId
                            ? { ...p, [pendingSuggestion.field]: pendingSuggestion.value }
                            : p
                        )
                      )

                      setPendingSuggestion(null)
                    }}
                  >
                    ✅ Apply
                  </button>
                  <button
                    className="bg-gray-300 text-black px-3 py-1 rounded"
                    onClick={() => setPendingSuggestion(null)}
                  >
                    ❌ Cancel
                  </button>
                </div>
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
            {undoStack.some(u => u.productId === product.id) && (
              <button
                onClick={() => {
                  const last = undoStack.find(u => u.productId === product.id)
                  if (!last) return

                  const field = last.field === 'price' ? 'variants' : last.field === 'description' ? 'body_html' : 'title'
                  const value = last.field === 'price'
                    ? [{ id: product.variants?.[0].id, price: last.prevValue }]
                    : last.prevValue

                  // Rollback to Shopify
                  fetch('/api/shopify/update', {
                    method: 'POST',
                    body: JSON.stringify({ id: product.id, field, value }),
                  })

                  // Rollback local UI
                  setProducts(prev =>
                    prev.map(p =>
                      p.id === product.id ? { ...p, [last.field]: last.prevValue } : p
                    )
                  )

                  // Remove from stack
                  setUndoStack(prev => prev.filter(u => u !== last))
                }}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
