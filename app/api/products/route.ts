import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { createFuseInstance, searchProducts } from "@/lib/search-utils"
import type { Product } from "@/types/product"

// Cache the products to avoid re-reading JSON on every request
let cachedProducts: Product[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getProducts(): Promise<Product[]> {
  // Check if we have valid cached data
  if (cachedProducts && Date.now() - cacheTimestamp < CACHE_DURATION) {
    // console.log(`📋 Using cached data: ${cachedProducts.length} products`)
    return cachedProducts
  }

  try {
    // Try to read the JSON file
    const jsonPath = join(process.cwd(), "data", "products.json")

    if (!existsSync(jsonPath)) {
      throw new Error("products.json not found. Please run the CSV conversion script first.")
    }

    // console.log("📖 Reading products.json...")
    const jsonContent = readFileSync(jsonPath, "utf8")
    const products: Product[] = JSON.parse(jsonContent)

    // console.log(`✅ Loaded ${products.length} products from JSON`)

    // Debug: Log first product
    if (products.length > 0) {
      /*
       console.log("📦 Sample product:", {
        title: products[0].TITLE,
        vendor: products[0].VENDOR,
        tags: products[0].TAGS?.substring(0, 50),
        price: products[0].PRICE_RANGE_V2?.min_variant_price?.amount,
      })
        */
    }

    // Cache the results
    cachedProducts = products
    cacheTimestamp = Date.now()

    return products
  } catch (error) {
    console.error("❌ Error loading products:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    // console.log(`🔍 Search request: "${query}"`)

    // If no search query, return empty results
    if (!query.trim()) {
      return NextResponse.json({
        products: [],
        query: "",
        totalProducts: 0,
        message: "Enter a search term to find products",
      })
    }

    // Get products from JSON
    const allProducts = await getProducts()

    if (allProducts.length === 0) {
      // console.log("❌ No products in database")
      return NextResponse.json({
        products: [],
        query,
        totalProducts: 0,
        message: "No products found in database. Please run the CSV conversion script.",
      })
    }

    // console.log(`📊 Searching through ${allProducts.length} products`)

    // Create Fuse instance and search
    const fuse = createFuseInstance(allProducts)
    const searchResults = searchProducts(fuse, query)

    // console.log(`✅ Found ${searchResults.length} results for "${query}"`)

    return NextResponse.json({
      products: searchResults,
      query,
      totalProducts: searchResults.length,
      totalInDatabase: allProducts.length,
      searchTime: Date.now(),
    })
  } catch (error) {
    console.error("❌ Error searching products:", error)

    return NextResponse.json(
      {
        products: [],
        query: "",
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        instructions: [
          "1. Run the CSV conversion script in the Scripts section",
          "2. This will create data/products.json",
          "3. Then try searching again",
        ],
      },
      { status: 500 },
    )
  }
}
