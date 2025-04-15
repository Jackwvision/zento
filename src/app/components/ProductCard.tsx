'use client'

import { Button } from './ui/button'

export interface ProductCardProps {
  title: string
  description: string
  price?: string
}

export default function ProductCard({ title, description, price }: ProductCardProps) {
  return (
    <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl p-6 text-white shadow hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      {price && <p className="text-base font-medium text-gray-200 mb-4">${price}</p>}
      <div className="flex flex-wrap gap-2">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Improve Title</Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white">Improve Description</Button>
        {price && (
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
            Optimize Price
          </Button>
        )}
      </div>
    </div>
  )
}
