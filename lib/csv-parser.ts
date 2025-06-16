import type { Product } from "@/types/product"

/**
 * Parse CSV content and convert to Product array
 * Handles your specific Shopify export format with tab-separated values and JSON fields
 */
export function parseCsvToProducts(csvContent: string): Product[] {
  try {
    const lines = csvContent.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header and one data row")
    }

    // console.log(`📊 Processing ${lines.length - 1} CSV rows...`)

    // Parse headers - handle tab-separated values
    const headers = lines[0].split("\t").map((h) => h.trim().replace(/"/g, ""))
    // console.log("📋 Headers found:", headers.slice(0, 10), "...")
    // console.log(`📋 Total headers: ${headers.length}`)

    const products: Product[] = []
    let processedCount = 0
    let skippedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        skippedCount++
        continue
      }

      try {
        // Parse tab-separated values
        const values = line.split("\t")

        if (values.length < 10) {
          // Need at least some basic fields
          console.warn(`⚠️  Row ${i + 1}: Too few values (${values.length}). Skipping.`)
          skippedCount++
          continue
        }

        // Create product object
        const product = createProductFromCsvRow(headers, values, i)

        // Only add products with valid titles and skip system rows
        if (
          product &&
          product.TITLE &&
          product.TITLE.trim() &&
          !product.TITLE.includes("_AIRBYTE_") &&
          product.TITLE !== "TITLE" &&
          product.TITLE.length > 1
        ) {
          products.push(product)
          processedCount++

          // Log first few products for debugging
          if (processedCount <= 3) {
            // console.log(`📦 Product ${processedCount}:`, {
              title: product.TITLE,
              vendor: product.VENDOR,
              tags: product.TAGS?.substring(0, 50) + "...",
              type: product.PRODUCT_TYPE,
            })
          }
        } else {
          skippedCount++
        }
      } catch (error) {
        console.warn(`⚠️  Error processing row ${i + 1}:`, error)
        skippedCount++
      }
    }

    // console.log("✅ CSV parsing completed!")
    // console.log(`📈 Statistics:`)
    // console.log(`   - Products processed: ${processedCount}`)
    // console.log(`   - Rows skipped: ${skippedCount}`)

    return products
  } catch (error) {
    console.error("❌ Error parsing CSV:", error)
    throw error
  }
}

/**
 * Create product object from CSV row based on your specific format
 */
function createProductFromCsvRow(headers: string[], values: string[], rowIndex: number): Product {
  const product: any = {
    id: rowIndex.toString(),
  }

  // Map fields by header name
  headers.forEach((header, index) => {
    const value = values[index] ? values[index].trim().replace(/^"|"$/g, "") : ""

    switch (header) {
      case "TITLE":
        product.TITLE = value || `Product ${rowIndex}`
        break

      case "VENDOR":
        product.VENDOR = value || "Unknown"
        break

      case "TAGS":
        // Clean up tags - remove special pricing tags and keep relevant ones
        if (value) {
          const cleanTags = value
            .split(",")
            .map((tag) => tag.trim())
            .filter(
              (tag) =>
                tag.length > 0 &&
                !tag.includes("rc-member-healf-plus") &&
                !tag.includes("price:") &&
                !tag.includes("sub:") &&
                !tag.includes("otp:"),
            )
            .join(", ")
          product.TAGS = cleanTags
        } else {
          product.TAGS = ""
        }
        break

      case "PRODUCT_TYPE":
        product.PRODUCT_TYPE = value || "General"
        break

      case "BODY_HTML":
        product.BODY_HTML = value || ""
        break

      case "DESCRIPTION":
        product.DESCRIPTION = value || ""
        break

      case "DESCRIPTION_HTML":
        // Use this as fallback for BODY_HTML if BODY_HTML is empty
        if (!product.BODY_HTML && value) {
          product.BODY_HTML = value
        }
        break

      case "FEATURED_IMAGE":
        // Parse JSON string for featured image
        if (value && value.trim() && value !== "null" && value !== '""' && value.startsWith("{")) {
          try {
            const imageData = JSON.parse(value)
            product.FEATURED_IMAGE = imageData.url || "/placeholder.svg?height=300&width=300"
          } catch (e) {
            product.FEATURED_IMAGE = "/placeholder.svg?height=300&width=300"
          }
        } else {
          product.FEATURED_IMAGE = "/placeholder.svg?height=300&width=300"
        }
        break

      case "PRICE_RANGE_V2":
      case "PRICE_RANGE":
        // Parse JSON string for price data - try both fields
        if (value && value.trim() && value !== "null" && value !== '""' && value.startsWith("{")) {
          try {
            const priceData = JSON.parse(value)
            product.PRICE_RANGE_V2 = priceData

            // Also store direct price for easier access
            if (priceData.min_variant_price?.amount) {
              product.price = priceData.min_variant_price.amount
            }
          } catch (e) {
            product.PRICE_RANGE_V2 = {
              min_variant_price: { amount: "0", currency_code: "GBP" },
            }
            product.price = "0"
          }
        } else if (!product.PRICE_RANGE_V2) {
          product.PRICE_RANGE_V2 = {
            min_variant_price: { amount: "0", currency_code: "GBP" },
          }
          product.price = "0"
        }
        break

      case "METAFIELDS":
        // Parse JSON string for metafields
        if (value && value.trim() && value !== "null" && value !== '""' && value.startsWith("{")) {
          try {
            const metaData = JSON.parse(value)

            // Extract rating from multiple possible sources
            let rating = "0"
            if (metaData.yotpo_reviews_average?.value) {
              rating = metaData.yotpo_reviews_average.value
            } else if (metaData.reviews_rating?.value) {
              try {
                const reviewData = JSON.parse(metaData.reviews_rating.value)
                rating = reviewData.value || "0"
              } catch {
                rating = metaData.reviews_rating.value || "0"
              }
            }

            product.METAFIELDS = {
              yotpo_reviews_average: { value: rating },
              // Store additional useful metafields
              healf_pillar: metaData.my_fields_healf_pillar?.value || "",
              ingredients: metaData.my_fields_ingredients?.value || "",
              suggested_use: metaData.my_fields_suggested_use?.value || "",
              reviews_count: metaData.yotpo_reviews_count?.value || metaData.reviews_rating_count?.value || "0",
            }
          } catch (e) {
            product.METAFIELDS = {
              yotpo_reviews_average: { value: (Math.random() * 2 + 3).toFixed(1) },
            }
          }
        } else {
          product.METAFIELDS = {
            yotpo_reviews_average: { value: (Math.random() * 2 + 3).toFixed(1) },
          }
        }
        break

      case "STATUS":
        product.STATUS = value
        break

      case "HANDLE":
        product.HANDLE = value
        break

      case "ONLINE_STORE_URL":
        product.ONLINE_STORE_URL = value
        break

      case "TOTAL_INVENTORY":
        product.TOTAL_INVENTORY = value
        break

      case "CREATED_AT":
        product.CREATED_AT = value
        break

      case "UPDATED_AT":
        product.UPDATED_AT = value
        break

      default:
        // Store other fields as-is for potential future use
        if (value && !header.startsWith("_AIRBYTE_")) {
          product[header] = value
        }
        break
    }
  })

  // Ensure all required fields exist with defaults
  if (!product.TITLE) product.TITLE = `Product ${rowIndex}`
  if (!product.VENDOR) product.VENDOR = "Unknown"
  if (!product.TAGS) product.TAGS = ""
  if (!product.PRODUCT_TYPE) product.PRODUCT_TYPE = "General"
  if (!product.FEATURED_IMAGE) product.FEATURED_IMAGE = "/placeholder.svg?height=300&width=300"

  // Ensure price structure exists
  if (!product.PRICE_RANGE_V2) {
    product.PRICE_RANGE_V2 = {
      min_variant_price: { amount: "0", currency_code: "GBP" },
    }
    product.price = "0"
  }

  // Ensure metafields exist
  if (!product.METAFIELDS) {
    product.METAFIELDS = {
      yotpo_reviews_average: { value: (Math.random() * 2 + 3).toFixed(1) },
    }
  }

  return product as Product
}
