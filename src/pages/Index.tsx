import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/catalog/Header";
import { HeroBanner } from "@/components/catalog/HeroBanner";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductModal } from "@/components/catalog/ProductModal";
import { WhatsAppButton } from "@/components/catalog/WhatsAppButton";
import { Footer } from "@/components/catalog/Footer";

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoria_id === selectedCategory;
    const matchesSearch = !searchQuery || p.nome.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (id: string | null) => {
    if (!id) return "";
    return categories.find((c) => c.id === id)?.nome || "";
  };

  const showHome = !selectedCategory && !searchQuery;

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero */}
      {showHome && <HeroBanner />}

      <main className="container mx-auto px-4 pb-24">

        {/* === HOME VIEW === */}
        {showHome && (
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
                <CategoryGrid categories={categories} onSelect={setSelectedCategory} />
              </section>
            )}

            {/* All Products */}
            {products.length > 0 && (
              <section className="py-8 border-t border-border">
                <h2 className="text-xl font-serif text-foreground font-semibold mb-5">
                  Todos os Produtos
                </h2>
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-card rounded-xl animate-pulse h-64" />
                    ))}
                  </div>
                ) : (
                  <ProductGrid products={products} onProductClick={setSelectedProduct} />
                )}
              </section>
            )}
          </>
        )}

        {/* === FILTERED VIEW === */}
        {!showHome && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif text-foreground font-semibold">
                {selectedCategory ? getCategoryName(selectedCategory) : `Resultados para "${searchQuery}"`}
              </h2>
              <button
                onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}
                className="text-sm text-primary hover:underline"
              >
                ← Voltar
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado.</p>
            ) : (
              <ProductGrid products={filteredProducts} onProductClick={setSelectedProduct} />
            )}
          </section>
        )}
      </main>

      <Footer categories={categories} onSelectCategory={setSelectedCategory} />
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
