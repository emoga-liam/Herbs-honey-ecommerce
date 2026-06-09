import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useListCategories,
  useListProducts,
  useUpdateProduct,
  getListProductsQueryKey,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PackagePlus, X, Tag, Plus, Loader2 } from "lucide-react";
import { formatNaira, getProductImage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function ProductCard({
  product,
  action,
  onAction,
  pending,
}: {
  product: Product;
  action: "remove" | "add";
  onAction: () => void;
  pending: boolean;
}) {
  const image = getProductImage(product.flavor, product.type, product.imageUrl);
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card border border-border p-3 hover:border-primary/20 transition-colors">
      <img src={image} alt={product.name} className="w-12 h-12 object-contain flex-shrink-0 rounded-lg bg-amber-50 p-1" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight line-clamp-1">{product.name}</p>
        <p className="text-xs text-muted-foreground">{formatNaira(product.priceKobo)} · {product.flavor} · {product.type}</p>
        {!product.inStock && <Badge variant="destructive" className="text-xs mt-0.5">Out of stock</Badge>}
      </div>
      <Button
        variant={action === "remove" ? "outline" : "default"}
        size="sm"
        onClick={onAction}
        disabled={pending}
        className={`shrink-0 gap-1.5 ${action === "remove" ? "hover:border-destructive hover:text-destructive" : ""}`}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : action === "remove" ? (
          <><X className="h-3.5 w-3.5" /> Remove</>
        ) : (
          <><Plus className="h-3.5 w-3.5" /> Add</>
        )}
      </Button>
    </div>
  );
}

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const categoryId = Number(params.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [] } = useListCategories();
  const { data: products = [], isLoading: productsLoading } = useListProducts();
  const updateProduct = useUpdateProduct();

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const category = categories.find((c) => c.id === categoryId);
  const inCategory = products.filter((p) => p.categoryId === categoryId);
  const notInCategory = products.filter((p) => p.categoryId !== categoryId);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
  };

  const assignProduct = (product: Product, assign: boolean) => {
    setPendingId(product.id);
    updateProduct.mutate(
      { id: product.id, data: { categoryId: assign ? categoryId : null } },
      {
        onSuccess: () => {
          refresh();
          setPendingId(null);
          toast({ title: assign ? `Added "${product.name}"` : `Removed "${product.name}"` });
        },
        onError: () => {
          setPendingId(null);
          toast({ title: "Something went wrong", variant: "destructive" });
        },
      }
    );
  };

  if (!category && categories.length > 0) {
    return (
      <AdminLayout title="Category not found">
        <div className="text-center py-20">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold text-lg mb-2">Category not found</h3>
          <Button asChild variant="outline"><Link href="/admin/categories">Back to Categories</Link></Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={category?.name ?? "Category"}>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 text-muted-foreground">
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4 mr-1" /> All Categories
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-2xl flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              {category?.name ?? "…"}
            </h2>
            {category?.description && (
              <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
            )}
          </div>
          <Button
            onClick={() => setShowAddPanel((v) => !v)}
            className="gap-2 shrink-0"
            variant={showAddPanel ? "outline" : "default"}
          >
            <PackagePlus className="h-4 w-4" />
            {showAddPanel ? "Done Adding" : "Add Products"}
          </Button>
        </div>
      </div>

      {/* Add products panel */}
      {showAddPanel && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold mb-3 text-primary">
            Products not in this category — click Add to include them:
          </p>
          {notInCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">All products are already in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {notInCategory.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  action="add"
                  onAction={() => assignProduct(p, true)}
                  pending={pendingId === p.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products in this category */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold">Products in this category</h3>
          <Badge variant="outline">{inCategory.length}</Badge>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card border rounded-xl animate-pulse" />)}
          </div>
        ) : inCategory.length === 0 ? (
          <div className="text-center py-14 rounded-xl bg-card border border-dashed border-border">
            <PackagePlus className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground text-sm mb-3">No products in this category yet.</p>
            <Button onClick={() => setShowAddPanel(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inCategory.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                action="remove"
                onAction={() => assignProduct(p, false)}
                pending={pendingId === p.id}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
