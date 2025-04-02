'use client'

import { useState } from 'react'
import { generateAIResponse } from '../../../lib/openai'

type Product = {
  id: string
  title: string
  description: string
  price: string
}

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Basic Cotton T-Shirt',
    description: 'A soft, comfortable t-shirt for everyday wear.',
    price: '$19.99',
  },
  {
    id: '2',
    title: 'Wireless Bluetooth Earbuds',
    description: 'High-quality earbuds with noise cancellation.',
    price: '$59.99',
  },
]

export default function Dashboard() {
  const [storeConnected, setStoreConnected] = useState(false)
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})

  const connectStore = () => {
    alert('✅ Shopify store connected (simulated)')
    setStoreConnected(true)
  }

  const handleImproveTitle = async (product: Product) => {
    const prompt = `You're an expert e-commerce copywriter. Improve this product title: "${product.title}" (Make it more compelling, keyword-rich, under 70 characters)`
    const result = await generateAIResponse(prompt)
    setSuggestions((prev) => ({ ...prev, [product.id]: result || '' }))
  }

  const handleImproveDescription = async (product: Product) => {
    const prompt = `You're an expert e-commerce copywriter. Improve this product description: "${product.description}". Make it more clear, persuasive, and under 3 sentences.`
    const result = await generateAIResponse(prompt)
    setSuggestions((prev) => ({ ...prev, [product.id + '_desc']: result || '' }))
  }

  const handleOptimizePrice = async (product: Product) => {
    const prompt = `You are an expert in e-commerce pricing strategy. Suggest an ideal competitive price for the following product based on title and category:\n\nProduct: "${product.title}"\nCurrent Price: ${product.price}\n\nRespond ONLY with a dollar amount like "$24.99".`
    const result = await generateAIResponse(prompt)
    setSuggestions((prev) => ({ ...prev, [product.id + '_price']: result || '' }))
  }

  const [originals, setOriginals] = useState<Record<string, Partial<Product>>>({})


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🛍️ Your Products</h1>

      {!storeConnected ? (
        <button
          onClick={connectStore}
          className="bg-purple-600 text-white px-4 py-2 rounded mb-6"
        >
          Connect Shopify Store
        </button>
      ) : (
        <p className="text-green-600 font-medium mb-4">✅ Store Connected</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockProducts.map((product) => (
          <div key={product.id} className="border rounded-xl p-4 shadow">
            <h2 className="text-lg font-semibold">{product.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <p className="text-sm font-medium">{product.price}</p>

            <div className="flex gap-2 mt-4 flex-wrap">
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

              {/* Add other AI buttons later */}
            </div>

            {/* AI Suggested Title */}
            {suggestions[product.id] && (
              <div className="mt-4 bg-blue-50 p-3 rounded border text-sm">
                <strong className="block text-blue-800">AI Suggested Title:</strong>
                <p className="text-blue-700 mt-1">{suggestions[product.id]}</p>
                <button
                  onClick={() => {
                    product.title = suggestions[product.id] // apply
                    setSuggestions((prev) => ({ ...prev, [product.id]: '' })) // clear suggestion
                  }}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                >
                  ✅ Apply Title
                </button>
              </div>
            )}
            {/* AI Suggested Description */}
            {suggestions[product.id + '_desc'] && (
              <div className="mt-4 bg-green-50 p-3 rounded border text-sm">
                <strong className="block text-green-800">AI Suggested Description:</strong>
                <p className="text-green-700 mt-1">{suggestions[product.id + '_desc']}</p>
                <button
                  onClick={() => {
                    product.description = suggestions[product.id + '_desc']
                    setSuggestions((prev) => ({ ...prev, [product.id + '_desc']: '' }))
                  }}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                >
                  ✅ Apply Description
                </button>
              </div>
            )}
            {/* AI Suggested Price */}
            {suggestions[product.id + '_price'] && (
              <div className="mt-4 bg-yellow-50 p-3 rounded border text-sm">
                <strong className="block text-yellow-800">AI Suggested Price:</strong>
                <p className="text-yellow-700 mt-1">{suggestions[product.id + '_price']}</p>
                <button
                  onClick={() => {
                    product.price = suggestions[product.id + '_price']
                    setSuggestions((prev) => ({ ...prev, [product.id + '_price']: '' }))
                  }}
                  className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  ✅ Apply Price
                </button>
              </div>
            )}


          </div>
        ))}
      </div>
    </div>
  )
}
