import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Loader2 } from "lucide-react";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const { data: categories, isLoading: categoriesLoading } = trpc.products.categories.useQuery();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: promotions } = trpc.products.promotions.useQuery();
  const { addToCart } = useCart();

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.categoryId === selectedCategory)
    : products;

  const handlePromoNext = () => {
    if (promotions) {
      setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
    }
  };

  const handlePromoPrev = () => {
    if (promotions) {
      setCurrentPromoIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
    }
  };

  const currentPromo = promotions?.[currentPromoIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍔</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Snack Shop</h1>
          </div>
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Carrinho</span>
          </Button>
        </div>
      </header>

      {/* Hero Slider with Promotions */}
      {promotions && promotions.length > 0 && (
        <div className="relative w-full h-96 bg-gradient-to-r from-amber-400 to-orange-500 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {currentPromo && (
              <div
                key={currentPromo.id}
                className="absolute inset-0 transition-opacity duration-500 flex items-center justify-center"
                style={{
                  backgroundImage: `url(${currentPromo.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center">
                  <h2 className="text-4xl font-bold text-white mb-2">{currentPromo.title}</h2>
                  <p className="text-xl text-white/90">{currentPromo.description}</p>
                  <div className="mt-4 text-3xl font-bold text-amber-300">
                    {currentPromo.discountType === "percentage"
                      ? `${currentPromo.discountValue}% OFF`
                      : `R$ ${parseFloat(currentPromo.discountValue as any).toFixed(2)} OFF`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Slider Controls */}
          <button
            onClick={handlePromoPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-900" />
          </button>
          <button
            onClick={handlePromoNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPromoIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentPromoIndex ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category Selector */}
      {categoriesLoading ? (
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-4 overflow-x-auto pb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all flex-shrink-0 ${
                selectedCategory === null
                  ? "bg-amber-500 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-medium">Todos</span>
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-white shadow-lg"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-2xl">{cat.iconUrl || "🍽️"}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-12">
        {productsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts?.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🍔
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    R$ {parseFloat(product.salePrice as any).toFixed(2)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-500">
                      Estoque: {product.stock}
                      {product.stock <= product.lowStockThreshold && (
                        <span className="ml-2 text-red-500 font-semibold">Baixo!</span>
                      )}
                    </span>
                  </div>

                  <Button
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: parseFloat(product.salePrice as any),
                        quantity: 1,
                      })
                    }
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Sem Estoque" : "Adicionar ao Carrinho"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
