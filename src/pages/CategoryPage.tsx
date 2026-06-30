import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/catalog/Header";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductModal } from "@/components/catalog/ProductModal";
import { WhatsAppButton } from "@/components/catalog/WhatsAppButton";
import { Footer } from "@/components/catalog/Footer";
import { createSlug } from "@/lib/utils";

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
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    const { data: allCats } = await supabase.from("categories").select("*").order("nome");
    if (!allCats) return;
    setCategories(allCats);
    
    const targetCat = allCats.find((c) => createSlug(c.nome) === slug);
    if (!targetCat) {
      navigate("/");
      return;
    }
    
    setCategory(targetCat);

    const { data: prodData } = await supabase
      .from("products")
      .select("*")
      .eq("categoria_id", targetCat.id)
      .order("position", { ascending: true });
      
    if (prodData) {
      setProducts(prodData);
      const prodIds = prodData.map((p: Product) => p.id);
      if (prodIds.length > 0) {
        const { data: imgData } = await supabase
          .from("product_images")
          .select("*")
          .in("product_id", prodIds)
          .order("position");
        if (imgData) {
          const map: Record<string, string[]> = {};
          imgData.forEach((img: any) => {
            if (!map[img.product_id]) map[img.product_id] = [];
            map[img.product_id].push(img.url);
          });
          setProductImages(map);
        }
      }
    }
    setLoading(false);
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "";
    return categories.find((c) => c.id === catId)?.nome || "";
  };

  const navigateToCategory = (catId: string | null) => {
    if (!catId) return;
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      navigate(`/catalogo/${createSlug(cat.nome)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        onSelectCategory={navigateToCategory}
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

export default CategoryPage;
