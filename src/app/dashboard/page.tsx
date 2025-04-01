'use client'

import { useState } from 'react'

const mockProducts = [
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

  const connectStore = () => {
    alert('✅ Shopify store connected (simulated)')
    setStoreConnected(true)
  }

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
            <p className="text-sm text-gray-600">{product.description}</p>
            <p className="text-sm font-medium mt-2">{product.price}</p>
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-500 text-white px-3 py-1 rounded">
                Improve Title
              </button>
              <button className="bg-green-500 text-white px-3 py-1 rounded">
                Improve Description
              </button>
              <button className="bg-yellow-500 text-white px-3 py-1 rounded">
                Optimize Price
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
