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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

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
  });
  const navigate = useNavigate();

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
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ]);
    if (c.data) setCategories(c.data);
    if (p.data) setProducts(p.data);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}.${ext}`;
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
    if (!confirm("Excluir esta categoria?")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchAll();
    toast.success("Categoria excluída!");
  };

  const openProdModal = (prod?: Product) => {
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
      });
    } else {
      setEditingProd(null);
      setProdForm({ nome: "", preco: "", descricao: "", categoria_id: "", destaque: false, disponivel: true, imagem: null, tags: "" });
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
    if (editingProd) {
      await supabase.from("products").update(data).eq("id", editingProd.id);
    } else {
      await supabase.from("products").insert(data);
    }
    setProdModal(false);
    fetchAll();
    toast.success(editingProd ? "Produto atualizado!" : "Produto criado!");
  };

  const deleteProd = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchAll();
    toast.success("Produto excluído!");
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
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Produtos ({products.length})</TabsTrigger>
            <TabsTrigger value="categories">Categorias ({categories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">Produtos</h2>
              <Button onClick={() => openProdModal()} className="gap-2">
                <Plus className="h-4 w-4" /> Novo Produto
              </Button>
            </div>
            <div className="grid gap-3">
              {products.map((p) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    {p.imagem ? (
                      <img src={p.imagem} alt={p.nome} className="w-16 h-16 rounded-md object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">Sem img</div>
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
                      <Button variant="ghost" size="icon" onClick={() => deleteProd(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
              <Button onClick={() => openCatModal()} className="gap-2">
                <Plus className="h-4 w-4" /> Nova Categoria
              </Button>
            </div>
            <div className="grid gap-3">
              {categories.map((c) => (
                <Card key={c.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    {c.imagem ? (
                      <img src={c.imagem} alt={c.nome} className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted" />
                    )}
                    <h3 className="flex-1 font-medium">{c.nome}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openCatModal(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCat(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">{editingCat ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription className="sr-only">Formulário de categoria</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome da categoria" value={catForm.nome} onChange={(e) => setCatForm({ ...catForm, nome: e.target.value })} />
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Imagem</label>
              <Input type="file" accept="image/*" onChange={(e) => setCatForm({ ...catForm, imagem: e.target.files?.[0] || null })} />
            </div>
            <Button onClick={saveCat} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={prodModal} onOpenChange={setProdModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editingProd ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription className="sr-only">Formulário de produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Nome do produto" value={prodForm.nome} onChange={(e) => setProdForm({ ...prodForm, nome: e.target.value })} />
            <Input placeholder="Preço (ex: 89.90)" type="number" step="0.01" value={prodForm.preco} onChange={(e) => setProdForm({ ...prodForm, preco: e.target.value })} />
            <Textarea placeholder="Descrição do produto" value={prodForm.descricao} onChange={(e) => setProdForm({ ...prodForm, descricao: e.target.value })} />
            <Select value={prodForm.categoria_id} onValueChange={(v) => setProdForm({ ...prodForm, categoria_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>))}
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Imagem</label>
              <Input type="file" accept="image/*" onChange={(e) => setProdForm({ ...prodForm, imagem: e.target.files?.[0] || null })} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={prodForm.destaque} onCheckedChange={(c) => setProdForm({ ...prodForm, destaque: !!c })} />
                <span className="text-sm">Destaque</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={prodForm.disponivel} onCheckedChange={(c) => setProdForm({ ...prodForm, disponivel: !!c })} />
                <span className="text-sm">Disponível</span>
              </label>
            </div>
            <Button onClick={saveProd} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
