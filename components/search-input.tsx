"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search products...",
  debounceMs = 500, // Slightly longer debounce for API calls
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, onChange, debounceMs])

  const handleClear = () => {
    setLocalValue("")
    onChange("")
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-12 pr-12 h-12 text-lg"
        aria-label="Search products"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
