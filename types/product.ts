// Minimal, optimized product interface
export interface Product {
  id: string
  title: string
  vendor: string
  category: string
  tags: string
  description: string
  price: number
  currency: string
  image: string
  rating: number
  reviewCount: number
  url: string
  status: string
}

export interface SearchFilters {
  vendors: string[]
  categories: string[]
  tags: string[]
  priceRange: { min: number; max: number }
  status: string[] // <- Add this
}


export interface SortOption {
  value: string
  label: string
}

export type SortType = "relevance" | "price-low" | "price-high" | "alphabetical"

export interface SearchResult {
  products: Product[]
  total: number
  hasMore: boolean
  page: number
}
