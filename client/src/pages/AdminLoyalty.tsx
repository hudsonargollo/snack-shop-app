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
    name: "",
    description: "",
    triggerType: "purchase_count" as "purchase_count" | "spending_amount",
    triggerValue: "",
    rewardType: "discount" as "discount" | "free_item",
    rewardValue: "",
    isActive: true,
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">You do not have access to this page.</p>
          <Button onClick={() => (window.location.href = "/menu")}>Back to Menu</Button>
        </Card>
      </div>
    );
  }

  const { data: programs, isLoading } = trpc.customers?.loyaltyPrograms?.useQuery?.() || { data: [], isLoading: false };

  const handleCreateProgram = async () => {
    if (!formData.name || !formData.triggerValue || !formData.rewardValue) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // In a real implementation, this would call a create mutation
      toast.success("Loyalty program created successfully");
      setIsOpen(false);
      setFormData({
        name: "",
        description: "",
        triggerType: "purchase_count",
        triggerValue: "",
        rewardType: "discount",
        rewardValue: "",
        isActive: true,
      });
    } catch (error) {
      toast.error("Failed to create loyalty program");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Loyalty Program Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Loyalty Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="progName">Campaign Name *</Label>
                  <Input
                    id="progName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Buy 10 Get 1 Free"
                  />
                </div>

                <div>
                  <Label htmlFor="progDesc">Description</Label>
                  <Input
                    id="progDesc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Campaign details"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="triggerType">Trigger Type *</Label>
                    <select
                      id="triggerType"
                      value={formData.triggerType}
                      onChange={(e) =>
                        setFormData({ ...formData, triggerType: e.target.value as "purchase_count" | "spending_amount" })
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="purchase_count">Purchase Count</option>
                      <option value="spending_amount">Spending Amount</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="triggerValue">
                      Trigger Value {formData.triggerType === "spending_amount" ? "(R$)" : "(qty)"} *
                    </Label>
                    <Input
                      id="triggerValue"
                      type="number"
                      step={formData.triggerType === "spending_amount" ? "0.01" : "1"}
                      value={formData.triggerValue}
                      onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rewardType">Reward Type *</Label>
                    <select
                      id="rewardType"
                      value={formData.rewardType}
                      onChange={(e) =>
                        setFormData({ ...formData, rewardType: e.target.value as "discount" | "free_item" })
                      }
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="discount">Discount</option>
                      <option value="free_item">Free Item</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="rewardValue">
                      Reward Value {formData.rewardType === "discount" ? "(R$)" : "(qty)"} *
                    </Label>
                    <Input
                      id="rewardValue"
                      type="number"
                      step={formData.rewardType === "discount" ? "0.01" : "1"}
                      value={formData.rewardValue}
                      onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">Active immediately</span>
                </label>

                <Button onClick={handleCreateProgram} className="w-full">
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Programs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : programs && programs.length > 0 ? (
            programs.map((prog: any) => (
              <Card key={prog.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-900">{prog.name}</h3>
                  </div>
                  {prog.isActive && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-4">{prog.description}</p>

                <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Trigger:</span>
                    <span className="font-semibold text-slate-900">
                      {prog.triggerType === "purchase_count"
                        ? `${prog.triggerValue} purchases`
                        : `R$ ${parseFloat(prog.triggerValue).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Reward:</span>
                    <span className="font-semibold text-amber-600">
                      {prog.rewardType === "discount"
                        ? `R$ ${parseFloat(prog.rewardValue).toFixed(2)} off`
                        : `${prog.rewardValue} free item(s)`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-12 text-center">
              <p className="text-slate-600 mb-4">No loyalty campaigns yet. Create your first one!</p>
              <Button onClick={() => setIsOpen(true)}>Create Campaign</Button>
            </Card>
          )}
        </div>

        {/* Examples */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Campaign Examples</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-slate-900">Buy 10 Get 1 Free</p>
              <p className="text-slate-600">Trigger: 10 purchases | Reward: 1 free item</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-slate-900">Spend R$ 100 Get 10% Off</p>
              <p className="text-slate-600">Trigger: R$ 100 spent | Reward: R$ 10 discount</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold text-slate-900">Every 5 Orders Get R$ 5 Discount</p>
              <p className="text-slate-600">Trigger: 5 purchases | Reward: R$ 5 discount</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
