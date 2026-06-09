import { useState } from "react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useListProducts, getListCategoriesQueryKey } from "@workspace/api-client-react";
import type { Category } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, X, Tag, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryForm { name: string; description: string; }
const defaultForm: CategoryForm = { name: "", description: "" };

function CategoryModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: CategoryForm & { id?: number };
  onSave: (data: CategoryForm) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<CategoryForm>({ name: initial.name, description: initial.description });
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-serif font-bold text-xl">{initial.id ? "Edit Category" : "Add Category"}</h3>
          <button onClick={onClose} className="p-1 hover:text-destructive transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Category Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Honey Products, Skincare..."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this category..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={saving || !form.name.trim()} className="flex-1">
            {saving ? "Saving..." : "Save Category"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: categories = [], isLoading } = useListCategories();
  const { data: products = [] } = useListProducts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });

  const handleSave = (form: CategoryForm) => {
    if (editCat) {
      updateCategory.mutate(
        { id: editCat.id, data: form },
        { onSuccess: () => { refresh(); setEditCat(null); toast({ title: "Category updated" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) }
      );
    } else {
      createCategory.mutate(
        { data: form },
        { onSuccess: () => { refresh(); setShowForm(false); toast({ title: "Category created" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) }
      );
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will become uncategorised.`)) return;
    deleteCategory.mutate(
      { id },
      { onSuccess: () => { refresh(); toast({ title: "Category deleted" }); }, onError: () => toast({ title: "Error", variant: "destructive" }) }
    );
  };

  const saving = createCategory.isPending || updateCategory.isPending;

  return (
    <AdminLayout title="Categories">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">
          {categories.length} {categories.length === 1 ? "category" : "categories"} — used to organise your products.
        </p>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-card border rounded-xl animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-card border border-border">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold text-lg mb-1">No categories yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first category to organise products. You can assign categories when editing a product.
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/30 transition-colors group">
                {/* Clickable main area */}
                <Link href={`/admin/categories/${cat.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                  <Tag className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                    {count} {count === 1 ? "product" : "products"}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0 group-hover:text-foreground transition-colors" />
                </Link>

                {/* Edit / Delete — stop propagation so clicking these doesn't navigate */}
                <div className="flex items-center gap-1 shrink-0 border-l border-border pl-3 ml-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); setEditCat(cat); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={(e) => { e.preventDefault(); handleDelete(cat.id, cat.name); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showForm || editCat) && (
        <CategoryModal
          initial={editCat ? { id: editCat.id, name: editCat.name, description: editCat.description } : defaultForm}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditCat(null); }}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}
