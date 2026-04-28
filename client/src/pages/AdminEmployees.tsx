import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminEmployees() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "", email: "", role: "clerk" as "admin" | "clerk", password: "",
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

  const { data: employees, isLoading } = trpc.employees?.list?.useQuery?.() || { data: [], isLoading: false };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      toast.success(editingId ? "Funcionário atualizado" : "Funcionário criado");
      setIsOpen(false);
      setFormData({ name: "", email: "", role: "clerk", password: "" });
      setEditingId(null);
    } catch {
      toast.error("Falha ao salvar funcionário");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Gerenciamento de Funcionários</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600">
                <Plus className="w-4 h-4" /> Adicionar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Funcionário" : "Adicionar Novo Funcionário"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="ex: João Silva" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="funcionario@exemplo.com" />
                </div>
                <div>
                  <Label htmlFor="role">Função *</Label>
                  <select id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "clerk" })} className="w-full border rounded px-3 py-2">
                    <option value="clerk">Atendente (Pedidos e Atualizações)</option>
                    <option value="admin">Admin (Acesso Total)</option>
                  </select>
                </div>
                {!editingId && (
                  <div>
                    <Label htmlFor="password">Senha Temporária *</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
                    <p className="text-xs text-slate-600 mt-1">O funcionário pode alterar a senha após o primeiro acesso</p>
                  </div>
                )}
                <Button onClick={handleSubmit} className="w-full">
                  {editingId ? "Atualizar Funcionário" : "Criar Funcionário"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-amber-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">E-mail</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Função</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {employees && employees.length > 0 ? (
                    employees.map((emp: any) => (
                      <tr key={emp.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-900 font-medium">{emp.name}</td>
                        <td className="py-3 px-4 text-slate-600">{emp.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${emp.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {emp.role === "admin" ? "Admin" : "Atendente"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">Ativo</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingId(emp.id); setFormData({ name: emp.name, email: emp.email, role: emp.role, password: "" }); setIsOpen(true); }}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-600">Nenhum funcionário ainda. Crie o primeiro!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total de Funcionários</p>
                <p className="text-3xl font-bold text-slate-900">{employees?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-amber-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-slate-600 text-sm mb-2">Admins</p>
              <p className="text-3xl font-bold text-red-600">{employees?.filter((e: any) => e.role === "admin").length || 0}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-slate-600 text-sm mb-2">Atendentes</p>
              <p className="text-3xl font-bold text-blue-600">{employees?.filter((e: any) => e.role === "clerk").length || 0}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
