"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SearchInput } from "@/components/search-input"
import { Filters } from "@/components/filters"
import { SortDropdown } from "@/components/sort-dropdown"
import { ProductGrid } from "@/components/product-grid"
import { Pagination } from "@/components/pagination"
import { EmptyState } from "@/components/empty-state"
import { Search, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductSearch } from "@/hooks/useProductSearch"
import type { Product } from "@/types/product"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load products from static JSON or fallback to sample data
useEffect(() => {
  async function loadProducts() {
    try {
      // console.log("🚀 Starting product load...")
      setLoading(true)
      setError(null)

      const response = await fetch("/products.json")
      // console.log("📡 Fetched /products.json")

      if (!response.ok) {
        throw new Error("Failed to fetch products.json")
      }

      const text = await response.text()
       // console.log("📦 Raw response received")

      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        throw new Error("Invalid JSON: HTML content detected")
      }

      let data: Product[]
      try {
        data = JSON.parse(text)
        // console.log("✅ Parsed JSON successfully")
      } catch (parseError) {
        throw new Error("Invalid JSON format")
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No products found in JSON")
      }

      setProducts(data)
      // console.log(`✅ Loaded ${data.length} products from JSON`)
    } catch (err) {
      console.error("❌ Failed to load products:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
      // console.log("🏁 Finished loading")
    }
  }

  loadProducts()
}, [])


  // Use the optimized search hook
  const {
    query,
    filters,
    sortType,
    currentPage,
    results,
    filterOptions,
    setQuery,
    setFilters,
    setSortType,
    setCurrentPage,
    clearFilters,
    hasActiveFilters,
  } = useProductSearch(products)

  // Show preprocessing needed state
  if (error === "PREPROCESSING_NEEDED") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <Play className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Setup Required</h2>
              <p className="text-blue-700 mb-6">
                Run the preprocessing script to convert your CSV data to optimized JSON format.
              </p>

              <div className="bg-white border border-blue-200 rounded-lg p-4 text-left mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Quick Setup:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Click the "Scripts" tab in the code editor</li>
                  <li>Run the "preprocess-csv.js" script</li>
                  <li>Wait for the conversion to complete</li>
                  <li>The script will create public/products.json</li>
                  <li>Refresh this page</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Refresh After Setup
                </Button>

                <div className="text-xs text-blue-600 bg-blue-100 rounded p-3">
                  <p>
                    <strong>What happens:</strong>
                  </p>
                  <p>• Fetches your CSV data from the provided URL</p>
                  <p>• Converts it to optimized JSON format</p>
                  <p>• Creates public/products.json for lightning-fast search</p>
                  <p>• One-time setup for maximum performance! ⚡</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Products</h2>
            <p className="text-gray-600">Initializing search engine...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Products</h2>
              <p className="text-red-700 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <SearchInput value={query} onChange={setQuery} placeholder="Search products, brands, or keywords..." />
          </div>

          {products.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-600">
              Search through {products.length.toLocaleString()} products
            </div>
          )}
        </div>

        {/* No search performed yet */}
        {!query && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Searching</h2>
            <p className="text-gray-600 mb-8">
              Enter a product name, brand, or keyword to find what you're looking for
            </p>

            <div className="text-sm text-gray-500">
              <p className="mb-2">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Vimergy", "Barley Grass", "Supplements", "Organic", "Vitamins"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      
      {/* Search Results */}
{query && (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Filters Sidebar */}
    <aside className="lg:col-span-1">
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={filterOptions}
      />
    </aside>

    {/* Main Content */}
    <div className="lg:col-span-3 space-y-6">
      {/* Results Header */}
      {results.total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {results.total} {results.total === 1 ? "Product" : "Products"}
            </h2>
            <span className="text-sm text-gray-600">for "{query}"</span>
          </div>

          <SortDropdown value={sortType} onChange={setSortType} />
        </div>
      )}

      {/* Products Grid */}
      {results.products.length > 0 ? (
        <>
          <ProductGrid products={results.products} />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={results.total}
            itemsPerPage={20}
            onPageChange={setCurrentPage}
            hasMore={results.hasMore}
          />
        </>
      ) : results.total > 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
      ) : (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            No products match your search for "{query}". Try different keywords.
          </p>
        </div>
      )}
    </div>
  </div>
)}

      </main>
    </div>
  )
}

// Add CSV parsing function for fallback
async function parseCsvToProducts(csvContent: string): Promise<Product[]> {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  if (lines.length < 2) throw new Error("Invalid CSV")

  const headers = lines[0].split("\t").map((h) => h.trim().replace(/"/g, ""))
  const products: Product[] = []

  for (let i = 1; i < Math.min(lines.length, 1000); i++) {
    // Limit to 1000 for performance
    const values = lines[i].split("\t")
    if (values.length < 10) continue

    try {
      const product = extractProductFromRow(headers, values, i)
      if (product && product.title && product.title.length > 1) {
        products.push(product)
      }
    } catch (error) {
      // Skip invalid rows
    }
  }

  return products
}

function extractProductFromRow(headers: string[], values: string[], index: number): Product | null {
  const product: any = { id: index.toString() }

  headers.forEach((header, i) => {
    const value = values[i]?.trim().replace(/^"|"$/g, "") || ""

    switch (header) {
      case "TITLE":
        product.title = value || `Product ${index}`
        break
      case "VENDOR":
        product.vendor = value || "Unknown"
        break
      case "PRODUCT_TYPE":
        product.category = value || "General"
        break
      case "TAGS":
        product.tags = value
          .split(",")
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0 && !tag.includes("price:"))
          .join(" ")
        break
      case "DESCRIPTION":
      case "BODY_HTML":
        if (!product.description && value) {
          product.description = value
            .replace(/<[^>]*>/g, " ")
            .trim()
            .substring(0, 200)
        }
        break
      case "PRICE_RANGE_V2":
        if (value && value.startsWith("{")) {
          try {
            const priceData = JSON.parse(value)
            product.price = Number.parseFloat(priceData.min_variant_price?.amount || 0)
            product.currency = priceData.min_variant_price?.currency_code || "GBP"
          } catch (e) {
            product.price = 0
            product.currency = "GBP"
          }
        }
        break
      case "FEATURED_IMAGE":
        if (value && value.startsWith("{")) {
          try {
            const imageData = JSON.parse(value)
            product.image = imageData.url || "/placeholder.svg?height=300&width=300"
          } catch (e) {
            product.image = "/placeholder.svg?height=300&width=300"
          }
        }
        break
      case "METAFIELDS":
        if (value && value.startsWith("{")) {
          try {
            const metaData = JSON.parse(value)
            product.rating = Number.parseFloat(metaData.yotpo_reviews_average?.value || 0)
            product.reviewCount = Number.parseInt(metaData.yotpo_reviews_count?.value || 0)
          } catch (e) {
            product.rating = 0
            product.reviewCount = 0
          }
        }
        break
      case "ONLINE_STORE_URL":
        product.url = value
        break
    }
  })

  // Set defaults
  if (!product.title) return null
  if (!product.vendor) product.vendor = "Unknown"
  if (!product.category) product.category = "General"
  if (!product.tags) product.tags = ""
  if (!product.description) product.description = ""
  if (!product.price) product.price = 0
  if (!product.currency) product.currency = "GBP"
  if (!product.image) product.image = "/placeholder.svg?height=300&width=300"
  if (!product.rating) product.rating = 0
  if (!product.reviewCount) product.reviewCount = 0
  if (!product.url) product.url = ""

  return product as Product
}
