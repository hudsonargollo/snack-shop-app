import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShoppingBag, TrendingUp, Users, Zap } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      {/* Cabeçalho de Navegação */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Snack Shop</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => (window.location.href = "/menu")}>
                  Cardápio
                </Button>
                <Button variant="ghost" onClick={() => (window.location.href = "/account")}>
                  Minha Conta
                </Button>
                {user?.role === "admin" && (
                  <Button variant="ghost" onClick={() => (window.location.href = "/admin")}>
                    Admin
                  </Button>
                )}
              </>
            ) : (
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <a href="/login">Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Seção Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Frescos e Deliciosos
              <span className="block bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                Lanches na sua Mesa
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Experimente nossa seleção premium de lanches artesanais. Peça online com rastreamento em tempo real, acumule pontos de fidelidade e aproveite ofertas exclusivas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 text-lg"
                onClick={() => (window.location.href = "/menu")}
              >
                Ver Cardápio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                  onClick={() => (window.location.href = "/login")}
                >
                  Entrar
                </Button>
              )}
            </div>

            {/* Selos de confiança */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span>Frescos Todo Dia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <span>Entrega Rápida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">✓</span>
                </div>
                <span>Programa de Fidelidade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Diferenciais */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Por que nos escolher?</h2>
            <p className="text-lg text-slate-600">Tudo que você precisa para uma experiência de compra perfeita</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pedido Fácil</h3>
              <p className="text-slate-600 text-sm">Navegue pelo cardápio digital, personalize seu pedido e finalize em segundos.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Rastreamento em Tempo Real</h3>
              <p className="text-slate-600 text-sm">Acompanhe o status do seu pedido desde o preparo até estar pronto para retirada.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Programa de Fidelidade</h3>
              <p className="text-slate-600 text-sm">Acumule pontos a cada compra e desbloqueie recompensas exclusivas.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pagamentos Seguros</h3>
              <p className="text-slate-600 text-sm">Diversas formas de pagamento: PIX, dinheiro e cartão.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Banner de Oferta Especial */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            🎉 Oferta Especial para Novos Clientes
          </h2>
          <p className="text-lg text-amber-50 mb-8">
            Cadastre-se hoje e ganhe descontos exclusivos no seu primeiro pedido!
          </p>
          <Button
            size="lg"
            className="bg-white text-amber-600 hover:bg-slate-100 px-8 py-6 text-lg font-semibold"
            onClick={() => (window.location.href = "/login")}
          >
            Começar Agora
          </Button>
        </div>
      </section>

      {/* Seção CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Pronto para Pedir?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Explore nosso cardápio delicioso e faça seu primeiro pedido hoje.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 text-lg"
            onClick={() => (window.location.href = "/menu")}
          >
            Ver Cardápio
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Snack Shop</span>
              </div>
              <p className="text-sm">Lanches premium com muito carinho.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/menu" className="hover:text-amber-500 transition">Cardápio</a></li>
                <li><a href="/account" className="hover:text-amber-500 transition">Minha Conta</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-amber-500 transition">Fale Conosco</a></li>
                <li><a href="#" className="hover:text-amber-500 transition">Perguntas Frequentes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-amber-500 transition">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-amber-500 transition">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2026 Snack Shop. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
