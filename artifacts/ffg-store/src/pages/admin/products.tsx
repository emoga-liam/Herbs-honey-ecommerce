import { useState, useRef } from "react";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey, useListCategories } from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatNaira, getProductImage } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Upload, Link, ImageIcon } from "lucide-react";
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
  categoryId: number | null;
  minOrderQty: number;
}

const defaultForm: ProductFormData = {
  name: "", description: "", priceKobo: 50000, flavor: "original",
  type: "sachet", inStock: true, stockCount: 100, featured: false, imageUrl: null, categoryId: null, minOrderQty: 1,
};

function ImagePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value ?? "");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/uploads/image", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { imageUrl } = await res.json() as { imageUrl: string };
      onChange(imageUrl);
      setPreview(imageUrl);
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", description: "Try a different image or use a URL instead.", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { onChange(null); setPreview(null); return; }
    onChange(trimmed);
    setPreview(trimmed);
  };

  const handleClear = () => {
    onChange(null);
    setPreview(null);
    setUrlInput("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Label>Product Image</Label>

      {/* Preview */}
      {preview ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
          <img
            src={preview}
            alt="Product preview"
            className="max-h-full max-w-full object-contain"
            onError={() => setPreview(null)}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="w-full h-40 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageIcon className="h-8 w-8 opacity-40" />
          <span className="text-xs">No image selected</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-lg border border-border overflow-hidden text-sm">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors font-medium ${tab === "upload" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          <Upload className="h-3.5 w-3.5" /> From Device
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors font-medium ${tab === "url" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          <Link className="h-3.5 w-3.5" /> From URL
        </button>
      </div>

      {tab === "upload" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
            id="product-image-file"
          />
          <label
            htmlFor="product-image-file"
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-dashed border-border cursor-pointer hover:border-primary hover:bg-muted/40 transition-colors text-sm font-medium ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Tap to choose a photo"}
          </label>
          <p className="text-xs text-muted-foreground mt-1.5">Supports JPG, PNG, WebP · Max 10 MB</p>
        </div>
      )}

      {tab === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlApply(); } }}
            />
            <Button type="button" variant="outline" onClick={handleUrlApply} className="shrink-0">Apply</Button>
          </div>
          <p className="text-xs text-muted-foreground">Paste a direct image link from Google Drive, Cloudinary, Imgur, etc.</p>
        </div>
      )}
    </div>
  );
}

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
  const { data: categories = [] } = useListCategories();

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

            {/* Category — prominent at top */}
            <div className="col-span-2 space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Category
                {categories.length === 0 && (
                  <span className="text-xs text-amber-500">(create one in the Categories page first)</span>
                )}
              </Label>
              <select
                value={form.categoryId ?? ""}
                onChange={(e) => set("categoryId", e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              >
                <option value="">— No category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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
            <div className="space-y-1.5">
              <Label>Minimum Order Quantity</Label>
              <Input type="number" min={1} value={form.minOrderQty} onChange={(e) => set("minOrderQty", Math.max(1, Number(e.target.value)))} />
              <p className="text-xs text-muted-foreground">Customers must order at least this many units.</p>
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

          {/* Image picker */}
          <div className="pt-2 border-t border-border">
            <ImagePicker
              value={form.imageUrl}
              onChange={(url) => set("imageUrl", url)}
            />
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
  const { data: categories = [] } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<number | null | "uncategorised">(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
  };

  const handleSave = (form: ProductFormData) => {
    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data: form },
        { onSuccess: () => { refresh(); setEditProduct(null); toast({ title: "Product updated" }); }, onError: (e) => { console.error(e); toast({ title: "Error updating product", variant: "destructive" }); } }
      );
    } else {
      createProduct.mutate(
        { data: form },
        { onSuccess: () => { refresh(); setShowForm(false); toast({ title: "Product created" }); }, onError: () => toast({ title: "Error creating product", variant: "destructive" }) }
      );
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteProduct.mutate({ id }, { onSuccess: () => { refresh(); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) });
  };

  const saving = createProduct.isPending || updateProduct.isPending;

  const filteredProducts = categoryFilter === null
    ? products
    : categoryFilter === "uncategorised"
      ? products.filter((p) => !p.categoryId)
      : products.filter((p) => p.categoryId === categoryFilter);

  return (
    <AdminLayout title="Products">
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground text-sm">{filteredProducts.length} of {products.length} products</p>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 pb-5 border-b border-border">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${categoryFilter === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${categoryFilter === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
          {products.some((p) => !p.categoryId) && (
            <button
              onClick={() => setCategoryFilter("uncategorised")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${categoryFilter === "uncategorised" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              Uncategorised ({products.filter((p) => !p.categoryId).length})
            </button>
          )}
        </div>
      )}


      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-card border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
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
                    {product.categoryName && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{product.categoryName}</Badge>}
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
            categoryId: editProduct.categoryId ?? null,
            minOrderQty: editProduct.minOrderQty ?? 1,
          } : defaultForm}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}
