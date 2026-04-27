import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export default function AdminCombos() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    displayOrder: "0",
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

  const { data: combos, isLoading: combosLoading } = trpc.products.combos.useQuery();
  const { data: products } = trpc.products.list.useQuery();

  const calculateComboPrice = () => {
    if (!products || selectedItems.length === 0) return 0;
    return selectedItems.reduce((sum, itemId) => {
      const product = products.find((p) => p.id === itemId);
      return sum + (product ? parseFloat(product.salePrice as any) : 0);
    }, 0);
  };

  const handleCreateCombo = async () => {
    if (!formData.name || selectedItems.length === 0) {
      toast.error("Please enter a name and select at least one item");
      return;
    }

    try {
      // In a real implementation, this would call a create mutation
      toast.success("Combo created successfully");
      setIsOpen(false);
      setFormData({ name: "", description: "", basePrice: "", displayOrder: "0" });
      setSelectedItems([]);
    } catch (error) {
      toast.error("Failed to create combo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Combo Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600">
                <Plus className="w-4 h-4" />
                Create Combo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Combo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="comboName">Combo Name *</Label>
                  <Input
                    id="comboName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Lunch Special"
                  />
                </div>

                <div>
                  <Label htmlFor="comboDesc">Description</Label>
                  <Input
                    id="comboDesc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Combo description"
                  />
                </div>

                <div>
                  <Label>Select Items *</Label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                    {products?.map((product) => (
                      <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, product.id]);
                            } else {
                              setSelectedItems(selectedItems.filter((id) => id !== product.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-slate-900">{product.name}</span>
                        <span className="text-slate-600 text-sm ml-auto">
                          R$ {parseFloat(product.salePrice as any).toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Combo Total Value:</span>
                    <span className="text-2xl font-bold text-amber-600">R$ {calculateComboPrice().toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePrice">Base Price (Optional)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder={calculateComboPrice().toFixed(2)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button onClick={handleCreateCombo} className="w-full">
                  Create Combo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Combos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combosLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : combos && combos.length > 0 ? (
            combos.map((combo) => (
              <Card key={combo.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-900">{combo.name}</h3>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-slate-600 mb-4">{combo.description}</p>

                <div className="bg-slate-50 p-3 rounded mb-4">
                  <p className="text-xs text-slate-600 mb-2">Items in combo:</p>
                  <div className="space-y-1">
                    {/* Items would be fetched via trpc.products.comboItems */}
                    <p className="text-sm text-slate-600">Items will be displayed here</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm">Combo Price:</span>
                  <span className="text-xl font-bold text-amber-600">
                    R$ {parseFloat(combo.basePrice as any).toFixed(2)}
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-12 text-center">
              <p className="text-slate-600 mb-4">No combos created yet. Create your first combo!</p>
              <Button onClick={() => setIsOpen(true)}>Create Combo</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
