import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/catalog/Header";
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
  tags?: string[];
}

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [catRes, catAllRes, prodRes] = await Promise.all([
      supabase.from("categories").select("*").eq("id", id!).single(),
      supabase.from("categories").select("*").order("nome"),
      supabase.from("products").select("*").eq("categoria_id", id!).order("created_at", { ascending: false }),
    ]);
    if (catRes.data) setCategory(catRes.data);
    if (catAllRes.data) setCategories(catAllRes.data);
    if (prodRes.data) setProducts(prodRes.data);
    setLoading(false);
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "";
    return categories.find((c) => c.id === catId)?.nome || "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        onSelectCategory={(catId) => catId ? navigate(`/categoria/${catId}`) : navigate("/")}
      />

      <main className="container mx-auto px-4 pb-24">
        <section className="py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-serif text-foreground font-semibold">
              {category?.nome || "Categoria"}
            </h2>
            <button onClick={() => navigate("/")} className="text-sm text-primary hover:underline">
              ← Voltar
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl animate-pulse h-64" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Nenhum produto nesta categoria.</p>
          ) : (
            <ProductGrid products={products} onProductClick={setSelectedProduct} />
          )}
        </section>
      </main>

      <Footer categories={categories} onSelectCategory={(catId) => catId && navigate(`/categoria/${catId}`)} />
      <WhatsAppButton />

      <ProductModal
        product={selectedProduct}
        categoryName={getCategoryName(selectedProduct?.categoria_id ?? null)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default CategoryPage;
