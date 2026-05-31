import { useState } from "react";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatNaira, getProductImage } from "@/lib/utils";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FLAVORS = ["original", "hibiscus", "ginger-lemon", "cinnamon-lemon"];
const TYPES = ["sachet", "box"];

interface ProductFormData {
  name: string;
  description: string;
  priceKobo: number;
  flavor: string;
  type: string;
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  imageUrl: string | null;
}

const defaultForm: ProductFormData = {
  name: "", description: "", priceKobo: 50000, flavor: "original",
  type: "sachet", inStock: true, stockCount: 100, featured: false, imageUrl: null,
};

function ProductFormModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: ProductFormData;
  onSave: (data: ProductFormData) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);

  const set = (key: keyof ProductFormData, val: string | boolean | number | null) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-serif font-bold text-xl">{initial.name ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onClose} className="p-1 hover:text-destructive transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Product Name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Hibiscus Honey" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Flavor</Label>
              <select value={form.flavor} onChange={(e) => set("flavor", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                {FLAVORS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Price (Naira)</Label>
              <Input type="number" value={form.priceKobo / 100} onChange={(e) => set("priceKobo", Math.round(Number(e.target.value) * 100))} />
            </div>
            <div className="space-y-1.5">
              <Label>Stock Count</Label>
              <Input type="number" value={form.stockCount} onChange={(e) => set("stockCount", Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="inStock" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} className="w-4 h-4 accent-primary" />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-primary" />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving || !form.name} className="flex-1">
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products = [], isLoading } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

  const handleSave = (form: ProductFormData) => {
    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data: form },
        { onSuccess: () => { refresh(); setEditProduct(null); toast({ title: "Product updated" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) }
      );
    } else {
      createProduct.mutate(
        { data: form },
        { onSuccess: () => { refresh(); setShowForm(false); toast({ title: "Product created" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) }
      );
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteProduct.mutate({ id }, { onSuccess: () => { refresh(); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  };

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <AdminLayout title="Products">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">{products.length} products</p>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-card border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const image = getProductImage(product.flavor, product.type, product.imageUrl);
            return (
              <div key={product.id} className="rounded-xl bg-card border border-border p-4 flex gap-3 hover:border-primary/20 transition-colors">
                <img src={image} alt={product.name} className="w-16 h-16 object-contain flex-shrink-0 rounded-lg bg-amber-50 p-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</h3>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setEditProduct(product)} className="p-1 hover:text-primary transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-1 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary mb-1">{formatNaira(product.priceKobo)}</div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{product.flavor}</Badge>
                    <Badge variant="outline" className="text-xs">{product.type}</Badge>
                    {!product.inStock && <Badge variant="destructive" className="text-xs">Out of stock</Badge>}
                    {product.featured && <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">Featured</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showForm || editProduct) && (
        <ProductFormModal
          initial={editProduct ? {
            name: editProduct.name,
            description: editProduct.description,
            priceKobo: editProduct.priceKobo,
            flavor: editProduct.flavor,
            type: editProduct.type,
            inStock: editProduct.inStock,
            stockCount: editProduct.stockCount,
            featured: editProduct.featured,
            imageUrl: editProduct.imageUrl ?? null,
          } : defaultForm}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}
