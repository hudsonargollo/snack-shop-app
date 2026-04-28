import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gift, Ticket } from "lucide-react";

export default function CustomerAccount() {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: customerOrders, isLoading: ordersLoading } = trpc.orders.byCustomer.useQuery(
    { customerId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const { data: loyaltyPoints } = trpc.customers.getLoyaltyPoints.useQuery(
    { customerId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const { data: raffleTickets } = trpc.raffles.customerTickets.useQuery(
    { customerId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const { data: loyaltyPrograms } = trpc.customers.loyaltyPrograms.useQuery();

  const selectedOrder = customerOrders?.find((o) => o.id === selectedOrderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Minha Conta</h1>

        {/* Resumo de Fidelidade e Sorteios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Pontos de Fidelidade</p>
                <p className="text-3xl font-bold text-amber-600">{loyaltyPoints?.totalPoints || 0}</p>
              </div>
              <Gift className="w-8 h-8 text-amber-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Tickets de Sorteio</p>
                <p className="text-3xl font-bold text-blue-600">{raffleTickets?.length || 0}</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-slate-600 text-sm mb-2">Recompensas Ativas</p>
              <div className="space-y-1">
                {loyaltyPrograms?.slice(0, 2).map((prog) => (
                  <div key={prog.id} className="text-xs text-slate-600">
                    {prog.name}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Abas */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Histórico de Pedidos</TabsTrigger>
            <TabsTrigger value="rewards">Programa de Fidelidade</TabsTrigger>
            <TabsTrigger value="raffles">Tickets de Sorteio</TabsTrigger>
          </TabsList>

          {/* Histórico de Pedidos */}
          <TabsContent value="orders">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Seus Pedidos</h2>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                </div>
              ) : customerOrders && customerOrders.length > 0 ? (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">R$ {parseFloat(order.total as any).toFixed(2)}</p>
                          <Badge
                            className={`mt-1 ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "ready"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "preparing"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {order.status === "completed" ? "Concluído"
                              : order.status === "ready" ? "Pronto"
                              : order.status === "preparing" ? "Preparando"
                              : order.status === "cancelled" ? "Cancelado"
                              : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-8">Nenhum pedido ainda. Comece a comprar!</p>
              )}
            </Card>

            {/* Detalhes do Pedido */}
            {selectedOrder && (
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Detalhes do Pedido: {selectedOrder.orderNumber}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Data do Pedido</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge className="mt-1">{selectedOrder.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Forma de Pagamento</p>
                      <p className="font-semibold text-slate-900 capitalize">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status do Pagamento</p>
                      <Badge
                        className={
                          selectedOrder.paymentStatus === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {selectedOrder.paymentStatus === "completed" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-600 mb-2">Itens</p>
                    <div className="space-y-2">
                      <p className="text-slate-600 text-sm">Os itens do pedido serão exibidos aqui</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-amber-600">
                      R$ {parseFloat(selectedOrder.total as any).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Programa de Fidelidade */}
          <TabsContent value="rewards">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Programas de Fidelidade Ativos</h2>
              {loyaltyPrograms && loyaltyPrograms.length > 0 ? (
                <div className="space-y-4">
                  {loyaltyPrograms.map((prog) => (
                    <div key={prog.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{prog.name}</h3>
                          <p className="text-sm text-slate-600">{prog.description}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded text-sm text-slate-600">
                        <p>
                          <strong>Como funciona:</strong> {prog.triggerType === "purchase_count"
                            ? `Ganhe recompensas após ${prog.triggerValue} compras`
                            : `Ganhe recompensas após gastar R$ ${prog.triggerValue}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-8">Nenhum programa de fidelidade ativo no momento.</p>
              )}
            </Card>
          </TabsContent>

          {/* Tickets de Sorteio */}
          <TabsContent value="raffles">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Seus Tickets de Sorteio</h2>
              {raffleTickets && raffleTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {raffleTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">Ticket #{ticket.ticketNumber}</h3>
                          <p className="text-sm text-slate-600">{ticket.raffleName}</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">Ativo</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-3">
                        Obtido em: {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">
                    Você ainda não tem tickets de sorteio. Compre um SANDUÍCHE NATURAL para ganhar tickets!
                  </p>
                  <Button onClick={() => (window.location.href = "/menu")}>Ver Cardápio</Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
