"use client"

import Image from "next/image"
import { Star, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(price)
  }

  const handleViewProduct = () => {
    if (product.url) {
      window.open(product.url, "_blank", "noopener,noreferrer")
    }
  }

  // Extract first few tags for display
const displayTags = product.tags
  .replace(/[&,+()$~%.'":*?<>{}]/g, "") // Remove special characters
  .split(" ")
  .filter((tag) => tag.length > 0 && !tag.includes("_") && !tag.includes("|")) // Remove tags with _ or |
  .slice(0, 3)



  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 h-full">
      <CardContent className="p-4">
        <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            fill={true}
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">{product.title}</h3>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewCount > 0 && <span className="text-gray-400">({product.reviewCount})</span>}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-600 font-medium">{product.vendor}</p>

          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {displayTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-lg">{formatPrice(product.price, product.currency)}</span>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>

          {product.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProduct}
              className="w-full flex items-center gap-2 mt-3"
            >
              <ExternalLink className="h-3 w-3" />
              View Product
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
