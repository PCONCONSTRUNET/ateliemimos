import { Header } from "@/components/catalog/Header";
import { Footer } from "@/components/catalog/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} categories={[]} onSelectCategory={() => {}} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-serif font-bold mb-6 text-foreground">Política de Privacidade</h1>
        <div className="space-y-6 text-sm md:text-base text-muted-foreground">
          <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">1. Coleta de Dados</h2>
            <p>Este catálogo online <strong>não</strong> solicita, coleta ou armazena dados pessoais sensíveis (como CPF, senhas, cartões de crédito ou endereço) diretamente em nossos servidores.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">2. Uso de Armazenamento Local (Cookies)</h2>
            <p>Para melhorar sua experiência de navegação, utilizamos recursos do seu próprio navegador (como <em>localStorage</em>) para guardar os itens que você adicionou ao carrinho de compras ou marcou como favoritos. Essas informações ficam salvas apenas no seu aparelho e não são enviadas para nós automaticamente.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">3. Fechamento de Pedido</h2>
            <p>Ao clicar em "Finalizar Pedido", você será redirecionado para o WhatsApp. Somente lá, de forma segura e privada, solicitaremos as informações necessárias (como endereço de entrega) para concluir sua compra.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">4. Links Externos</h2>
            <p>Nosso site pode conter links para nossas redes sociais (como o Instagram). Não nos responsabilizamos pelas políticas de privacidade dessas plataformas externas.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">5. Contato</h2>
            <p>Se tiver dúvidas sobre nossa política ou sobre como tratamos seus dados no WhatsApp, entre em contato conosco através do número de atendimento disponível no rodapé.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
