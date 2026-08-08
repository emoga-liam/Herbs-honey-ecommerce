import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { formatNaira, getProductImage } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPriceKobo, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container max-w-screen-xl mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-30" />
          <h2 className="font-serif font-bold text-3xl mb-3 text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Discover our delicious herbs-infused honey varieties.</p>
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-screen-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif font-bold text-4xl text-foreground">
            Your Cart <span className="text-muted-foreground text-2xl font-normal">({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
          </h1>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            Clear all
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const image = getProductImage(item.flavor ?? "", item.productType, item.imageUrl);
              return (
                <div key={item.productId} className="flex gap-4 p-4 rounded-xl bg-card border border-border/60 hover:border-primary/20 transition-all">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-amber-50 flex items-center justify-center p-2">
                    <img
                      src={image}
                      alt={item.productName}
                      width={80}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-base leading-tight">{item.productName}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {item.productType === "box" ? "Box (30pcs)" : "Sachet (15ml)"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 p-1"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 rounded-lg border border-border">
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{formatNaira(item.priceKobo * item.quantity)}</div>
                        <div className="text-xs text-muted-foreground">{formatNaira(item.priceKobo)} each</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-card border border-border p-6 sticky top-20">
              <h2 className="font-serif font-bold text-xl mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
                    <span className="font-medium">{formatNaira(item.priceKobo * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">{formatNaira(totalPriceKobo)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Delivery fee calculated at checkout</p>
              </div>
              <Button asChild size="lg" className="w-full font-bold gap-2">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full mt-3">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
