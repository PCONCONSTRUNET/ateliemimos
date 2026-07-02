import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Pencil, Trash2, X, ImagePlus, GripVertical, Ticket } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-primaria-nova.png";
import { ImageCropper } from "@/components/catalog/ImageCropper";

const parseBRL = (input: string): number => {
  if (!input) return 0;
  let s = String(input).trim().replace(/[^\d.,-]/g, "");
  if (!s) return 0;
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    s = s.replace(/\./g, "").replace(",", ".");
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

interface Category {
  id: string;
  nome: string;
  imagem: string | null;
  visivel: boolean;
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

interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  position: number;
}

interface ProductVariation {
  id?: string;
  nome: string;
  preco: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  discount_type?: "percent" | "fixed";
  active: boolean;
  usage_limit?: number | null;
  uses?: number;
}

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [catModal, setCatModal] = useState(false);
  const [prodModal, setProdModal] = useState(false);
  const [couponModal, setCouponModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [catForm, setCatForm] = useState({ nome: "", imagem: null as File | null, visivel: true });
  const [couponForm, setCouponForm] = useState<{ code: string; discount_percent: string; discount_type: "percent" | "fixed"; active: boolean; usage_limit: string }>({ code: "", discount_percent: "", discount_type: "percent", active: true, usage_limit: "" });
  const [prodForm, setProdForm] = useState({
    nome: "",
    preco: "",
    descricao: "",
    categoria_id: "",
    destaque: false,
    disponivel: true,
    imagem: null as File | null,
    tags: "",
    variations: [] as ProductVariation[],
  });
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState("");
  const [cropperTarget, setCropperTarget] = useState<"product" | "category" | "extra" | "extra_existing" | "extra_pending">("product");
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
  const [editingPendingIndex, setEditingPendingIndex] = useState<number | null>(null);
  const [prodPreview, setProdPreview] = useState<string | null>(null);
  const [catPreview, setCatPreview] = useState<string | null>(null);
  // Multi-image states
  const [extraImages, setExtraImages] = useState<ProductImage[]>([]);
  const [pendingExtraFiles, setPendingExtraFiles] = useState<{ file: File; preview: string }[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "product" | "category" | "coupon"; id: string; name: string } | null>(null);
  const navigate = useNavigate();

  const handleMultipleFiles = (files: FileList | File[]) => {
    const newPending: { file: File; preview: string }[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        newPending.push({ file, preview: url });
      }
    });
    if (newPending.length > 0) {
      setPendingExtraFiles((prev) => [...prev, ...newPending]);
    }
  };

  const handlePasteExtraImages = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleMultipleFiles(e.clipboardData.files);
    }
  };

  const handleDragOverExtra = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropExtra = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handlePasteMainImage = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      const file = Array.from(e.clipboardData.files).find(f => f.type.startsWith("image/"));
      if (file) handleFileSelect(file, "product");
    }
  };

  const handleDragOverMain = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropMain = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/"));
      if (file) handleFileSelect(file, "product");
    }
  };

  const handleFileSelect = (file: File, target: "product" | "category" | "extra") => {
    if (target === "extra") {
      handleMultipleFiles([file]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result as string);
      setCropperTarget(target);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedFile: File) => {
    const url = URL.createObjectURL(croppedFile);
    if (cropperTarget === "product") {
      setProdForm((prev) => ({ ...prev, imagem: croppedFile }));
      setProdPreview(url);
    } else if (cropperTarget === "category") {
      setCatForm((prev) => ({ ...prev, imagem: croppedFile }));
      setCatPreview(url);
    } else if (cropperTarget === "extra") {
      setPendingExtraFiles((prev) => [...prev, { file: croppedFile, preview: url }]);
    } else if (cropperTarget === "extra_pending" && editingPendingIndex !== null) {
      setPendingExtraFiles((prev) => {
        const newArr = [...prev];
        newArr[editingPendingIndex] = { file: croppedFile, preview: url };
        return newArr;
      });
    } else if (cropperTarget === "extra_existing" && editingExtraId) {
      const img = extraImages.find(i => i.id === editingExtraId);
      if (img) {
        await supabase.from("product_images").delete().eq("id", img.id);
        setExtraImages((prev) => prev.filter((i) => i.id !== img.id));
        setPendingExtraFiles((prev) => [...prev, { file: croppedFile, preview: url }]);
        toast.success("Imagem ajustada! Salve o produto para aplicar.");
      }
    }
    
    setCropperOpen(false);
    setCropperSrc("");
    setEditingExtraId(null);
    setEditingPendingIndex(null);
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate("/login");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/login");
      setLoading(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (session) fetchAll();
  }, [session]);

  const fetchAll = async () => {
    const [c, p, couponsData] = await Promise.all([
      supabase.from("categories").select("*").order("position", { ascending: true }),
      supabase.from("products").select("*").order("position", { ascending: true }),
      supabase.from("coupons").select("*").order("created_at", { ascending: false })
    ]);
    if (c.data) setCategories(c.data);
    if (p.data) setProducts(p.data);
    if (couponsData.data) setCoupons(couponsData.data);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(fileName, file);
    if (error) {
      toast.error("Erro no upload: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const openCatModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ nome: cat.nome, imagem: null, visivel: cat.visivel });
    } else {
      setEditingCat(null);
      setCatForm({ nome: "", imagem: null, visivel: true });
    }
    setCatPreview(cat?.imagem || null);
    setCatModal(true);
  };

  const saveCat = async () => {
    let imageUrl = editingCat?.imagem || null;
    if (catForm.imagem) {
      imageUrl = await uploadImage(catForm.imagem, "categories");
    }
    const data: any = { nome: catForm.nome, imagem: imageUrl, visivel: catForm.visivel };
    
    if (editingCat) {
      const { error } = await supabase.from("categories").update(data).eq("id", editingCat.id);
      if (error) return toast.error("Erro ao atualizar categoria: " + error.message);
    } else {
      data.position = categories.length;
      const { error } = await supabase.from("categories").insert(data);
      if (error) return toast.error("Erro ao criar categoria: " + error.message);
    }
    setCatModal(false);
    fetchAll();
    toast.success(editingCat ? "Categoria atualizada!" : "Categoria criada!");
  };

  const deleteCat = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    fetchAll();
    toast.success("Categoria excluída!");
  };

  const fetchProductImages = async (productId: string) => {
    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("position");
    return (data || []) as ProductImage[];
  };

  const fetchProductVariations = async (productId: string) => {
    const { data } = await supabase
      .from("product_variations")
      .select("*")
      .eq("product_id", productId)
      .order("created_at");
    return (data || []).map(v => ({ ...v, preco: String(v.preco) })) as ProductVariation[];
  };

  const openProdModal = async (prod?: Product) => {
    setPendingExtraFiles([]);
    if (prod) {
      setEditingProd(prod);
      setProdForm({
        nome: prod.nome,
        preco: String(prod.preco),
        descricao: prod.descricao || "",
        categoria_id: prod.categoria_id || "",
        destaque: prod.destaque,
        disponivel: prod.disponivel,
        imagem: null,
        tags: (prod.tags || []).join(", "),
        variations: [],
      });
      setProdPreview(prod.imagem || null);
      const [imgs, vars] = await Promise.all([
        fetchProductImages(prod.id),
        fetchProductVariations(prod.id)
      ]);
      setExtraImages(imgs);
      setProdForm(prev => ({ ...prev, variations: vars }));
    } else {
      setEditingProd(null);
      setProdForm({ 
        nome: "", 
        preco: "", 
        descricao: "", 
        categoria_id: "", 
        destaque: false, 
        disponivel: true, 
        imagem: null, 
        tags: "",
        variations: []
      });
      setProdPreview(null);
      setExtraImages([]);
    }
    setProdModal(true);
  };

  const saveProd = async () => {
    let imageUrl = editingProd?.imagem || null;
    if (prodForm.imagem) {
      imageUrl = await uploadImage(prodForm.imagem, "products");
    }
    const tagsArray = prodForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const data = {
      nome: prodForm.nome,
      preco: parseBRL(prodForm.preco),
      descricao: prodForm.descricao || null,
      categoria_id: prodForm.categoria_id || null,
      destaque: prodForm.destaque,
      disponivel: prodForm.disponivel,
      imagem: imageUrl,
      tags: tagsArray,
    };

    let productId = editingProd?.id;
    if (editingProd) {
      const { error } = await supabase.from("products").update(data).eq("id", editingProd.id);
      if (error) return toast.error("Erro ao atualizar produto: " + error.message);
    } else {
      (data as any).position = products.length;
      const { data: inserted, error } = await supabase.from("products").insert(data).select("id").single();
      if (error) return toast.error("Erro ao criar produto: " + error.message);
      if (inserted) productId = inserted.id;
    }

    if (productId && pendingExtraFiles.length > 0) {
      const startPos = extraImages.length;
      for (let i = 0; i < pendingExtraFiles.length; i++) {
        const url = await uploadImage(pendingExtraFiles[i].file, "products");
        if (url) {
          await supabase.from("product_images").insert({
            product_id: productId,
            url,
            position: startPos + i,
          });
        }
      }
    }

    if (productId) {
      await supabase.from("product_variations").delete().eq("product_id", productId);
      
      if (prodForm.variations.length > 0) {
        const varsToInsert = prodForm.variations
          .filter(v => v.nome.trim())
          .map(v => ({
            product_id: productId,
            nome: v.nome,
            preco: parseBRL(v.preco),
          }));
        
        if (varsToInsert.length > 0) {
          await supabase.from("product_variations").insert(varsToInsert);
        }
      }
    }

    setProdModal(false);
    fetchAll();
    toast.success(editingProd ? "Produto atualizado!" : "Produto criado!");
  };

  const deleteExtraImage = async (img: ProductImage) => {
    await supabase.from("product_images").delete().eq("id", img.id);
    setExtraImages((prev) => prev.filter((i) => i.id !== img.id));
    toast.success("Imagem removida!");
  };

  const removePendingExtra = (index: number) => {
    setPendingExtraFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteProd = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    fetchAll();
    toast.success("Produto excluído!");
  };

  const openCouponModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({ 
        code: coupon.code, 
        discount_percent: String(coupon.discount_percent), 
        discount_type: coupon.discount_type || "percent", 
        active: coupon.active,
        usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : ""
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({ code: "", discount_percent: "", discount_type: "percent", active: true, usage_limit: "" });
    }
    setCouponModal(true);
  };

  const saveCoupon = async () => {
    const code = couponForm.code.trim().toUpperCase();
    const discount = parseFloat(couponForm.discount_percent.replace(",", "."));
    if (!code || isNaN(discount)) return toast.error("Código e desconto são obrigatórios!");

    const limit = parseInt(couponForm.usage_limit, 10);
    const data = { 
      code, 
      discount_percent: discount, 
      discount_type: couponForm.discount_type, 
      active: couponForm.active,
      usage_limit: isNaN(limit) ? null : limit
    };
    if (editingCoupon) {
      const { error } = await supabase.from("coupons").update(data).eq("id", editingCoupon.id);
      if (error) return toast.error("Erro ao atualizar cupom: " + error.message);
    } else {
      const { error } = await supabase.from("coupons").insert(data);
      if (error) return toast.error("Erro ao criar cupom: " + error.message);
    }
    setCouponModal(false);
    fetchAll();
    toast.success(editingCoupon ? "Cupom atualizado!" : "Cupom criado!");
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    fetchAll();
    toast.success("Cupom excluído!");
  };

  const [activeTab, setActiveTab] = useState("products");

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (index: number, type: "product" | "category" = "product") => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    
    if (type === "product") {
      const updated = [...products];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      setProducts(updated);
      setDragIndex(null);
      setDragOverIndex(null);

      const promises = updated.map((p, i) =>
        supabase.from("products").update({ position: i }).eq("id", p.id)
      );
      await Promise.all(promises);
    } else {
      const updated = [...categories];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      setCategories(updated);
      setDragIndex(null);
      setDragOverIndex(null);

      const promises = updated.map((c, i) =>
        supabase.from("categories").update({ position: i }).eq("id", c.id)
      );
      await Promise.all(promises);
    }
    
    toast.success("Ordem atualizada!");
  };

  const touchStartY = { current: 0 };
  const touchDragIdx = { current: -1 };

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchDragIdx.current = index;
    setDragIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const selector = activeTab === "products" ? "[data-product-index]" : "[data-category-index]";
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const attr = activeTab === "products" ? "data-product-index" : "data-category-index";
        const idx = parseInt(el.getAttribute(attr) || "-1");
        if (idx >= 0) setDragOverIndex(idx);
      }
    });
  };

  const handleTouchEnd = () => {
    if (dragOverIndex !== null && dragIndex !== null) {
      handleDrop(dragOverIndex, activeTab === "products" ? "product" : "category");
    } else {
      setDragIndex(null);
      setDragOverIndex(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10" />
            <h1 className="font-serif text-lg text-foreground">Painel Admin</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2 rounded-full">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="products" onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-primary/10 rounded-full p-1 h-auto flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="products" className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Produtos ({products.length})</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Categorias ({categories.length})</TabsTrigger>
            <TabsTrigger value="coupons" className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Cupons ({coupons.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Produtos</h2>
              <Button onClick={() => openProdModal()} className="gap-2 rounded-full">
                <Plus className="h-4 w-4" /> Novo Produto
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">↕ Arraste para reordenar a exibição no catálogo</p>
            <div className="grid gap-3">
              {products.map((p, idx) => (
                <Card
                  key={p.id}
                  data-product-index={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx, "product")}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                  onTouchStart={(e) => handleTouchStart(idx, e)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`rounded-2xl transition-all cursor-grab active:cursor-grabbing ${
                    dragIndex === idx ? "opacity-50 scale-95" : ""
                  } ${dragOverIndex === idx && dragIndex !== idx ? "border-primary border-2" : ""}`}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    {p.imagem ? (
                      <img src={p.imagem} alt={p.nome} className="w-14 h-14 rounded-md object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">Sem img</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{p.nome}</h3>
                      <p className="text-sm text-primary font-semibold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.preco)}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {p.destaque && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Destaque</span>}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.disponivel ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {p.disponivel ? "Disponível" : "Sob encomenda"}
                        </span>
                        <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {categories.find((c) => c.id === p.categoria_id)?.nome ?? "Sem categoria"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openProdModal(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: "product", id: p.id, name: p.nome })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {products.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado.</p>}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Categorias</h2>
              <Button onClick={() => openCatModal()} className="gap-2 rounded-full">
                <Plus className="h-4 w-4" /> Nova Categoria
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">↕ Arraste para reordenar a ordem das categorias no site</p>
            <div className="grid gap-3">
              {categories.map((c, idx) => (
                <Card 
                  key={c.id} 
                  data-category-index={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx, "category")}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                  onTouchStart={(e) => handleTouchStart(idx, e)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`rounded-2xl transition-all cursor-grab active:cursor-grabbing ${
                    dragIndex === idx ? "opacity-50 scale-95" : ""
                  } ${dragOverIndex === idx && dragIndex !== idx ? "border-primary border-2" : ""}`}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    {c.imagem ? (
                      <img src={c.imagem} alt={c.nome} className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{c.nome}</h3>
                      {!c.visivel && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Oculta</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openCatModal(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: "category", id: c.id, name: c.nome })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {categories.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma categoria cadastrada.</p>}
            </div>
          </TabsContent>

          <TabsContent value="coupons">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Cupons de Desconto</h2>
              <Button onClick={() => openCouponModal()} className="gap-2 rounded-full">
                <Plus className="h-4 w-4" /> Novo Cupom
              </Button>
            </div>
            <div className="grid gap-3">
              {coupons.map((c) => (
                <Card key={c.id} className="rounded-2xl">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg truncate uppercase">{c.code}</h3>
                        <span className="text-sm font-semibold text-primary">
                          {c.discount_type === "fixed" 
                            ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(c.discount_percent)
                            : `${c.discount_percent}% OFF`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {!c.active && (
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold inline-block">Inativo</span>
                        )}
                        {c.usage_limit !== null && c.usage_limit !== undefined && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold inline-block">
                            Usos: {c.uses || 0} / {c.usage_limit}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => openCouponModal(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: "coupon", id: c.id, name: c.code })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {coupons.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum cupom cadastrado.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Category Modal */}
      <Dialog open={catModal} onOpenChange={setCatModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 gap-0">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="font-serif text-lg">{editingCat ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription className="sr-only">Formulário de categoria</DialogDescription>
          </DialogHeader>
          <div className="px-5 pb-5 space-y-4">
            <Input className="rounded-xl h-11" placeholder="Nome da categoria" value={catForm.nome} onChange={(e) => setCatForm({ ...catForm, nome: e.target.value })} />
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Imagem</label>
              {catPreview && (
                <img 
                  src={catPreview} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-xl mb-2 border border-border cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => {
                    setCropperSrc(catPreview);
                    setCropperTarget("category");
                    setCropperOpen(true);
                  }}
                />
              )}
              <Input className="rounded-xl" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, "category"); }} />
            </div>
            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-xl border border-border/50">
              <Checkbox id="cat-visivel" checked={catForm.visivel} onCheckedChange={(c) => setCatForm({ ...catForm, visivel: !!c })} />
              <label htmlFor="cat-visivel" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                Visível no site
              </label>
            </div>
            <Button onClick={saveCat} className="w-full rounded-xl h-11 text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={prodModal} onOpenChange={setProdModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-0 gap-0">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="font-serif text-lg">{editingProd ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription className="sr-only">Formulário de produto</DialogDescription>
          </DialogHeader>
          <div className="px-5 pb-5 space-y-3.5">
            <Input className="rounded-xl h-11" placeholder="Nome do produto" value={prodForm.nome} onChange={(e) => setProdForm({ ...prodForm, nome: e.target.value })} />
            <Input className="rounded-xl h-11" placeholder="Preço (ex: 1.650,00 ou 89,90)" type="text" inputMode="decimal" value={prodForm.preco} onChange={(e) => setProdForm({ ...prodForm, preco: e.target.value })} />
            <Textarea className="rounded-xl min-h-[80px]" placeholder="Descrição do produto" value={prodForm.descricao} onChange={(e) => setProdForm({ ...prodForm, descricao: e.target.value })} />
            <Select value={prodForm.categoria_id} onValueChange={(v) => setProdForm({ ...prodForm, categoria_id: v })}>
              <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input className="rounded-xl h-11" placeholder="Tags (separar por vírgula: Feito à mão, Sob encomenda)" value={prodForm.tags} onChange={(e) => setProdForm({ ...prodForm, tags: e.target.value })} />

            {/* Main image */}
            <div
              onPaste={handlePasteMainImage}
              onDragOver={handleDragOverMain}
              onDrop={handleDropMain}
              tabIndex={0}
              className="outline-none focus:ring-2 focus:ring-primary/30 rounded-xl transition-all p-3 bg-muted/10 border-2 border-dashed border-border/50 hover:border-primary/40 cursor-default"
            >
              <label className="text-xs text-muted-foreground mb-3 block font-medium text-center">
                Imagem principal <br/>
                <span className="font-normal text-[10px]">(Arraste a imagem aqui ou clique e cole com Ctrl+V)</span>
              </label>
              {prodPreview && (
                <img 
                  src={prodPreview} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded-xl mb-3 border border-border shadow-sm cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => {
                    setCropperSrc(prodPreview);
                    setCropperTarget("product");
                    setCropperOpen(true);
                  }}
                />
              )}
              <Input className="rounded-xl cursor-pointer" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, "product"); e.target.value = ''; }} />
            </div>

            {/* Extra images */}
            <div
              onPaste={handlePasteExtraImages}
              onDragOver={handleDragOverExtra}
              onDrop={handleDropExtra}
              tabIndex={0}
              className="outline-none focus:ring-2 focus:ring-primary/30 rounded-xl transition-all p-3 bg-muted/10 border-2 border-dashed border-border/50 hover:border-primary/40 cursor-default"
            >
              <label className="text-xs text-muted-foreground mb-3 block font-medium text-center">
                Imagens adicionais <br/>
                <span className="font-normal text-[10px]">(Arraste imagens aqui ou clique e cole com Ctrl+V)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {extraImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img 
                      src={img.url} 
                      alt="Extra" 
                      className="w-full aspect-square object-cover rounded-xl border border-border cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => {
                        setCropperSrc(img.url);
                        setCropperTarget("extra_existing");
                        setEditingExtraId(img.id);
                        setCropperOpen(true);
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteExtraImage(img); }}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {pendingExtraFiles.map((item, i) => (
                  <div key={`pending-${i}`} className="relative group">
                    <img 
                      src={item.preview} 
                      alt="Nova" 
                      className="w-full aspect-square object-cover rounded-xl border-2 border-dashed border-primary/40 cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => {
                        setCropperSrc(item.preview);
                        setCropperTarget("extra_pending");
                        setEditingPendingIndex(i);
                        setCropperOpen(true);
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removePendingExtra(i); }}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                  <ImagePlus className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">Adicionar<br/>(Múltiplas)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultipleFiles(e.target.files);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-6 py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={prodForm.destaque} onCheckedChange={(c) => setProdForm({ ...prodForm, destaque: !!c })} />
                <span className="text-sm">Destaque</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={prodForm.disponivel} onCheckedChange={(c) => setProdForm({ ...prodForm, disponivel: !!c })} />
                <span className="text-sm">Disponível</span>
              </label>
            </div>

            {/* Variations Section */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  📏 Variações (Tamanho/Modelo)
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] rounded-full px-2"
                  onClick={() => setProdForm(prev => ({ 
                    ...prev, 
                    variations: [...prev.variations, { nome: "", preco: "" }] 
                  }))}
                >
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              </div>
              
              <div className="space-y-2">
                {prodForm.variations.map((v, i) => (
                  <div key={i} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input 
                      className="rounded-xl h-9 text-xs flex-[2]" 
                      placeholder="Ex: Tamanho P" 
                      value={v.nome}
                      onChange={(e) => {
                        const newVars = [...prodForm.variations];
                        newVars[i].nome = e.target.value;
                        setProdForm(prev => ({ ...prev, variations: newVars }));
                      }}
                    />
                    <Input 
                      className="rounded-xl h-9 text-xs flex-1" 
                      placeholder="R$ Valor (ex: 1.650,00)" 
                      type="text"
                      inputMode="decimal"
                      value={v.preco}
                      onChange={(e) => {
                        const newVars = [...prodForm.variations];
                        newVars[i].preco = e.target.value;
                        setProdForm(prev => ({ ...prev, variations: newVars }));
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => setProdForm(prev => ({ 
                        ...prev, 
                        variations: prev.variations.filter((_, idx) => idx !== i) 
                      }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {prodForm.variations.length === 0 && (
                  <p className="text-[10px] text-muted-foreground italic text-center py-2">
                    Nenhuma variação adicionada. O preço base será usado.
                  </p>
                )}
              </div>
            </div>
            <Button onClick={saveProd} className="w-full rounded-xl h-11 text-sm font-semibold">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper */}
      <ImageCropper
        open={cropperOpen}
        imageSrc={cropperSrc}
        aspect={cropperTarget === "category" ? 16 / 9 : 1}
        onCropComplete={handleCropComplete}
        onCancel={() => { setCropperOpen(false); setCropperSrc(""); }}
      />

      {/* Coupon Modal */}
      <Dialog open={couponModal} onOpenChange={setCouponModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 gap-0">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="font-serif text-lg">{editingCoupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
            <DialogDescription className="sr-only">Formulário de cupom</DialogDescription>
          </DialogHeader>
          <div className="px-5 pb-5 space-y-4">
            <Input 
              className="rounded-2xl h-14 uppercase text-lg font-bold border-2 border-primary/20 bg-background focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-sm placeholder:font-medium transition-all" 
              placeholder="CÓDIGO DO CUPOM (EX: MAE10)" 
              value={couponForm.code} 
              onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} 
            />
            <div className="flex gap-2">
              <Select value={couponForm.discount_type} onValueChange={(v) => setCouponForm({ ...couponForm, discount_type: v as "percent" | "fixed" })}>
                <SelectTrigger className="rounded-2xl h-14 w-[140px] border-2 border-primary/20">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Porcento (%)</SelectItem>
                  <SelectItem value="fixed">Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                className="rounded-2xl h-14 text-lg font-bold border-2 border-primary/20 bg-background focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-sm placeholder:font-medium transition-all flex-1" 
                placeholder={couponForm.discount_type === "percent" ? "Desconto (%)" : "Desconto (R$)"} 
                type="number"
                value={couponForm.discount_percent} 
                onChange={(e) => setCouponForm({ ...couponForm, discount_percent: e.target.value })} 
              />
            </div>
            
            <Input 
              className="rounded-2xl h-14 text-lg font-bold border-2 border-primary/20 bg-background focus-visible:ring-primary/40 focus-visible:border-primary placeholder:text-sm placeholder:font-medium transition-all" 
              placeholder="Limite de usos (deixe em branco para ilimitado)" 
              type="number"
              value={couponForm.usage_limit} 
              onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })} 
            />
            
            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-xl border border-border/50">
              <Checkbox id="coupon-active" checked={couponForm.active} onCheckedChange={(c) => setCouponForm({ ...couponForm, active: !!c })} />
              <label htmlFor="coupon-active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                Cupom Ativo
              </label>
            </div>
            <Button onClick={saveCoupon} className="w-full rounded-xl h-12 text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]">Salvar Cupom</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {deleteConfirm?.type === "product" ? "o produto" : deleteConfirm?.type === "category" ? "a categoria" : "o cupom"}: <strong className="text-foreground">{deleteConfirm?.name}</strong>. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                if (deleteConfirm?.type === "product") deleteProd(deleteConfirm.id);
                else if (deleteConfirm?.type === "category") deleteCat(deleteConfirm.id);
                else if (deleteConfirm?.type === "coupon") deleteCoupon(deleteConfirm.id);
                setDeleteConfirm(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
