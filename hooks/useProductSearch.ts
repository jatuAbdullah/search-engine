"use client"

import { useState, useMemo, useCallback } from "react"
import { debounce } from "lodash"
import Fuse from "fuse.js"
import type { FuseOptionKey, FuseOptions } from "fuse.js"
import type { Product, SearchFilters, SortType, SearchResult } from "@/types/product"

const FUSE_OPTIONS: FuseOptions<Product> = {
  keys: [
    { name: "title", weight: 0.4 },
    { name: "tags", weight: 0.3 },
    { name: "description", weight: 0.2 },
    { name: "vendor", weight: 0.1 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  findAllMatches: true,
}

const ITEMS_PER_PAGE = 20

export function useProductSearch(products: Product[]) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    vendors: [],
    categories: [],
    tags: [],
    status: [],
    priceRange: { min: 0, max: 1000 },
  })
  const [sortType, setSortType] = useState<SortType>("relevance")
  const [currentPage, setCurrentPage] = useState(1)

  // Fuse instance
  const fuse = useMemo(() => {
    if (!products || products.length === 0) return null
    return new Fuse(products, FUSE_OPTIONS)
  }, [products])

  // Fuzzy search
  const searchResults = useMemo(() => {
    if (!fuse || !query.trim()) return products
    return fuse.search(query).map((r) => r.item)
  }, [fuse, query, products])

  // Apply filters
  const filteredResults = useMemo(() => {
    return searchResults.filter((product) => {
      // Vendor
      if (filters.vendors.length > 0 && !filters.vendors.includes(product.vendor)) {
        return false
      }

      // Category
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false
      }
      // Status
if (filters.status.length > 0 && !filters.status.includes(product.status)) {
  return false
}

      // Tags
      if (filters.tags.length > 0) {
        const tagString = Array.isArray(product.tags)
          ? product.tags.join(" ")
          : product.tags ?? ""

        const hasTag = filters.tags.some((tag) =>
          tagString.toLowerCase().includes(tag.toLowerCase())
        )
        if (!hasTag) return false
      }

      // Price
      const price = product.price ?? 0
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false
      }

      return true
    })
  }, [searchResults, filters])

  // Sort
  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults]

    switch (sortType) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
    
      default:
        return sorted
    }
  }, [filteredResults, sortType])

  // Paginate
  const paginatedResults = useMemo((): SearchResult => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE

    return {
      products: sortedResults.slice(start, end),
      total: sortedResults.length,
      hasMore: end < sortedResults.length,
      page: currentPage,
    }
  }, [sortedResults, currentPage])

  // Debounced query setter
  const debouncedSetQuery = useCallback(
    debounce((val: string) => {
      setQuery(val)
      setCurrentPage(1)
    }, 300),
    []
  )

  // Filter options
const filterOptions = useMemo(() => {
  const vendors = [...new Set(products.map((p) => p.vendor))].sort()
  const categories = [...new Set(products.map((p) => p.category))].sort()

  const tags = [
    ...new Set(
      products.flatMap((p) =>
        typeof p.tags === "string"
          ? p.tags.split(",")
          : Array.isArray(p.tags)
          ? p.tags
          : []
      )
    ),
  ].sort()

  const prices = products.map((p) => p.price ?? 0).filter((p) => p > 0)
  const priceRange = {
    min: Math.floor(Math.min(...prices, 0)),
    max: Math.ceil(Math.max(...prices, 1000)),
  }

  // ✅ Add this
  const statusOptions = [...new Set(products.map((p) => p.status))].sort()

  return { vendors, categories, tags, priceRange, statusOptions }
}, [products])


  // Clear filters
  const clearFilters = () =>
    setFilters({
      vendors: [],
      categories: [],
      tags: [],
      status:[],
      priceRange: filterOptions.priceRange,
    })

  const hasActiveFilters =
    filters.vendors.length > 0 ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.status.length > 0 ||
    filters.priceRange.min !== filterOptions.priceRange.min ||
    filters.priceRange.max !== filterOptions.priceRange.max

  return {
    // States
    query,
    filters,
    sortType,
    currentPage,

    // Results
    results: paginatedResults,
    filterOptions,

    // Actions
    setQuery: debouncedSetQuery,
    setFilters,
    setSortType,
    setCurrentPage,
    clearFilters,
    hasActiveFilters,
  }
}
