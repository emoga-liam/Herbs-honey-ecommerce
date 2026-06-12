import { useState, useRef, useId } from "react";
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  getListProductsQueryKey, useListCategories,
} from "@workspace/api-client-react";
import type { Product, ProductImageInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatNaira, getProductImage } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, X, Upload, Link as LinkIcon,
  ImageIcon, ChevronLeft, ChevronRight, Star,
} from "lucide-react";
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
  images: ProductImageInput[];
}

const defaultForm: ProductFormData = {
  name: "", description: "", priceKobo: 50000, flavor: "original",
  type: "sachet", inStock: true, stockCount: 100, featured: false,
  imageUrl: null, categoryId: null, minOrderQty: 1, images: [],
};

// ─── Multi-image manager ──────────────────────────────────────────────────────

function MultiImageManager({
  images,
  onChange,
}: {
  images: ProductImageInput[];
  onChange: (imgs: ProductImageInput[]) => void;
}) {
  const { toast } = useToast();
  const uploadRef = useRef<HTMLInputElement>(null);
  const addUploadRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [addTab, setAddTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const uid = useId();

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/uploads/image", { method: "POST", credentials: "include", body: fd });
    if (!res.ok) return null;
    const { imageUrl } = await res.json() as { imageUrl: string };
    return imageUrl;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        if (url) urls.push(url);
      }
      if (urls.length > 0) {
        onChange([
          ...images,
          ...urls.map((imageUrl, i) => ({ imageUrl, sortOrder: images.length + i })),
        ]);
        toast({ title: `${urls.length} image${urls.length > 1 ? "s" : ""} added` });
      } else {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (uploadRef.current) uploadRef.current.value = "";
      if (addUploadRef.current) addUploadRef.current.value = "";
    }
  };

  const handleUrlAdd = () => {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...images, { imageUrl: url, sortOrder: images.length }]);
    setUrlInput("");
  };

  const remove = (idx: number) => {
    const next = images.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sortOrder: i }));
    onChange(next);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...images];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  };

  const setMain = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Product Images</Label>
        {images.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""} · first is the cover
          </span>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 ${idx === 0 ? "border-primary" : "border-border"} bg-muted aspect-square`}>
              <img
                src={img.imageUrl}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-contain p-1"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = ""; }}
              />
              {/* Cover badge */}
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5" /> Cover
                </div>
              )}
              {/* Controls (visible on hover) */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded-full bg-background/80 hover:bg-background disabled:opacity-30"
                    title="Move left"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === images.length - 1}
                    className="p-1 rounded-full bg-background/80 hover:bg-background disabled:opacity-30"
                    title="Move right"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setMain(idx)}
                    className="text-[10px] bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-semibold"
                  >
                    Set as Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 rounded-full bg-destructive text-destructive-foreground hover:opacity-80"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more tile */}
          <label
            htmlFor={`${uid}-more`}
            className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-1 text-muted-foreground cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
          >
            <Plus className="h-5 w-5 opacity-50" />
            <span className="text-[10px] font-medium">Add more</span>
            <input
              id={`${uid}-more`}
              ref={addUploadRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-30" />
          <p className="text-sm text-muted-foreground mb-3">No images yet</p>

          {/* Add-image tabs */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs mb-3 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setAddTab("upload")}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 font-medium transition-colors ${addTab === "upload" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <Upload className="h-3 w-3" /> Device
            </button>
            <button
              type="button"
              onClick={() => setAddTab("url")}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 font-medium transition-colors ${addTab === "url" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <LinkIcon className="h-3 w-3" /> URL
            </button>
          </div>

          {addTab === "upload" ? (
            <>
              <input
                ref={uploadRef}
                id={`${uid}-upload`}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <label
                htmlFor={`${uid}-upload`}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Upload className="h-3.5 w-3.5" />
                {uploading ? "Uploading…" : "Choose Photos"}
              </label>
              <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG, WebP · Max 10 MB each</p>
            </>
          ) : (
            <div className="flex gap-2 max-w-xs mx-auto">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://…/image.jpg"
                className="text-xs h-8"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlAdd(); } }}
              />
              <Button type="button" size="sm" onClick={handleUrlAdd} className="shrink-0">Add</Button>
            </div>
          )}
        </div>
      )}

      {/* When images exist, also show URL add option below */}
      {images.length > 0 && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste an image URL and press Add"
            className="text-xs h-8"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUrlAdd(); } }}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleUrlAdd} className="shrink-0">Add URL</Button>
        </div>
      )}
    </div>
  );
}

// ─── Product form modal ───────────────────────────────────────────────────────

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

  const set = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-serif font-bold text-xl">{initial.name ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onClose} className="p-1 hover:text-destructive transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Product Name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Hibiscus Honey" />
            </div>

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
              <Input type="number" value={form.priceKobo / 100}
                onChange={(e) => set("priceKobo", Math.round(Number(e.target.value) * 100))} />
            </div>
            <div className="space-y-1.5">
              <Label>Stock Count</Label>
              <Input type="number" value={form.stockCount}
                onChange={(e) => set("stockCount", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Minimum Order Quantity</Label>
              <Input type="number" min={1} value={form.minOrderQty}
                onChange={(e) => set("minOrderQty", Math.max(1, Number(e.target.value)))} />
              <p className="text-xs text-muted-foreground">Customers must order at least this many units.</p>
            </div>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="inStock" checked={form.inStock}
                  onChange={(e) => set("inStock", e.target.checked)} className="w-4 h-4 accent-primary" />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-primary" />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>

          {/* Multi-image manager */}
          <div className="pt-2 border-t border-border">
            <MultiImageManager
              images={form.images}
              onChange={(imgs) => set("images", imgs)}
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

// ─── Main page ────────────────────────────────────────────────────────────────

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
    const payload = {
      name: form.name,
      description: form.description,
      priceKobo: form.priceKobo,
      flavor: form.flavor,
      type: form.type,
      inStock: form.inStock,
      stockCount: form.stockCount,
      featured: form.featured,
      imageUrl: form.images.length > 0 ? form.images[0].imageUrl : form.imageUrl,
      categoryId: form.categoryId,
      minOrderQty: form.minOrderQty,
      images: form.images,
    };

    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data: payload },
        {
          onSuccess: () => { refresh(); setEditProduct(null); toast({ title: "Product updated" }); },
          onError: (e) => { console.error(e); toast({ title: "Error updating product", variant: "destructive" }); },
        }
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => { refresh(); setShowForm(false); toast({ title: "Product created" }); },
          onError: () => toast({ title: "Error creating product", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteProduct.mutate(
      { id },
      { onSuccess: () => { refresh(); toast({ title: "Deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) }
    );
  };

  const saving = createProduct.isPending || updateProduct.isPending;

  const filteredProducts = categoryFilter === null
    ? products
    : categoryFilter === "uncategorised"
      ? products.filter((p) => !p.categoryId)
      : products.filter((p) => p.categoryId === categoryFilter);

  return (
    <AdminLayout title="Products">
      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${categoryFilter === null ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${categoryFilter === cat.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
          {products.some((p) => !p.categoryId) && (
            <button
              onClick={() => setCategoryFilter("uncategorised")}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${categoryFilter === "uncategorised" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
            >
              Uncategorised ({products.filter((p) => !p.categoryId).length})
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-muted-foreground text-sm">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </p>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-60 bg-card border rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-card border border-border">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const coverImage = product.images.length > 0
              ? product.images[0].imageUrl
              : getProductImage(product.flavor, product.type, product.imageUrl);
            return (
              <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
                {/* Image strip */}
                <div className="relative h-40 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                  <img src={coverImage} alt={product.name} className="max-h-full max-w-full object-contain p-3" />
                  {product.images.length > 1 && (
                    <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">
                      +{product.images.length - 1} more
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="destructive" className="absolute top-2 left-2 text-xs">Out of stock</Badge>
                  )}
                  {product.featured && (
                    <Badge className="absolute top-2 right-2 text-xs bg-amber-500 hover:bg-amber-500">Featured</Badge>
                  )}
                </div>
                {/* Info */}
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                  <div className="text-sm font-bold text-primary">{formatNaira(product.priceKobo)}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{product.description}</p>
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    <Badge variant="outline" className="text-xs capitalize">{product.flavor}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{product.type}</Badge>
                    {product.categoryName && <Badge variant="secondary" className="text-xs">{product.categoryName}</Badge>}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2 p-3 pt-0">
                  <Button
                    variant="outline" size="sm" className="flex-1 gap-1"
                    onClick={() => setEditProduct(product)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline" size="sm" className="hover:text-destructive hover:border-destructive"
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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
            images: editProduct.images.map((img) => ({ imageUrl: img.imageUrl, sortOrder: img.sortOrder })),
          } : defaultForm}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}
