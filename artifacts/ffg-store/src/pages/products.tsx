import { useState } from "react";
import { useSearch } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

const FLAVORS = [
  { value: "", label: "All Flavors" },
  { value: "original", label: "Original" },
  { value: "hibiscus", label: "Hibiscus" },
  { value: "ginger-lemon", label: "Ginger Lemon" },
  { value: "cinnamon-lemon", label: "Cinnamon Lemon" },
];

const TYPES = [
  { value: "", label: "All Types" },
  { value: "sachet", label: "Sachets (15ml)" },
  { value: "box", label: "Boxes (30pcs)" },
];

export default function ProductsPage() {
  const queryString = useSearch();
  const params = new URLSearchParams(queryString);
  const [flavor, setFlavor] = useState(params.get("flavor") ?? "");
  const [type, setType] = useState(params.get("type") ?? "");
  const [search, setSearch] = useState("");

  const { data: allProducts = [], isLoading } = useListProducts(
    { flavor: flavor || undefined, type: type || undefined },
    { query: { queryKey: ["products", flavor, type] } }
  );

  const products = search.trim()
    ? allProducts.filter((p) => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      })
    : allProducts;

  return (
    <Layout>
      <div className="container max-w-screen-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-4xl text-foreground mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">Premium herbs-infused honey — crafted naturally, delivered fresh.</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 max-w-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-border">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">Flavor</span>
            <div className="flex flex-wrap gap-2">
              {FLAVORS.map((f) => (
                <Button
                  key={f.value}
                  size="sm"
                  variant={flavor === f.value ? "default" : "outline"}
                  onClick={() => setFlavor(f.value)}
                  className="text-sm"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">Type</span>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <Button
                  key={t.value}
                  size="sm"
                  variant={type === t.value ? "default" : "outline"}
                  onClick={() => setType(t.value)}
                  className="text-sm"
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{products.length} product{products.length !== 1 ? "s" : ""} found</span>
            {(flavor || type || search) && (
              <Button variant="ghost" size="sm" onClick={() => { setFlavor(""); setType(""); setSearch(""); }} className="text-xs">
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="rounded-xl bg-card border animate-pulse h-80" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🍯</div>
            <h3 className="font-serif font-bold text-xl mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            <Button onClick={() => { setFlavor(""); setType(""); }}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
