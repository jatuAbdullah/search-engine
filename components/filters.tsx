"use client"

import { useState } from "react"
import { ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SearchFilters } from "@/types/product"

interface FilterOptions {
  vendors: string[]
  categories: string[]
  tags: string[]
  priceRange: { min: number; max: number }
  statusOptions: string[]

}

interface FiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  filterOptions: FilterOptions
}

export function Filters({ filters, onFiltersChange, filterOptions }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      vendors: [],
      categories: [],
      tags: [],
      priceRange: filterOptions.priceRange,
      status:[]
    })
  }

  const hasActiveFilters =
    filters.vendors.length > 0 ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.status.length > 0 ||
    filters.priceRange.min !== filterOptions.priceRange.min ||
    filters.priceRange.max !== filterOptions.priceRange.max

  const activeFilterCount = filters.vendors.length + filters.categories.length + filters.tags.length + filters.status.length

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{activeFilterCount}</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-sm">
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
        <CardContent className="space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Price Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min || ""}
                onChange={(e) =>
                  updateFilters({
                    priceRange: {
                      ...filters.priceRange,
                      min: Number(e.target.value) || filterOptions.priceRange.min,
                    },
                  })
                }
                className="w-24 text-sm"
              />
              <span className="text-gray-500 text-sm">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max || ""}
                onChange={(e) =>
                  updateFilters({
                    priceRange: {
                      ...filters.priceRange,
                      max: Number(e.target.value) || filterOptions.priceRange.max,
                    },
                  })
                }
                className="w-24 text-sm"
              />
            </div>
          </div>

{/* Status */}
{filterOptions.statusOptions?.length > 0 && (
  <div>
    <Label className="text-sm font-medium mb-3 block">
      Status ({filterOptions.statusOptions.length})
    </Label>
    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
      {filterOptions.statusOptions.map((status, i) => (
        <div key={`status-${status}-${i}`} className="flex items-center space-x-2">
          <Checkbox
            id={`status-${status}`}
            checked={filters.status?.includes(status)}
            onCheckedChange={(checked) => {
              if (checked) {
                updateFilters({ status: [...(filters.status || []), status] })
              } else {
                updateFilters({
                  status: (filters.status || []).filter((s) => s !== status),
                })
              }
            }}
          />
          <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer flex-1">
            {status}
          </Label>
        </div>
      ))}
    </div>
  </div>
)}


          {/* Vendors */}
          {filterOptions.vendors.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Vendor ({filterOptions.vendors.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {filterOptions.vendors.map((vendor, i) => (
                  <div key={`vendor-${vendor}-${i}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vendor-${vendor}`}
                      checked={filters.vendors.includes(vendor)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({ vendors: [...filters.vendors, vendor] })
                        } else {
                          updateFilters({ vendors: filters.vendors.filter((v) => v !== vendor) })
                        }
                      }}
                    />
                    <Label htmlFor={`vendor-${vendor}`} className="text-sm cursor-pointer flex-1">
                      {vendor}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
{filterOptions.tags.length > 0 && (
  <div>
    <Label className="text-sm font-medium mb-3 block">
      Tags ({filterOptions.tags.length})
    </Label>
    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
      {filterOptions.tags.map((tag, i) => (
        <div key={`tag-${tag}-${i}`} className="flex items-center space-x-2">
          <Checkbox
            id={`tag-${tag}`}
            checked={filters.tags.includes(tag)}
            onCheckedChange={(checked) => {
              if (checked) {
                updateFilters({ tags: [...filters.tags, tag] })
              } else {
                updateFilters({ tags: filters.tags.filter((t) => t !== tag) })
              }
            }}
          />
          <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer flex-1">
            {tag}
          </Label>
        </div>
      ))}
    </div>
  </div>
)}


        
      
        </CardContent>
      </div>
    </Card>
  )
}
