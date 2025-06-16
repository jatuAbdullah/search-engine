import { describe, it, expect, beforeEach } from "@jest/globals"
import {
  createFuseInstance,
  searchProducts,
  filterProducts,
  sortProducts,
  getUniqueValues,
  getPriceRange,
} from "@/lib/search-utils"
import type { Product, SearchFilters } from "@/types/product"

const mockProducts: Product[] = [
  {
    id: "1",
    TITLE: "Premium Wireless Headphones",
    VENDOR: "AudioTech",
    TAGS: "electronics, audio, wireless",
    BODY_HTML: "<p>High-quality wireless headphones</p>",
    PRODUCT_TYPE: "Electronics",
    PRICE_RANGE_V2: { min_variant_price: { amount: "199.99" } },
    METAFIELDS: { yotpo_reviews_average: { value: "4.5" } },
  },
  {
    id: "2",
    TITLE: "Organic Cotton T-Shirt",
    VENDOR: "EcoWear",
    TAGS: "clothing, organic, cotton",
    BODY_HTML: "<p>Comfortable organic cotton t-shirt</p>",
    PRODUCT_TYPE: "Clothing",
    PRICE_RANGE_V2: { min_variant_price: { amount: "29.99" } },
    METAFIELDS: { yotpo_reviews_average: { value: "4.2" } },
  },
]

describe("Search Utils", () => {
  let fuse: any

  beforeEach(() => {
    fuse = createFuseInstance(mockProducts)
  })

  describe("createFuseInstance", () => {
    it("should create a Fuse instance with correct configuration", () => {
      expect(fuse).toBeDefined()
      expect(fuse.getIndex().docs).toHaveLength(2)
    })
  })

  describe("searchProducts", () => {
    it("should return all products when query is empty", () => {
      const results = searchProducts(fuse, "")
      expect(results).toHaveLength(2)
    })

    it("should return matching products for valid query", () => {
      const results = searchProducts(fuse, "headphones")
      expect(results).toHaveLength(1)
      expect(results[0].TITLE).toBe("Premium Wireless Headphones")
    })

    it("should return empty array for non-matching query", () => {
      const results = searchProducts(fuse, "nonexistent")
      expect(results).toHaveLength(0)
    })
  })

  describe("filterProducts", () => {
    const baseFilters: SearchFilters = {
      vendor: [],
      productType: [],
      tags: [],
      priceRange: { min: 0, max: 1000 },
    }

    it("should return all products with empty filters", () => {
      const results = filterProducts(mockProducts, baseFilters)
      expect(results).toHaveLength(2)
    })

    it("should filter by vendor", () => {
      const filters = { ...baseFilters, vendor: ["AudioTech"] }
      const results = filterProducts(mockProducts, filters)
      expect(results).toHaveLength(1)
      expect(results[0].VENDOR).toBe("AudioTech")
    })

    it("should filter by product type", () => {
      const filters = { ...baseFilters, productType: ["Clothing"] }
      const results = filterProducts(mockProducts, filters)
      expect(results).toHaveLength(1)
      expect(results[0].PRODUCT_TYPE).toBe("Clothing")
    })

    it("should filter by price range", () => {
      const filters = { ...baseFilters, priceRange: { min: 0, max: 50 } }
      const results = filterProducts(mockProducts, filters)
      expect(results).toHaveLength(1)
      expect(results[0].TITLE).toBe("Organic Cotton T-Shirt")
    })
  })

  describe("sortProducts", () => {
    it("should sort by price low to high", () => {
      const results = sortProducts(mockProducts, "price-low")
      expect(results[0].TITLE).toBe("Organic Cotton T-Shirt")
      expect(results[1].TITLE).toBe("Premium Wireless Headphones")
    })

    it("should sort by price high to low", () => {
      const results = sortProducts(mockProducts, "price-high")
      expect(results[0].TITLE).toBe("Premium Wireless Headphones")
      expect(results[1].TITLE).toBe("Organic Cotton T-Shirt")
    })

    it("should sort alphabetically", () => {
      const results = sortProducts(mockProducts, "alphabetical")
      expect(results[0].TITLE).toBe("Organic Cotton T-Shirt")
      expect(results[1].TITLE).toBe("Premium Wireless Headphones")
    })
  })

  describe("getUniqueValues", () => {
    it("should return unique vendors", () => {
      const vendors = getUniqueValues(mockProducts, "VENDOR")
      expect(vendors).toEqual(["AudioTech", "EcoWear"])
    })

    it("should return unique tags", () => {
      const tags = getUniqueValues(mockProducts, "TAGS")
      expect(tags).toContain("electronics")
      expect(tags).toContain("clothing")
    })
  })

  describe("getPriceRange", () => {
    it("should return correct price range", () => {
      const range = getPriceRange(mockProducts)
      expect(range.min).toBe(29)
      expect(range.max).toBe(200)
    })
  })
})
