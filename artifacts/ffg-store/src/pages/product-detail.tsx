import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira, getProductImage } from "@/lib/utils";
import { Minus, Plus, ShoppingBag, ArrowLeft, CheckCircle } from "lucide-react";

const FLAVOR_COLORS: Record<string, string> = {
  hibiscus: "bg-red-100 text-red-800 border-red-200",
  "ginger-lemon": "bg-green-100 text-green-800 border-green-200",
  "cinnamon-lemon": "bg-purple-100 text-purple-800 border-purple-200",
  original: "bg-amber-100 text-amber-800 border-amber-200",
};

const FLAVOR_BENEFITS: Record<string, string[]> = {
  hibiscus: ["Supports heart health", "Helps regulate blood pressure", "Rich in antioxidants"],
  "ginger-lemon": ["Boosts digestion", "Eases bloating", "Natural anti-inflammatory"],
  "cinnamon-lemon": ["Supports blood sugar balance", "Warming and aromatic", "Great for metabolism"],
  original: ["Natural sweetener", "Healthier than sugar", "Pure unprocessed honey"],
};

const USES = ["Morning Tea", "Topping for Yoghurt", "Spread on Bread & Cereals", "Cocktail Mixer"];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const { data: product, isLoading, isError } = useGetProduct(numId, {
    query: { enabled: !!numId, queryKey: getGetProductQueryKey(numId) },
  });
  const { addToCart, items } = useCart();
  const minQty = product?.minOrderQty ?? 1;
  const [quantity, setQuantity] = useState(minQty);
  const [added, setAdded] = useState(false);

  // keep quantity in sync when product loads and has a min > 1
  React.useEffect(() => {
    setQuantity((q) => Math.max(q, minQty));
  }, [minQty]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-screen-xl mx-auto px-4 py-16 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container max-w-screen-xl mx-auto px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Product not found</h2>
          <Button asChild><Link href="/products">Browse All Products</Link></Button>
        </div>
      </Layout>
    );
  }

  const image = getProductImage(product.flavor, product.type, product.imageUrl);
  const flavorLabel = product.flavor.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const benefits = FLAVOR_BENEFITS[product.flavor] ?? [];
  const inCart = items.find(i => i.productId === product.id);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      productType: product.type,
      priceKobo: product.priceKobo,
      quantity,
      imageUrl: image,
      flavor: product.flavor,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Layout>
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 flex items-center justify-center p-10">
              <img src={image} alt={product.name} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
            </div>
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center">
                <Badge className="text-base px-6 py-2 bg-destructive text-destructive-foreground">Out of Stock</Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={FLAVOR_COLORS[product.flavor] ?? ""}>
                  {flavorLabel}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {product.type === "box" ? "30 Pieces" : "15ml Sachet"}
                </Badge>
              </div>
              <h1 className="font-serif font-bold text-4xl text-foreground mb-2">{product.name}</h1>
              <div className="text-3xl font-bold text-primary">{formatNaira(product.priceKobo)}</div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-base">{product.description}</p>

            {benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Benefits</h3>
                <ul className="space-y-2">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Perfect for</h3>
              <div className="flex flex-wrap gap-2">
                {USES.map((use) => (
                  <span key={use} className="text-xs rounded-full bg-muted px-3 py-1 text-muted-foreground">{use}</span>
                ))}
              </div>
            </div>

            {product.inStock && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quantity</span>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setQuantity(q => Math.max(minQty, q - 1))}
                      disabled={quantity <= minQty}
                      className="h-10 w-10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setQuantity(q => q + 1)}
                      className="h-10 w-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatNaira(product.priceKobo * quantity)} total</span>
                </div>

                {minQty > 1 && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    Minimum order: <strong>{minQty} units</strong>
                  </p>
                )}

                <div className="flex gap-3">
                  <Button size="lg" className="flex-1 font-semibold gap-2" onClick={handleAddToCart} disabled={added}>
                    {added ? (
                      <><CheckCircle className="h-4 w-4" /> Added to Cart</>
                    ) : (
                      <><ShoppingBag className="h-4 w-4" /> Add to Cart</>
                    )}
                  </Button>
                  {inCart && (
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/cart">View Cart ({inCart.quantity})</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                <Link href="/products"><ArrowLeft className="h-4 w-4 mr-2" />Back to All Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
