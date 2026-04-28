import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function AdminPromotions() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "", description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "", startDate: "", endDate: "",
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

  const { data: promotions, isLoading } = trpc.products.promotions.useQuery();

  const handleSubmit = async () => {
    if (!formData.title || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      toast.success(editingId ? "Promoção atualizada" : "Promoção criada");
      setIsOpen(false);
      setFormData({ title: "", description: "", discountType: "percentage", discountValue: "", startDate: "", endDate: "" });
      setEditingId(null);
    } catch {
      toast.error("Falha ao salvar promoção");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Campanhas Promocionais</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600">
                <Plus className="w-4 h-4" /> Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Campanha" : "Criar Campanha"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Campanha *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="ex: Promoção de Verão" />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detalhes da campanha" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountType">Tipo de Desconto *</Label>
                    <select id="discountType" value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })} className="w-full border rounded px-3 py-2">
                      <option value="percentage">Porcentagem</option>
                      <option value="fixed">Valor Fixo</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="discountValue">Valor do Desconto {formData.discountType === "percentage" ? "(%)" : "(R$)"} *</Label>
                    <Input id="discountValue" type="number" step={formData.discountType === "percentage" ? "1" : "0.01"} value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input id="startDate" type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data de Término *</Label>
                    <Input id="endDate" type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingId ? "Atualizar Campanha" : "Criar Campanha"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>
          ) : promotions && promotions.length > 0 ? (
            promotions.map((promo) => {
              const isActive = new Date(promo.startDate) <= new Date() && new Date() <= new Date(promo.endDate);
              return (
                <Card key={promo.id} className={`p-6 ${isActive ? "border-2 border-green-500 bg-green-50" : ""}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <h3 className="font-bold text-slate-900">{promo.title}</h3>
                    </div>
                    {isActive && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">ATIVO</span>}
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{promo.description}</p>
                  <div className="bg-slate-50 p-4 rounded mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-600 text-sm">Desconto:</span>
                      <span className="text-2xl font-bold text-amber-600">
                        {promo.discountType === "percentage" ? `${promo.discountValue}%` : `R$ ${parseFloat(promo.discountValue as any).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <p>Início: {new Date(promo.startDate).toLocaleString("pt-BR")}</p>
                      <p>Término: {new Date(promo.endDate).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(promo.id); setFormData({ title: promo.title, description: promo.description || "", discountType: promo.discountType as "percentage" | "fixed", discountValue: promo.discountValue.toString(), startDate: new Date(promo.startDate).toISOString().slice(0, 16), endDate: new Date(promo.endDate).toISOString().slice(0, 16) }); setIsOpen(true); }} className="flex-1">
                      <Edit2 className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full p-12 text-center">
              <p className="text-slate-600 mb-4">Nenhuma campanha criada ainda. Crie sua primeira promoção!</p>
              <Button onClick={() => setIsOpen(true)}>Criar Campanha</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
