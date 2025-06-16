import Fuse from "fuse.js"
import type { Product, SearchFilters, SortType } from "@/types/product"

export const fuseOptions: Fuse.IFuseOptions<Product> = {
  keys: [
    { name: "TITLE", weight: 0.4 },
    { name: "TAGS", weight: 0.3 },
    { name: "BODY_HTML", weight: 0.15 },
    { name: "DESCRIPTION", weight: 0.1 },
    { name: "VENDOR", weight: 0.05 },
  ],
  threshold: 0.4, // Good balance - not too strict, not too loose
  includeScore: true,
  minMatchCharLength: 1,
  ignoreLocation: true,
  findAllMatches: true,
}

export function createFuseInstance(products: Product[]): Fuse<Product> {
  // console.log(`🔍 Creating Fuse instance with ${products.length} products`)
  return new Fuse(products, fuseOptions)
}

export function searchProducts(fuse: Fuse<Product>, query: string): Product[] {
  if (!query.trim()) {
    return fuse.getIndex().docs as Product[]
  }

  // console.log(`🔍 Searching for: "${query}"`)

  const results = fuse.search(query)
  // console.log(`🔍 Found ${results.length} results`)

  // If no results with Fuse, try simple fallback
  if (results.length === 0) {
    // console.log("🔍 Trying fallback search...")
    const allProducts = fuse.getIndex().docs as Product[]
    const fallbackResults = allProducts.filter((product) => {
      const searchTerm = query.toLowerCase()
      return (
        (product.TITLE && product.TITLE.toLowerCase().includes(searchTerm)) ||
        (product.TAGS && product.TAGS.toLowerCase().includes(searchTerm)) ||
        (product.VENDOR && product.VENDOR.toLowerCase().includes(searchTerm)) ||
        (product.PRODUCT_TYPE && product.PRODUCT_TYPE.toLowerCase().includes(searchTerm))
      )
    })

    // console.log(`🔍 Fallback found: ${fallbackResults.length} results`)
    return fallbackResults
  }

  return results.map((result) => result.item)
}

export function filterProducts(products: Product[], filters: SearchFilters): Product[] {
  return products.filter((product) => {
    // Vendor filter
    if (filters.vendor.length > 0 && !filters.vendor.includes(product.VENDOR)) {
      return false
    }

    // Product type filter
    if (filters.productType.length > 0 && !filters.productType.includes(product.PRODUCT_TYPE)) {
      return false
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const productTags = (product.TAGS || "")
        .toLowerCase()
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      const hasMatchingTag = filters.tags.some((filterTag) =>
        productTags.some(
          (productTag) => productTag.includes(filterTag.toLowerCase()) || filterTag.toLowerCase().includes(productTag),
        ),
      )
      if (!hasMatchingTag) {
        return false
      }
    }

    // Price range filter
    const price = getProductPrice(product)
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      return false
    }

    return true
  })
}

export function sortProducts(products: Product[], sortType: SortType): Product[] {
  const sortedProducts = [...products]

  switch (sortType) {
    case "price-low":
      return sortedProducts.sort((a, b) => getProductPrice(a) - getProductPrice(b))

    case "price-high":
      return sortedProducts.sort((a, b) => getProductPrice(b) - getProductPrice(a))

    case "alphabetical":
      return sortedProducts.sort((a, b) => (a.TITLE || "").localeCompare(b.TITLE || ""))

    case "rating":
      return sortedProducts.sort((a, b) => {
        const ratingA = getProductRating(a)
        const ratingB = getProductRating(b)
        return ratingB - ratingA
      })

    default:
      return sortedProducts
  }
}

export function getUniqueValues(products: Product[], key: keyof Product): string[] {
  const values = products.flatMap((product) => {
    const value = product[key]
    if (key === "TAGS" && typeof value === "string") {
      return value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    }
    return typeof value === "string" && value ? [value] : []
  })

  return Array.from(new Set(values)).filter(Boolean).sort()
}

export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (!products || products.length === 0) {
    return { min: 0, max: 1000 }
  }

  const prices = products.map((product) => getProductPrice(product)).filter((price) => price > 0)

  if (prices.length === 0) {
    return { min: 0, max: 1000 }
  }

  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  }
}

// Helper function to safely get product price
export function getProductPrice(product: Product): number {
  try {
    if (product.PRICE_RANGE_V2?.min_variant_price?.amount) {
      const amount = product.PRICE_RANGE_V2.min_variant_price.amount
      const price = typeof amount === "string" ? Number.parseFloat(amount) : Number(amount)
      if (!isNaN(price) && price > 0) {
        return price
      }
    }
    return 0
  } catch (error) {
    return 0
  }
}

// Helper function to safely get product rating
export function getProductRating(product: Product): number {
  try {
    if (product.METAFIELDS?.yotpo_reviews_average?.value) {
      const rating = Number.parseFloat(product.METAFIELDS.yotpo_reviews_average.value)
      return isNaN(rating) ? 0 : rating
    }
    return 0
  } catch (error) {
    return 0
  }
}
