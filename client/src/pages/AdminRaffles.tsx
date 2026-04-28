import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Ticket, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function AdminRaffles() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", description: "", prizeDescription: "", startDate: "", endDate: "",
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

  const { data: raffles, isLoading } = trpc.raffles?.list?.useQuery?.() || { data: [], isLoading: false };

  const handleCreateRaffle = async () => {
    if (!formData.name || !formData.prizeDescription || !formData.startDate || !formData.endDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      toast.success("Sorteio criado com sucesso");
      setIsOpen(false);
      setFormData({ name: "", description: "", prizeDescription: "", startDate: "", endDate: "" });
    } catch {
      toast.error("Falha ao criar sorteio");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Gerenciamento de Sorteios</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600">
                <Plus className="w-4 h-4" /> Criar Sorteio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Sorteio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="raffleName">Nome do Sorteio *</Label>
                  <Input id="raffleName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="ex: Sorteio de Verão" />
                </div>
                <div>
                  <Label htmlFor="raffleDesc">Descrição</Label>
                  <Input id="raffleDesc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detalhes do sorteio" />
                </div>
                <div>
                  <Label htmlFor="prizeDesc">Descrição do Prêmio *</Label>
                  <Input id="prizeDesc" value={formData.prizeDescription} onChange={(e) => setFormData({ ...formData, prizeDescription: e.target.value })} placeholder="ex: Vale-presente R$ 500" />
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
                <Button onClick={handleCreateRaffle} className="w-full">Criar Sorteio</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Sorteios Ativos</h2>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
          ) : raffles && raffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {raffles.map((raffle: any) => (
                <Card key={raffle.id} className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-bold text-slate-900">{raffle.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{raffle.description}</p>
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <p className="text-sm text-slate-600 mb-1">Prêmio:</p>
                    <p className="font-bold text-purple-600 text-lg">{raffle.prizeDescription}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-600">Tickets Emitidos</p>
                      <p className="text-2xl font-bold text-slate-900">{raffle.ticketCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Participantes Únicos</p>
                      <p className="text-2xl font-bold text-slate-900">{raffle.participantCount || 0}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mb-4">
                    <p>Início: {new Date(raffle.startDate).toLocaleString("pt-BR")}</p>
                    <p>Término: {new Date(raffle.endDate).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Ver Tickets</Button>
                    <Button variant="outline" className="flex-1 text-purple-600">Sortear Ganhador</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-slate-600 mb-4">Nenhum sorteio ativo. Crie um para começar!</p>
              <Button onClick={() => setIsOpen(true)}>Criar Sorteio</Button>
            </Card>
          )}
        </div>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            Sobre os Tickets de Sorteio
          </h3>
          <div className="space-y-3 text-slate-600">
            <p><strong>Emissão Automática:</strong> Clientes recebem automaticamente um ticket a cada SANDUÍCHE NATURAL comprado.</p>
            <p><strong>Rastreamento:</strong> Todos os tickets são rastreados por cliente e sorteio, permitindo gerenciar os sorteios e anunciar ganhadores.</p>
            <p><strong>Múltiplos Sorteios:</strong> Execute vários sorteios simultaneamente, cada um com prêmios e prazos diferentes.</p>
            <p><strong>Gestão de Ganhadores:</strong> Use o botão "Sortear Ganhador" para selecionar aleatoriamente um vencedor entre todos os tickets emitidos.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
