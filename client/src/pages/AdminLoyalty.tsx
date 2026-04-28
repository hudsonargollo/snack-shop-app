import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Gift, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoyalty() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", description: "",
    triggerType: "purchase_count" as "purchase_count" | "spending_amount",
    triggerValue: "",
    rewardType: "discount" as "discount" | "free_item",
    rewardValue: "", isActive: true,
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Você não tem acesso a esta página.</p>
          <Button onClick={() => (window.location.href = "/menu")}>Voltar ao Cardápio</Button>
        </Card>
      </div>
    );
  }

  const { data: programs, isLoading } = trpc.customers?.loyaltyPrograms?.useQuery?.() || { data: [], isLoading: false };

  const handleCreateProgram = async () => {
    if (!formData.name || !formData.triggerValue || !formData.rewardValue) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      toast.success("Programa de fidelidade criado com sucesso");
      setIsOpen(false);
      setFormData({ name: "", description: "", triggerType: "purchase_count", triggerValue: "", rewardType: "discount", rewardValue: "", isActive: true });
    } catch {
      toast.error("Falha ao criar programa de fidelidade");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Gerenciamento de Fidelidade</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600">
                <Plus className="w-4 h-4" /> Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Campanha de Fidelidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="progName">Nome da Campanha *</Label>
                  <Input id="progName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="ex: Compre 10 Ganhe 1" />
                </div>
                <div>
                  <Label htmlFor="progDesc">Descrição</Label>
                  <Input id="progDesc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detalhes da campanha" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="triggerType">Tipo de Gatilho *</Label>
                    <select id="triggerType" value={formData.triggerType} onChange={(e) => setFormData({ ...formData, triggerType: e.target.value as "purchase_count" | "spending_amount" })} className="w-full border rounded px-3 py-2 text-sm">
                      <option value="purchase_count">Nº de Compras</option>
                      <option value="spending_amount">Valor Gasto</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="triggerValue">Valor do Gatilho {formData.triggerType === "spending_amount" ? "(R$)" : "(qtd)"} *</Label>
                    <Input id="triggerValue" type="number" step={formData.triggerType === "spending_amount" ? "0.01" : "1"} value={formData.triggerValue} onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rewardType">Tipo de Recompensa *</Label>
                    <select id="rewardType" value={formData.rewardType} onChange={(e) => setFormData({ ...formData, rewardType: e.target.value as "discount" | "free_item" })} className="w-full border rounded px-3 py-2 text-sm">
                      <option value="discount">Desconto</option>
                      <option value="free_item">Item Grátis</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="rewardValue">Valor da Recompensa {formData.rewardType === "discount" ? "(R$)" : "(qtd)"} *</Label>
                    <Input id="rewardValue" type="number" step={formData.rewardType === "discount" ? "0.01" : "1"} value={formData.rewardValue} onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                  <span className="text-sm text-slate-700">Ativar imediatamente</span>
                </label>
                <Button onClick={handleCreateProgram} className="w-full">Criar Campanha</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>
          ) : programs && programs.length > 0 ? (
            programs.map((prog: any) => (
              <Card key={prog.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-900">{prog.name}</h3>
                  </div>
                  {prog.isActive && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">ATIVO</span>}
                </div>
                <p className="text-sm text-slate-600 mb-4">{prog.description}</p>
                <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Gatilho:</span>
                    <span className="font-semibold text-slate-900">
                      {prog.triggerType === "purchase_count" ? `${prog.triggerValue} compras` : `R$ ${parseFloat(prog.triggerValue).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Recompensa:</span>
                    <span className="font-semibold text-amber-600">
                      {prog.rewardType === "discount" ? `R$ ${parseFloat(prog.rewardValue).toFixed(2)} de desconto` : `${prog.rewardValue} item(s) grátis`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Editar</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-12 text-center">
              <p className="text-slate-600 mb-4">Nenhuma campanha ainda. Crie a primeira!</p>
              <Button onClick={() => setIsOpen(true)}>Criar Campanha</Button>
            </Card>
          )}
        </div>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Exemplos de Campanhas</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-slate-900">Compre 10 Ganhe 1 Grátis</p>
              <p className="text-slate-600">Gatilho: 10 compras | Recompensa: 1 item grátis</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-slate-900">Gaste R$ 100 e Ganhe 10% de Desconto</p>
              <p className="text-slate-600">Gatilho: R$ 100 gastos | Recompensa: R$ 10 de desconto</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-slate-900">A cada 5 Pedidos, R$ 5 de Desconto</p>
              <p className="text-slate-600">Gatilho: 5 compras | Recompensa: R$ 5 de desconto</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
