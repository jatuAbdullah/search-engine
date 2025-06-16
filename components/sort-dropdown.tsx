"use client"

import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { SortType, SortOption } from "@/types/product"

interface SortDropdownProps {
  value: SortType
  onChange: (value: SortType) => void
}

const sortOptions: SortOption[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "alphabetical", label: "Alphabetical" },
]

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const currentOption = sortOptions.find((option) => option.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort: {currentOption?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value as SortType)}
            className={value === option.value ? "bg-gray-100" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
