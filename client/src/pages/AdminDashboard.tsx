import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Package, Users, DollarSign, Zap, Gift, Trophy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dateRange] = useState({ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Você não tem acesso ao painel administrativo.</p>
          <Button onClick={() => (window.location.href = "/menu")}>Voltar ao Cardápio</Button>
        </Card>
      </div>
    );
  }

  const { data: bestSellers, isLoading: bestSellersLoading } = trpc.analytics.bestSellers.useQuery({ limit: 10 });
  const { data: mostProfitable, isLoading: profitableLoading } = trpc.analytics.mostProfitable.useQuery({ limit: 10 });
  const { data: salesAnalytics, isLoading: analyticsLoading } = trpc.analytics.salesTrends.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const { data: recentOrders, isLoading: ordersLoading } = trpc.orders.recent.useQuery({ limit: 20 });

  const updateOrderStatus = trpc.orders.updateStatus.useMutation();

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus as any });
    } catch (error) {
      console.error("Falha ao atualizar status do pedido:", error);
    }
  };

  const statusLabel = (s: string) =>
    ({ pending: "Pendente", preparing: "Preparando", ready: "Pronto", completed: "Concluído", cancelled: "Cancelado" }[s] ?? s);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Painel Administrativo</h1>

        {/* Navegação Rápida */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b">
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/products")}>
            <Package className="w-4 h-4 mr-1" /> Produtos
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/combos")}>
            <Package className="w-4 h-4 mr-1" /> Combos
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/promotions")}>
            <Zap className="w-4 h-4 mr-1" /> Promoções
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/employees")}>
            <Users className="w-4 h-4 mr-1" /> Funcionários
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/loyalty")}>
            <Gift className="w-4 h-4 mr-1" /> Fidelidade
          </Button>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/raffles")}>
            <Trophy className="w-4 h-4 mr-1" /> Sorteios
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total de Vendas</p>
                <p className="text-2xl font-bold text-slate-900">R$ {salesAnalytics?.totalSales.toFixed(2) || "0.00"}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total de Pedidos</p>
                <p className="text-2xl font-bold text-slate-900">{salesAnalytics?.totalOrders || 0}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Lucro Total</p>
                <p className="text-2xl font-bold text-slate-900">R$ {salesAnalytics?.totalProfit.toFixed(2) || "0.00"}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Ticket Médio</p>
                <p className="text-2xl font-bold text-slate-900">R$ {salesAnalytics?.averageOrderValue.toFixed(2) || "0.00"}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Abas */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Pedidos Recentes</TabsTrigger>
            <TabsTrigger value="bestsellers">Mais Vendidos</TabsTrigger>
            <TabsTrigger value="profitable">Mais Lucrativos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Pedidos Recentes</h2>
              {ordersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Pedido</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Total</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Pagamento</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders?.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900">{order.orderNumber}</td>
                          <td className="py-3 px-4 text-slate-900">R$ {parseFloat(order.total as any).toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === "completed" ? "bg-green-100 text-green-700"
                              : order.status === "ready" ? "bg-blue-100 text-blue-700"
                              : order.status === "preparing" ? "bg-yellow-100 text-yellow-700"
                              : "bg-slate-100 text-slate-700"
                            }`}>{statusLabel(order.status)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.paymentStatus === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>{order.paymentStatus === "completed" ? "Pago" : "Pendente"}</span>
                          </td>
                          <td className="py-3 px-4">
                            <select value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)} className="px-2 py-1 border rounded text-sm">
                              <option value="pending">Pendente</option>
                              <option value="preparing">Preparando</option>
                              <option value="ready">Pronto</option>
                              <option value="completed">Concluído</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="bestsellers">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Top 10 Produtos Mais Vendidos</h2>
              {bestSellersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Produto</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Qtd. Vendida</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bestSellers?.map((product: any) => (
                        <tr key={product.productId} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900">{product.productName}</td>
                          <td className="py-3 px-4 text-slate-900">{product.totalQuantity}</td>
                          <td className="py-3 px-4 text-slate-900">R$ {parseFloat(product.totalRevenue).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="profitable">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Top 10 Produtos Mais Lucrativos</h2>
              {profitableLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Produto</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Qtd.</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Receita</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Lucro</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Margem %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mostProfitable?.map((product: any) => {
                        const margin = (parseFloat(product.totalProfit) / parseFloat(product.totalRevenue)) * 100;
                        return (
                          <tr key={product.productId} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-900">{product.productName}</td>
                            <td className="py-3 px-4 text-slate-900">{product.totalQuantity}</td>
                            <td className="py-3 px-4 text-slate-900">R$ {parseFloat(product.totalRevenue).toFixed(2)}</td>
                            <td className="py-3 px-4 text-green-600 font-semibold">R$ {parseFloat(product.totalProfit).toFixed(2)}</td>
                            <td className="py-3 px-4 text-slate-900">{margin.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Analytics de Vendas</h2>
              {analyticsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-600 mb-2">Tendência de Vendas</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[{ name: "Vendas", value: salesAnalytics?.totalSales || 0 }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#f59e0b" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
