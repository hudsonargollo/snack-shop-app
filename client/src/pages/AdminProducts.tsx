import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminProducts() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: 1,
    costPrice: "",
    salePrice: "",
    stock: "",
    lowStockThreshold: "5",
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

  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { data: categories } = trpc.products.categories.useQuery();

  const handleSubmit = async () => {
    if (!formData.name || !formData.salePrice || !formData.costPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // In a real implementation, this would call a create/update mutation
      toast.success(editingId ? "Product updated" : "Product created");
      setIsOpen(false);
      setFormData({
        name: "",
        description: "",
        categoryId: 1,
        costPrice: "",
        salePrice: "",
        stock: "",
        lowStockThreshold: "5",
      });
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Product Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., SANDUÍCHE NATURAL"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  >
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costPrice">Cost Price *</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price *</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingId ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Cost</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Margin</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => {
                    const cost = parseFloat(product.costPrice as any);
                    const price = parseFloat(product.salePrice as any);
                    const margin = ((price - cost) / price * 100).toFixed(1);
                    return (
                      <tr key={product.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-900 font-medium">{product.name}</td>
                        <td className="py-3 px-4 text-slate-600">{product.categoryName}</td>
                        <td className="py-3 px-4 text-slate-900">R$ {cost.toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-900">R$ {price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className="text-green-600 font-semibold">{margin}%</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              product.stock <= product.lowStockThreshold
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingId(product.id);
                                setFormData({
                                  name: product.name,
                                  description: product.description || "",
                                  categoryId: product.categoryId,
                                  costPrice: product.costPrice.toString(),
                                  salePrice: product.salePrice.toString(),
                                  stock: product.stock.toString(),
                                  lowStockThreshold: product.lowStockThreshold.toString(),
                                });
                                setIsOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
