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
import { LogOut, Plus, Pencil, Trash2, X, ImagePlus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { ImageCropper } from "@/components/catalog/ImageCropper";

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

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catModal, setCatModal] = useState(false);
  const [prodModal, setProdModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [catForm, setCatForm] = useState({ nome: "", imagem: null as File | null });
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
  const [cropperTarget, setCropperTarget] = useState<"product" | "category" | "extra">("product");
  const [prodPreview, setProdPreview] = useState<string | null>(null);
  const [catPreview, setCatPreview] = useState<string | null>(null);
  // Multi-image states
  const [extraImages, setExtraImages] = useState<ProductImage[]>([]);
  const [pendingExtraFiles, setPendingExtraFiles] = useState<{ file: File; preview: string }[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "product" | "category"; id: string; name: string } | null>(null);
  const navigate = useNavigate();

  const handleFileSelect = (file: File, target: "product" | "category" | "extra") => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result as string);
      setCropperTarget(target);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile: File) => {
    const url = URL.createObjectURL(croppedFile);
    if (cropperTarget === "product") {
      setProdForm((prev) => ({ ...prev, imagem: croppedFile }));
      setProdPreview(url);
    } else if (cropperTarget === "category") {
      setCatForm((prev) => ({ ...prev, imagem: croppedFile }));
      setCatPreview(url);
    } else if (cropperTarget === "extra") {
      setPendingExtraFiles((prev) => [...prev, { file: croppedFile, preview: url }]);
    }
    setCropperOpen(false);
    setCropperSrc("");
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
    const [c, p] = await Promise.all([
      supabase.from("categories").select("*").order("nome"),
      supabase.from("products").select("*").order("position", { ascending: true }),
    ]);
    if (c.data) setCategories(c.data);
    if (p.data) setProducts(p.data);
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
      setCatForm({ nome: cat.nome, imagem: null });
    } else {
      setEditingCat(null);
      setCatForm({ nome: "", imagem: null });
    }
    setCatPreview(cat?.imagem || null);
    setCatModal(true);
  };

  const saveCat = async () => {
    let imageUrl = editingCat?.imagem || null;
    if (catForm.imagem) {
      imageUrl = await uploadImage(catForm.imagem, "categories");
    }
    if (editingCat) {
      await supabase.from("categories").update({ nome: catForm.nome, imagem: imageUrl }).eq("id", editingCat.id);
    } else {
      await supabase.from("categories").insert({ nome: catForm.nome, imagem: imageUrl });
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
      preco: parseFloat(prodForm.preco) || 0,
      descricao: prodForm.descricao || null,
      categoria_id: prodForm.categoria_id || null,
      destaque: prodForm.destaque,
      disponivel: prodForm.disponivel,
      imagem: imageUrl,
      tags: tagsArray,
    };

    let productId = editingProd?.id;
    if (editingProd) {
      await supabase.from("products").update(data).eq("id", editingProd.id);
    } else {
      const { data: inserted } = await supabase.from("products").insert(data).select("id").single();
      if (inserted) productId = inserted.id;
    }

    // Upload pending extra images
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

    // Save variations
    if (productId) {
      // Delete existing variations first (simple approach)
      await supabase.from("product_variations").delete().eq("product_id", productId);
      
      if (prodForm.variations.length > 0) {
        const varsToInsert = prodForm.variations
          .filter(v => v.nome.trim())
          .map(v => ({
            product_id: productId,
            nome: v.nome,
            preco: parseFloat(v.preco) || 0,
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

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...products];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setProducts(updated);
    setDragIndex(null);
    setDragOverIndex(null);

    // Save new positions to DB
    const promises = updated.map((p, i) =>
      supabase.from("products").update({ position: i }).eq("id", p.id)
    );
    await Promise.all(promises);
    toast.success("Ordem atualizada!");
  };

  // Touch drag support
  const touchStartY = { current: 0 };
  const touchDragIdx = { current: -1 };

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchDragIdx.current = index;
    setDragIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const elements = document.querySelectorAll("[data-product-index]");
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const idx = parseInt(el.getAttribute("data-product-index") || "-1");
        if (idx >= 0) setDragOverIndex(idx);
      }
    });
  };

  const handleTouchEnd = () => {
    if (dragOverIndex !== null && dragIndex !== null) {
      handleDrop(dragOverIndex);
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
        <Tabs defaultValue="products">
          <TabsList className="mb-6 bg-primary/10 rounded-full p-1 h-auto">
            <TabsTrigger value="products" className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Produtos ({products.length})</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-full px-5 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Categorias ({categories.length})</TabsTrigger>
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
                  onDrop={() => handleDrop(idx)}
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
                      <div className="flex gap-2 mt-1">
                        {p.destaque && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Destaque</span>}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.disponivel ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {p.disponivel ? "Disponível" : "Sob encomenda"}
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
            <div className="grid gap-3">
              {categories.map((c) => (
                <Card key={c.id} className="rounded-2xl">
                  <CardContent className="flex items-center gap-4 p-4">
                    {c.imagem ? (
                      <img src={c.imagem} alt={c.nome} className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted" />
                    )}
                    <h3 className="flex-1 font-medium">{c.nome}</h3>
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
                <img src={catPreview} alt="Preview" className="w-full h-32 object-cover rounded-xl mb-2 border border-border" />
              )}
              <Input className="rounded-xl" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, "category"); }} />
            </div>
            <Button onClick={saveCat} className="w-full rounded-xl h-11 text-sm font-semibold">Salvar</Button>
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
            <Input className="rounded-xl h-11" placeholder="Preço (ex: 89.90)" type="number" step="0.01" value={prodForm.preco} onChange={(e) => setProdForm({ ...prodForm, preco: e.target.value })} />
            <Textarea className="rounded-xl min-h-[80px]" placeholder="Descrição do produto" value={prodForm.descricao} onChange={(e) => setProdForm({ ...prodForm, descricao: e.target.value })} />
            <Select value={prodForm.categoria_id} onValueChange={(v) => setProdForm({ ...prodForm, categoria_id: v })}>
              <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input className="rounded-xl h-11" placeholder="Tags (separar por vírgula: Feito à mão, Sob encomenda)" value={prodForm.tags} onChange={(e) => setProdForm({ ...prodForm, tags: e.target.value })} />

            {/* Main image */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Imagem principal</label>
              {prodPreview && (
                <img src={prodPreview} alt="Preview" className="w-full h-40 object-cover rounded-xl mb-2 border border-border" />
              )}
              <Input className="rounded-xl" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, "product"); }} />
            </div>

            {/* Extra images */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Imagens adicionais</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {/* Existing saved images */}
                {extraImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt="Extra" className="w-full aspect-square object-cover rounded-xl border border-border" />
                    <button
                      onClick={() => deleteExtraImage(img)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {/* Pending (not yet saved) images */}
                {pendingExtraFiles.map((item, i) => (
                  <div key={`pending-${i}`} className="relative group">
                    <img src={item.preview} alt="Nova" className="w-full aspect-square object-cover rounded-xl border-2 border-dashed border-primary/40" />
                    <button
                      onClick={() => removePendingExtra(i)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {/* Add button */}
                <label className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <ImagePlus className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground">Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f, "extra"); }}
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
                      placeholder="R$ Valor" 
                      type="number"
                      step="0.01"
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

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Excluir {deleteConfirm?.type === "product" ? "produto" : "categoria"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteConfirm?.name}</strong>? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm?.type === "product") deleteProd(deleteConfirm.id);
                else if (deleteConfirm?.type === "category") deleteCat(deleteConfirm.id);
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
