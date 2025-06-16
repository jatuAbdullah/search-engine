"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  hasMore: boolean
}

export function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange, hasMore }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      <div className="flex items-center gap-2">
       <Button
  variant="outline"
  size="sm"
  onClick={() => {
    onPageChange(currentPage - 1)
    window.scrollTo({ top: 0, behavior: "smooth" }) // Scroll to top
  }}
  disabled={currentPage === 1}
>
  <ChevronLeft className="h-4 w-4" />
  Previous
</Button>


        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

       <Button
  variant="outline"
  size="sm"
  onClick={() => {
    onPageChange(currentPage + 1)
    window.scrollTo({ top: 0, behavior: "smooth" }) // Scroll to top
  }}
  disabled={!hasMore}
>
  Next
  <ChevronRight className="h-4 w-4" />
</Button>
      </div>
    </div>
  )
}
