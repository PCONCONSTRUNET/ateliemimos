import { useState, useEffect } from "react";
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

interface Category {
  id: string;
  nome: string;
  imagem: string | null;
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
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [catRes, prodRes] = await Promise.all([
      supabase.from("categories").select("*").order("nome"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (prodRes.data) setProducts(prodRes.data);
    setLoading(false);
  };

  const featuredProducts = products.filter((p) => p.destaque);

  const searchResults = searchQuery
    ? products.filter((p) => p.nome.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const getCategoryName = (id: string | null) => {
    if (!id) return "";
    return categories.find((c) => c.id === id)?.nome || "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        onSelectCategory={(id) => id && navigate(`/categoria/${id}`)}
      />

      {/* Hero */}
      {!searchQuery && <HeroBanner />}

      {/* Category scroll bar */}
      {!searchQuery && categories.length > 0 && (
        <div className="container mx-auto px-4 pt-4">
          <CategoryScrollBar
            categories={categories}
            onSelect={(id) => navigate(`/categoria/${id}`)}
          />
        </div>
      )}

      <main className="container mx-auto px-4 pb-24">
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
            {categories.length > 0 && (
              <section className="py-8 border-t border-border">
                <h2 className="text-xl font-serif text-foreground font-semibold mb-5">
                  Categorias
                </h2>
                <CategoryGrid
                  categories={categories}
                  onSelect={(id) => navigate(`/categoria/${id}`)}
                />
              </section>
            )}
          </>
        )}
      </main>

      <Footer categories={categories} onSelectCategory={(id) => id && navigate(`/categoria/${id}`)} />
      <WhatsAppButton />

      <ProductModal
        product={selectedProduct}
        categoryName={getCategoryName(selectedProduct?.categoria_id ?? null)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Index;
