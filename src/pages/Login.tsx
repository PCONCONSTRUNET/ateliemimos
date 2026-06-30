import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-primaria-nova.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Convert username to email format for Supabase Auth
    const email = `${username.trim().toLowerCase()}@ateliemimos.app`;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Usuário ou senha inválidos.");
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm rounded-2xl shadow-xl border-border/50">
        <CardHeader className="text-center pt-8 pb-2">
          <img src={logo} alt="Logo" className="h-20 mx-auto mb-3" />
          <CardTitle className="font-serif text-xl text-foreground">Painel Administrativo</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Acesse sua conta para gerenciar o catálogo</p>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="rounded-xl h-12"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl h-12"
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full rounded-full h-12 text-sm font-semibold" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
