"use client"

import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4">
        {hasFilters ? <Filter className="h-16 w-16 text-gray-300" /> : <Search className="h-16 w-16 text-gray-300" />}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasFilters ? "No products match your filters" : "No products found"}
      </h3>

      <p className="text-gray-600 mb-6 max-w-md">
        {hasFilters
          ? "Try adjusting your filters or search terms to find what you're looking for."
          : "We couldn't find any products matching your search. Try different keywords."}
      </p>

      {hasFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Clear all filters
        </Button>
      )}
    </div>
  )
}
