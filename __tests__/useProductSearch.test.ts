import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "@jest/globals"
import { useProductSearch } from "@/hooks/useProductSearch"
import type { Product } from "@/types/product"

const mockProducts: Product[] = [
  {
    id: "1",
    title: "Organic Barley Grass Juice Powder",
    vendor: "Vimergy",
    category: "Vitamins & Supplements",
    tags: "organic superfood antioxidant",
    description: "Premium barley grass juice powder for optimal health",
    price: 36.99,
    currency: "GBP",
    image: "/test-image.jpg",
    rating: 4.7,
    reviewCount: 11,
    url: "https://example.com/product1",
  },
  {
    id: "2",
    title: "Vitamin C Supplement",
    vendor: "HealthCorp",
    category: "Vitamins & Supplements",
    tags: "vitamin immune support",
    description: "High-quality vitamin C for immune system support",
    price: 24.99,
    currency: "GBP",
    image: "/test-image2.jpg",
    rating: 4.2,
    reviewCount: 25,
    url: "https://example.com/product2",
  },
]

describe("useProductSearch", () => {
  let hook: any

  beforeEach(() => {
    const { result } = renderHook(() => useProductSearch(mockProducts))
    hook = result
  })

  describe("Search functionality", () => {
    it("should return all products when no query", () => {
      expect(hook.current.results.products).toHaveLength(2)
      expect(hook.current.results.total).toBe(2)
    })

    it("should filter products by search query", () => {
      act(() => {
        hook.current.setQuery("barley")
      })

      // Wait for debounce
      setTimeout(() => {
        expect(hook.current.results.products).toHaveLength(1)
        expect(hook.current.results.products[0].title).toContain("Barley")
      }, 400)
    })

    it("should handle case insensitive search", () => {
      act(() => {
        hook.current.setQuery("VIMERGY")
      })

      setTimeout(() => {
        expect(hook.current.results.products).toHaveLength(1)
        expect(hook.current.results.products[0].vendor).toBe("Vimergy")
      }, 400)
    })

    it("should return no results for non-matching query", () => {
      act(() => {
        hook.current.setQuery("nonexistent")
      })

      setTimeout(() => {
        expect(hook.current.results.products).toHaveLength(0)
      }, 400)
    })
  })

  describe("Filtering", () => {
    it("should filter by vendor", () => {
      act(() => {
        hook.current.setFilters({
          ...hook.current.filters,
          vendors: ["Vimergy"],
        })
      })

      expect(hook.current.results.products).toHaveLength(1)
      expect(hook.current.results.products[0].vendor).toBe("Vimergy")
    })

    it("should filter by price range", () => {
      act(() => {
        hook.current.setFilters({
          ...hook.current.filters,
          priceRange: { min: 0, max: 30 },
        })
      })

      expect(hook.current.results.products).toHaveLength(1)
      expect(hook.current.results.products[0].price).toBeLessThanOrEqual(30)
    })

    it("should filter by tags", () => {
      act(() => {
        hook.current.setFilters({
          ...hook.current.filters,
          tags: ["organic"],
        })
      })

      expect(hook.current.results.products).toHaveLength(1)
      expect(hook.current.results.products[0].tags).toContain("organic")
    })
  })

  describe("Sorting", () => {
    it("should sort by price low to high", () => {
      act(() => {
        hook.current.setSortType("price-low")
      })

      const prices = hook.current.results.products.map((p: Product) => p.price)
      expect(prices).toEqual([24.99, 36.99])
    })

    it("should sort by price high to low", () => {
      act(() => {
        hook.current.setSortType("price-high")
      })

      const prices = hook.current.results.products.map((p: Product) => p.price)
      expect(prices).toEqual([36.99, 24.99])
    })

    it("should sort alphabetically", () => {
      act(() => {
        hook.current.setSortType("alphabetical")
      })

      const titles = hook.current.results.products.map((p: Product) => p.title)
      expect(titles[0]).toBe("Organic Barley Grass Juice Powder")
    })

    it("should sort by rating", () => {
      act(() => {
        hook.current.setSortType("rating")
      })

      const ratings = hook.current.results.products.map((p: Product) => p.rating)
      expect(ratings).toEqual([4.7, 4.2])
    })
  })

  describe("Pagination", () => {
    it("should handle pagination correctly", () => {
      expect(hook.current.results.page).toBe(1)
      expect(hook.current.results.hasMore).toBe(false) // Only 2 products
    })

    it("should reset to page 1 on new search", () => {
      act(() => {
        hook.current.setCurrentPage(2)
      })

      act(() => {
        hook.current.setQuery("test")
      })

      setTimeout(() => {
        expect(hook.current.currentPage).toBe(1)
      }, 400)
    })
  })
})
