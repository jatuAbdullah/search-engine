import { ShoppingBag } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Product Search</h1>
        </div>
      </div>
    </header>
  )
}
