import { Header } from "@/components/catalog/Header";
import { Footer } from "@/components/catalog/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} categories={[]} onSelectCategory={() => {}} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-serif font-bold mb-6 text-foreground">Termos de Uso</h1>
        <div className="space-y-6 text-sm md:text-base text-muted-foreground">
          <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          
          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">1. Introdução</h2>
            <p>Bem-vindo ao catálogo online do Ateliê Mimos da Preta. Ao utilizar nosso site, você concorda com estes termos de uso.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">2. Finalidade do Site</h2>
            <p>Nosso site funciona exclusivamente como um catálogo virtual para exibição de produtos. Não realizamos vendas ou transações financeiras diretamente pela plataforma.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">3. Pedidos e Pagamentos</h2>
            <p>O processo de finalização de pedido ("checkout") apenas redireciona os itens selecionados para o nosso WhatsApp, onde o atendimento, negociação, cálculo de frete e pagamento serão combinados diretamente entre o ateliê e o cliente.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">4. Direitos Autorais</h2>
            <p>Todas as imagens de produtos, fotos e logotipo exibidos neste site são de propriedade exclusiva do Ateliê Mimos da Preta. É proibido copiar, reproduzir ou utilizar nossas imagens para fins comerciais sem autorização prévia.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">5. Alterações nos Produtos</h2>
            <p>Como nossos produtos são artesanais, podem ocorrer pequenas variações de cor e estampa em relação às fotos. Preços e disponibilidade podem sofrer alterações sem aviso prévio.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
