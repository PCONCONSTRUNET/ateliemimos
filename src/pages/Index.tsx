import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/catalog/Header";
import { HeroBanner } from "@/components/catalog/HeroBanner";
import { CategoryScrollBar } from "@/components/catalog/CategoryScrollBar";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductModal } from "@/components/catalog/ProductModal";
import { WhatsAppButton } from "@/components/catalog/WhatsAppButton";
import { Footer } from "@/components/catalog/Footer";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { createSlug } from "@/lib/utils";

interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
}

interface Category {
  id: string;
  nome: string;
  imagem: string | null;
  position: number;
}

interface Product {
  id: string;
  nome: string;
  preco: number;
  descricao: string | null;
  imagem: string | null;
  categoria_id: string | null;
  destaque: boolean;
  disponivel: boolean;
  tags?: string[];
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [catRes, prodRes, imgRes] = await Promise.all([
      supabase.from("categories").select("*").order("position", { ascending: true }),
      supabase.from("products").select("*").order("position", { ascending: true }),
      supabase.from("product_images").select("*").order("position"),
    ]);
    if (catRes.data) {
      setCategories(catRes.data.filter((c) => c.visivel !== false));
    }
    if (prodRes.data) {
      setProducts(prodRes.data);
      const prices = prodRes.data.map((p) => p.preco);
      if (prices.length > 0) {
        setPriceRange([Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]);
      }
    }
    if (imgRes.data) {
      const map: Record<string, string[]> = {};
      imgRes.data.forEach((img: ProductImage) => {
        if (!map[img.product_id]) map[img.product_id] = [];
        map[img.product_id].push(img.url);
      });
      setProductImages(map);
    }
    setLoading(false);
  };

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100;
    return Math.ceil(Math.max(...products.map((p) => p.preco)));
  }, [products]);

  const minPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.floor(Math.min(...products.map((p) => p.preco)));
  }, [products]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [products]);

  const hasActiveFilters = !loading && products.length > 0 && (priceRange[0] > minPrice || priceRange[1] < maxPrice || selectedTags.length > 0);

  const filteredByFilters = useMemo(() => {
    return products.filter((p) => {
      if (p.preco < priceRange[0] || p.preco > priceRange[1]) return false;
      if (selectedTags.length > 0 && (!p.tags || !selectedTags.some((t) => p.tags!.includes(t)))) return false;
      return true;
    });
  }, [products, priceRange, selectedTags]);

  const featuredProducts = filteredByFilters.filter((p) => p.destaque);

  const searchResults = searchQuery
    ? filteredByFilters.filter((p) => p.nome.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const getCategoryName = (id: string | null) => {
    if (!id) return "";
    return categories.find((c) => c.id === id)?.nome || "";
  };

  const clearFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedTags([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  const navigateToCategory = (id: string | null) => {
    if (!id) return;
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      navigate(`/catalogo/${createSlug(cat.nome)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        onSelectCategory={navigateToCategory}
      />

      {/* Hero */}
      {!searchQuery && !hasActiveFilters && <HeroBanner />}

      {/* Filter toggle */}
      <div className="container mx-auto px-4 pt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground border border-border"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-primary-foreground text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                !
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="container mx-auto px-4 pt-3 pb-1 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            {/* Price range */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">
                💰 Faixa de preço
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground min-w-[60px]">
                  {formatPrice(priceRange[0])}
                </span>
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                    className="w-full accent-[hsl(var(--primary))] h-1.5"
                  />
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                    className="w-full accent-[hsl(var(--primary))] h-1.5"
                  />
                </div>
                <span className="text-xs text-muted-foreground min-w-[60px] text-right">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-foreground mb-2 block">
                  🏷️ Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category scroll bar */}
      {!searchQuery && categories.length > 0 && (
        <div className="container mx-auto px-4 pt-4">
          <CategoryScrollBar
            categories={categories}
            onSelect={navigateToCategory}
          />
        </div>
      )}

      <main className="container mx-auto px-4 pb-24 flex-grow">
        {/* Search results */}
        {searchResults ? (
          <section className="py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif text-foreground font-semibold">
                Resultados para "{searchQuery}"
              </h2>
              <button onClick={() => setSearchQuery("")} className="text-sm text-primary hover:underline">
                ← Voltar
              </button>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado.</p>
            ) : (
              <ProductGrid products={searchResults} onProductClick={setSelectedProduct} />
            )}
          </section>
        ) : (
          <>
            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <section className="py-8">
                <h2 className="text-xl font-serif text-foreground font-semibold mb-5">
                  ✨ Destaques
                </h2>
                <ProductGrid products={featuredProducts} onProductClick={setSelectedProduct} />
              </section>
            )}

            {/* Categories with photos */}
            {categories.length > 0 && !hasActiveFilters && (
              <section className="py-8 border-t border-border">
                <h2 className="text-xl font-serif text-foreground font-semibold mb-5">
                  Categorias
                </h2>
                <CategoryGrid
                  categories={categories}
                  onSelect={navigateToCategory}
                />
              </section>
            )}

            {/* All filtered products when filters active */}
            {hasActiveFilters && (
              <section className="py-8">
                <h2 className="text-xl font-serif text-foreground font-semibold mb-5">
                  Produtos ({filteredByFilters.length})
                </h2>
                {filteredByFilters.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado com esses filtros.</p>
                ) : (
                  <ProductGrid products={filteredByFilters} onProductClick={setSelectedProduct} />
                )}
              </section>
            )}
          </>
        )}
      </main>

      <Footer categories={categories} onSelectCategory={navigateToCategory} />
      <WhatsAppButton />

      <ProductModal
        product={selectedProduct}
        categoryName={getCategoryName(selectedProduct?.categoria_id ?? null)}
        onClose={() => setSelectedProduct(null)}
        extraImages={selectedProduct ? (productImages[selectedProduct.id] || []) : []}
      />
    </div>
  );
};

export default Index;
