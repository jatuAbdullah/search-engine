import { ProductCard } from "./product-card"
import type { Product } from "@/types/product"

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              <div className="bg-gray-200 h-4 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
